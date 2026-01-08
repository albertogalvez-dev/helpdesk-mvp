import time
from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal
from app.modules.tickets.models import Ticket, TicketStatus, Assignment
from app.modules.sla.models import TicketSLA
from app.modules.audit.models import AuditLog
from app.modules.users.models import User
from app.core.security import Role
from app.core.config import get_settings
from app.modules.reports.models import WeeklyReportSnapshot
from sqlalchemy import func

settings = get_settings()

def sla_escalation_job():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # 1. Breaches
        # Find TicketSLAs where due < now AND met=False AND breached=False
        
        # First Response Breach
        fr_breaches = db.query(TicketSLA).filter(
            TicketSLA.first_response_due_at < now,
            TicketSLA.first_response_met == False,
            TicketSLA.first_response_breached == False
        ).all()
        
        for sla in fr_breaches:
            sla.first_response_breached = True
            
        # Resolution Breach
        res_breaches = db.query(TicketSLA).filter(
            TicketSLA.resolution_due_at < now,
            TicketSLA.resolution_met == False,
            TicketSLA.resolution_breached == False
        ).all()
        
        for sla in res_breaches:
            sla.resolution_breached = True
            
        db.commit()
        
        # 2. Escalation
        # Find TicketSLAs with ANY breach AND escalated_level < 2 AND Ticket Status IN (NEW, OPEN, PENDING)
        # We need to join Ticket to check status
        breached_slas = db.query(TicketSLA).join(Ticket).filter(
            (TicketSLA.first_response_breached == True) | (TicketSLA.resolution_breached == True),
            TicketSLA.escalated_level < 2,
            Ticket.status.in_([TicketStatus.NEW, TicketStatus.OPEN, TicketStatus.PENDING])
        ).all()
        
        for sla in breached_slas:
            # Escalate
            sla.escalated_level += 1
            ticket = db.query(Ticket).get(sla.ticket_id)
            
            # Update Priority
            if sla.escalated_level == 1:
                ticket.priority = "HIGH"
            elif sla.escalated_level == 2:
                ticket.priority = "URGENT"
            
            # Reassign logical
            # Find least loaded agent in workspace
            agents = db.query(User).filter(
                User.workspace_id == sla.workspace_id,
                User.role.in_([Role.AGENT, Role.ADMIN]),
                User.is_active == True
            ).all()
            
            best_agent = None
            min_load = float('inf')
            
            for agent in agents:
                load = db.query(Ticket).filter(
                    Ticket.assigned_agent_id == agent.id,
                    Ticket.status.in_([TicketStatus.NEW, TicketStatus.OPEN, TicketStatus.PENDING])
                ).count()
                if load < min_load:
                    min_load = load
                    best_agent = agent
            
            if best_agent and best_agent.id != ticket.assigned_agent_id:
                ticket.assigned_agent_id = best_agent.id
                
                # Record Assignment
                assign_history = Assignment(
                    ticket_id=ticket.id,
                    assigned_agent_id=best_agent.id,
                    workspace_id=ticket.workspace_id,
                    assigned_by_user_id=best_agent.id # System action attributed to new assignee
                )
                db.add(assign_history)
                
            # Audit Log
            audit = AuditLog(
                workspace_id=sla.workspace_id,
                entity_type="ticket",
                entity_id=ticket.id,
                action="sla_escalated",
                meta={"level": sla.escalated_level, "priority": ticket.priority}
            )
            db.add(audit)
            
        db.commit()
            
    finally:
        db.close()

def auto_close_job():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=settings.auto_close_days)
        
        tickets_to_close = db.query(Ticket).filter(
            Ticket.status == TicketStatus.RESOLVED,
            Ticket.updated_at < cutoff # Using updated_at as proxy for activity if last_customer_activity_at is complex or usually updated on resolve.
            # Ideally use last_customer_activity_at but we need to ensure it's set. 
            # Prompt says "last_customer_activity_at < now - X days".
        ).all()
        
        # If we use last_customer_activity_at, make sure it's reliable.
        # Fallback to updated_at if None?
        
        for ticket in tickets_to_close:
            # Check last activity explicitly if needed
            last_act = ticket.last_customer_activity_at or ticket.updated_at
            if last_act < cutoff:
                ticket.status = TicketStatus.CLOSED
                # ticket.closed_at = now # If model has closed_at? Assuming yes or just status.
                # Audit
                audit = AuditLog(
                    workspace_id=ticket.workspace_id,
                    entity_type="ticket",
                    entity_id=ticket.id,
                    action="auto_closed"
                )
                db.add(audit)
                
                # Check SLA resolution met?
                # If resolution_met was false, and now it's closed?
                # Usually resolution met happens on RESOLVED.
                # If it was resolved on time, met is true.
                # Auto close just confirms it.
        
        db.commit()
    finally:
        db.close()

def weekly_report_job():
    db = SessionLocal()
    try:
        # Calculate start of this week (Monday)
        today = datetime.now(timezone.utc).date()
        start_of_week = today - timedelta(days=today.weekday()) # Monday = 0
        
        # Group by workspace? Or iterate workspaces?
        # Iterate all users/workspaces? Better grouping query.
        # Simple MVP: Iterate workspaces.
        from app.modules.workspaces.models import Workspace
        workspaces = db.query(Workspace).all()
        
        for ws in workspaces:
            # Check if snapshot exists
            exists = db.query(WeeklyReportSnapshot).filter_by(
                workspace_id=ws.id,
                week_start_date=start_of_week
            ).first()
            
            if exists:
                continue
                
            # Calculate metrics
            # created tickets
            created_count = db.query(Ticket).filter(
                Ticket.workspace_id == ws.id,
                Ticket.created_at >= datetime.combine(start_of_week, datetime.min.time(), tzinfo=timezone.utc)
            ).count()
            
            resolved_count = db.query(Ticket).filter(
                Ticket.workspace_id == ws.id,
                Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
                Ticket.updated_at >= datetime.combine(start_of_week, datetime.min.time(), tzinfo=timezone.utc) # Approx
            ).count()
            
            breaches_fr = db.query(TicketSLA).filter(
                TicketSLA.workspace_id == ws.id,
                TicketSLA.first_response_breached == True,
                TicketSLA.updated_at >= datetime.combine(start_of_week, datetime.min.time(), tzinfo=timezone.utc) # Approx time of breach?
            ).count()
            
            snapshot = WeeklyReportSnapshot(
                workspace_id=ws.id,
                week_start_date=start_of_week,
                payload={
                    "tickets_created": created_count,
                    "tickets_resolved": resolved_count,
                    "sla_breaches": breaches_fr
                }
            )
            db.add(snapshot)
            
        db.commit()
        
    finally:
        db.close()

from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import Role
from app.modules.auth.deps import require_roles
from app.common.responses import APIResponse
from app.modules.users.models import User
from app.modules.reports.models import WeeklyReportSnapshot
from app.modules.sla.models import TicketSLA
from app.modules.tickets.models import Ticket, TicketStatus
# Need query logic like in jobs.

router = APIRouter()

@router.get("/weekly", response_model=APIResponse[dict])
def get_weekly_report(
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    # Retrieve latest snapshot or calculate on demand
    # For MVP: On demand claculation for "this week" (since Monday)
    from datetime import datetime, timezone, timedelta
    
    today = datetime.now(timezone.utc).date()
    start_of_week = today - timedelta(days=today.weekday())
    
    # Check snapshot?
    snapshot = db.query(WeeklyReportSnapshot).filter_by(
        workspace_id=user.workspace_id,
        week_start_date=start_of_week
    ).first()
    
    if snapshot:
        return APIResponse(data=snapshot.payload)
        
    # Calculate
    dt_start = datetime.combine(start_of_week, datetime.min.time(), tzinfo=timezone.utc)
    
    created_count = db.query(Ticket).filter(
        Ticket.workspace_id == user.workspace_id,
        Ticket.created_at >= dt_start
    ).count()
    
    resolved_count = db.query(Ticket).filter(
        Ticket.workspace_id == user.workspace_id,
        Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
        Ticket.updated_at >= dt_start
    ).count()
    
    breaches = db.query(TicketSLA).filter(
        TicketSLA.workspace_id == user.workspace_id,
        (TicketSLA.first_response_breached == True) | (TicketSLA.resolution_breached == True),
        TicketSLA.updated_at >= dt_start
    ).count()
    
    # Leaderboard (Top Agent by resolved)
    # Group by assigned_agent_id
    from sqlalchemy import func, desc
    top_agents_res = db.query(Ticket.assigned_agent_id, func.count(Ticket.id).label('count')).filter(
        Ticket.workspace_id == user.workspace_id,
        Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
        Ticket.updated_at >= dt_start,
        Ticket.assigned_agent_id != None
    ).group_by(Ticket.assigned_agent_id).order_by(desc('count')).limit(5).all()
    
    top_agents = [{"agent_id": str(r[0]), "resolved": r[1]} for r in top_agents_res]
    
    data = {
        "tickets_created": created_count,
        "tickets_resolved": resolved_count,
        "sla_breaches": breaches,
        "agent_leaderboard": top_agents
    }
    
    return APIResponse(data=data)

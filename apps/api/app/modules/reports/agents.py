from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db.session import get_db
from app.core.security import Role
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.tickets.models import Ticket, TicketStatus, TicketMessage
from app.modules.sla.models import TicketSLA
from app.common.responses import APIResponse

router = APIRouter()

@router.get("/summary", response_model=APIResponse[dict])
def get_my_stats(
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    
    # 1. My Open Assigned
    open_count = db.query(Ticket).filter(
        Ticket.assigned_agent_id == user.id,
        Ticket.status.in_([TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.NEW])
    ).count()
    
    # 2. Resolved This Week
    resolved_count = db.query(Ticket).filter(
        Ticket.assigned_agent_id == user.id,
        Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
        Ticket.updated_at >= one_week_ago # Proxy for resolution time if we don't track state change events explicitly
    ).count()
    
    # 3. Breaches involved (Assigned to ticket that breached)
    # Joining TicketSLA -> Ticket
    breach_count = db.query(TicketSLA).join(Ticket).filter(
        Ticket.assigned_agent_id == user.id,
        (TicketSLA.first_response_breached == True) | (TicketSLA.resolution_breached == True),
        TicketSLA.created_at >= one_week_ago
    ).count()
    
    stats = {
        "my_open_assigned": open_count,
        "my_resolved_this_week": resolved_count,
        "my_sla_breaches_this_week": breach_count,
        "my_avg_first_response_minutes": 0 # TODO: Calculate complex avg if needed
    }
    
    return APIResponse(data=stats)


@router.get("/leaderboard", response_model=APIResponse[list[dict]])
def get_leaderboard(
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    # Top Agents by Resolved Tickets (All time or this week? Let's do all time for demo data density)
    # Group by assigned_agent_id
    
    results = db.query(
        User.id,
        User.full_name,
        func.count(Ticket.id).label("resolved_count")
    ).join(Ticket, Ticket.assigned_agent_id == User.id)\
     .filter(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]))\
     .group_by(User.id)\
     .order_by(desc("resolved_count"))\
     .limit(5)\
     .all()
     
    data = []
    for r in results:
        data.append({
            "agent_id": r.id,
            "name": r.full_name,
            "score": r.resolved_count,
            "metric": "Resolved Tickets"
        })
        
    return APIResponse(data=data)

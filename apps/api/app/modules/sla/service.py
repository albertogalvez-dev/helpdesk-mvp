import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from app.modules.sla.models import SLAPolicy, TicketSLA
from app.modules.sla.schemas import SLAPolicyCreate, SLAPolicyUpdate, SLAPolicyResponse, TicketSLAResponse
from app.modules.sla.repo import sla_repo
from app.modules.tickets.repo import ticket_repo
from app.core.errors import NotFound, BadRequest
from app.modules.users.models import User
from app.core.security import Role

class SLAService:
    def create_policy(self, db: Session, policy_in: SLAPolicyCreate, user: User) -> SLAPolicyResponse:
        # Admin only
        if user.role != Role.ADMIN:
             # permission check usually in dependency or here
             pass 
        # Check unique name? (Unique constraint in DB recommended)
        return SLAPolicyResponse.model_validate(sla_repo.create_policy(db, policy_in, user.workspace_id))

    def list_policies(self, db: Session, user: User) -> list[SLAPolicyResponse]:
        # Agent/Admin
        return [SLAPolicyResponse.model_validate(p) for p in sla_repo.get_policies(db, user.workspace_id)]

    def update_policy(self, db: Session, policy_id: uuid.UUID, update_in: SLAPolicyUpdate, user: User) -> SLAPolicyResponse:
        # Admin only
        if user.role != Role.ADMIN:
            raise BadRequest(message="Only admins can update policies") # PermissionDenied better
        
        updated = sla_repo.update_policy(db, policy_id, user.workspace_id, update_in)
        return SLAPolicyResponse.model_validate(updated)

    def apply_sla(self, db: Session, ticket_id: uuid.UUID, policy_id: uuid.UUID, user: User) -> TicketSLAResponse:
        # Agent/Admin
        policy = sla_repo.get_policy(db, policy_id, user.workspace_id)
        if not policy:
            raise NotFound(message="SLA Policy not found")
        if not policy.is_active:
            raise BadRequest(message="Cannot apply inactive policy")
            
        ticket = ticket_repo.get_by_id(db, user.workspace_id, ticket_id) # Ensures existence and workspace
        if not ticket:
             raise NotFound(message="Ticket not found")

        # Calculate deadlines
        # Rules:
        # first_response_due_at = ticket.created_at + policy.first_response_time_minutes
        # resolution_due_at = ticket.created_at + policy.resolution_time_minutes
        
        created_at = ticket.created_at
        first_resp_due = created_at + timedelta(minutes=policy.first_response_time_minutes)
        resolution_due = created_at + timedelta(minutes=policy.resolution_time_minutes)
        
        # Check if already has SLA?
        existing_sla = sla_repo.get_ticket_sla(db, ticket_id)
        if existing_sla:
            # Update mechanism? Using repo. For now create new implies fail/overwrite.
            # Let's clean up existing or update.
            db.delete(existing_sla)
            db.flush()

        ticket_sla = TicketSLA(
            ticket_id=ticket_id,
            workspace_id=user.workspace_id,
            policy_id=policy.id,
            first_response_due_at=first_resp_due,
            resolution_due_at=resolution_due,
            # met/breached defaults false
        )
        
        new_sla = sla_repo.create_ticket_sla(db, ticket_sla)
        
        # Log Audit
        from app.modules.audit.models import AuditLog
        audit = AuditLog(
            workspace_id=user.workspace_id,
            actor_user_id=user.id,
            entity_type="ticket_sla",
            entity_id=ticket_id, # ticket_id usually better reference than ticket_sla pk
            action="sla_applied",
            meta={"policy_id": str(policy.id), "policy_name": policy.name}
        )
        db.add(audit)
        db.commit() # commit sla and audit
        
        return TicketSLAResponse.model_validate(new_sla)

    def get_ticket_sla(self, db: Session, ticket_id: uuid.UUID, user: User) -> TicketSLAResponse:
        # Check access to ticket
        ticket = ticket_repo.get_by_id(db, user.workspace_id, ticket_id)
        if not ticket:
             raise NotFound(message="Ticket not found")
             
        sla = sla_repo.get_ticket_sla(db, ticket_id)
        if not sla:
             raise NotFound(message="No SLA applied to this ticket")
             
        return TicketSLAResponse.model_validate(sla)

sla_service = SLAService()

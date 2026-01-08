import uuid
from sqlalchemy.orm import Session
from app.modules.sla.models import SLAPolicy, TicketSLA
from app.modules.sla.schemas import SLAPolicyCreate, SLAPolicyUpdate
from app.core.errors import NotFound

class SLARepository:
    def create_policy(self, db: Session, policy_in: SLAPolicyCreate, workspace_id: uuid.UUID) -> SLAPolicy:
        policy = SLAPolicy(
            **policy_in.model_dump(),
            workspace_id=workspace_id
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)
        return policy

    def get_policies(self, db: Session, workspace_id: uuid.UUID) -> list[SLAPolicy]:
        return db.query(SLAPolicy).filter(SLAPolicy.workspace_id == workspace_id).all()

    def get_policy(self, db: Session, policy_id: uuid.UUID, workspace_id: uuid.UUID) -> SLAPolicy | None:
        return db.query(SLAPolicy).filter(
            SLAPolicy.id == policy_id, 
            SLAPolicy.workspace_id == workspace_id
        ).first()

    def update_policy(self, db: Session, policy_id: uuid.UUID, workspace_id: uuid.UUID, update_in: SLAPolicyUpdate) -> SLAPolicy:
        policy = self.get_policy(db, policy_id, workspace_id)
        if not policy:
            raise NotFound(message="SLA Policy not found")
            
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(policy, field, value)
            
        db.commit()
        db.refresh(policy)
        return policy
        
    def create_ticket_sla(self, db: Session, ticket_sla: TicketSLA) -> TicketSLA:
        db.add(ticket_sla)
        db.commit()
        db.refresh(ticket_sla)
        return ticket_sla
    
    def get_ticket_sla(self, db: Session, ticket_id: uuid.UUID) -> TicketSLA | None:
        return db.query(TicketSLA).filter(TicketSLA.ticket_id == ticket_id).first()

    def get_breached_ticket_slas(self, db: Session, workspace_id: uuid.UUID) -> list[TicketSLA]:
        # Helper for job (maybe unused here, but useful)
        # Actually job needs complex query.
        pass

sla_repo = SLARepository()

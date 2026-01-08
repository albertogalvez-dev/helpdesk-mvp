import uuid
from datetime import datetime
from typing import Literal

from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session, joinedload

from app.modules.tickets.models import Ticket, TicketMessage, InternalNote, TicketTag, Assignment
from app.modules.tags.models import Tag
from app.modules.tickets.schemas import TicketCreate, TicketFilter, MessageCreate, NoteCreate


class TicketRepo:
    def create(self, db: Session, obj_in: TicketCreate, workspace_id: uuid.UUID, created_by_user_id: uuid.UUID) -> Ticket:
        db_obj = Ticket(
            workspace_id=workspace_id,
            created_by_user_id=created_by_user_id,
            subject=obj_in.subject,
            description=obj_in.description,
            priority=obj_in.priority,
            channel=obj_in.channel
            # default status NEW matches model default
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_id(self, db: Session, workspace_id: uuid.UUID, ticket_id: uuid.UUID, user_id: uuid.UUID | None = None) -> Ticket | None:
        query = db.query(Ticket).filter(
            Ticket.workspace_id == workspace_id,
            Ticket.id == ticket_id
        ).options(joinedload(Ticket.tags))
        
        if user_id:
            # For customer access check, strictly filter by creator
             query = query.filter(Ticket.created_by_user_id == user_id)
             
        return query.first()

    def list_tickets(self, db: Session, workspace_id: uuid.UUID, filter_params: TicketFilter, user_id: uuid.UUID | None = None) -> tuple[list[Ticket], int]:
        query = db.query(Ticket).filter(Ticket.workspace_id == workspace_id)
        
        # Access Scope
        if user_id:
             query = query.filter(Ticket.created_by_user_id == user_id)

        # Apply Filters
        if filter_params.q:
            search = f"%{filter_params.q}%"
            query = query.filter(or_(
                Ticket.subject.ilike(search),
                Ticket.description.ilike(search)
            ))
            
        if filter_params.status:
            statuses = filter_params.status.split(",")
            query = query.filter(Ticket.status.in_(statuses))

        if filter_params.priority:
            priorities = filter_params.priority.split(",")
            query = query.filter(Ticket.priority.in_(priorities))

        if filter_params.assigned_to:
            if filter_params.assigned_to == "unassigned":
                query = query.filter(Ticket.assigned_agent_id.is_(None))
            else:
                query = query.filter(Ticket.assigned_agent_id == filter_params.assigned_to)

        if filter_params.tag:
            # Join with tags if filtering by tag
            query = query.join(Ticket.tags).filter(or_(
                Tag.name == filter_params.tag,
                Tag.id == uuid.UUID(filter_params.tag) if self._is_uuid(filter_params.tag) else False
            ))

        # Count total before pagination
        total = query.with_entities(func.count(Ticket.id)).scalar()

        # Sort
        # Sort
        # Simple mapping for robustness
        sort_map = {
            "created_at": Ticket.created_at,
            "updated_at": Ticket.updated_at,
            "priority": Ticket.priority,
            "status": Ticket.status
        }
        sort_col = sort_map.get(filter_params.sort, Ticket.created_at)
        
        if filter_params.order == "desc":
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        # Pagination
        offset = (filter_params.page - 1) * filter_params.size
        items = query.with_entities(Ticket).options(joinedload(Ticket.tags)).offset(offset).limit(filter_params.size).all()
        
        return items, total

    def add_message(self, db: Session, ticket_id: uuid.UUID, workspace_id: uuid.UUID, author_id: uuid.UUID, obj_in: MessageCreate) -> TicketMessage:
        msg = TicketMessage(
            ticket_id=ticket_id,
            workspace_id=workspace_id,
            author_user_id=author_id,
            body=obj_in.body
        )
        db.add(msg)
        return msg # Commit handled by service transaction usually, or here if we want immediate

    def add_note(self, db: Session, ticket_id: uuid.UUID, workspace_id: uuid.UUID, author_id: uuid.UUID, obj_in: NoteCreate) -> InternalNote:
        note = InternalNote(
            ticket_id=ticket_id,
            workspace_id=workspace_id,
            author_user_id=author_id,
            body=obj_in.body
        )
        db.add(note)
        return note

    def list_messages(self, db: Session, workspace_id: uuid.UUID, ticket_id: uuid.UUID, page: int = 1, size: int = 50) -> list[TicketMessage]:
        offset = (page - 1) * size
        return db.query(TicketMessage).filter(
            TicketMessage.workspace_id == workspace_id,
            TicketMessage.ticket_id == ticket_id
        ).order_by(asc(TicketMessage.created_at)).offset(offset).limit(size).all()

    def list_notes(self, db: Session, workspace_id: uuid.UUID, ticket_id: uuid.UUID, page: int = 1, size: int = 50) -> list[InternalNote]:
        offset = (page - 1) * size
        return db.query(InternalNote).filter(
            InternalNote.workspace_id == workspace_id,
            InternalNote.ticket_id == ticket_id
        ).order_by(desc(InternalNote.created_at)).offset(offset).limit(size).all()
        
    def add_assignment_history(self, db: Session, assignment: Assignment):
        db.add(assignment)

    def _is_uuid(self, val: str) -> bool:
        try:
            uuid.UUID(val)
            return True
        except ValueError:
            return False

ticket_repo = TicketRepo()

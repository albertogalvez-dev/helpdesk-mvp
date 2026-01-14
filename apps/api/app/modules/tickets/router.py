from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import Role
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.tickets.schemas import (
    TicketCreate, TicketResponse, TicketFilter, 
    MessageCreate, MessageResponse, NoteCreate, NoteResponse
)
from app.modules.tickets.service import ticket_service
from app.common.responses import APIResponse, ResponseMeta

router = APIRouter()


@router.post("", response_model=APIResponse[TicketResponse], status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.create_ticket(db, ticket_in, user)
    return APIResponse(data=result)


@router.get("", response_model=APIResponse[list[TicketResponse]])
def list_tickets(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    filter_params: Annotated[TicketFilter, Query()],
):
    items, total = ticket_service.list_tickets(db, filter_params, user)
    return APIResponse(
        data=items,
        meta=ResponseMeta(total=total)
    )

from app.modules.workspaces.models import Workspace

@router.get("/{ticket_id}", response_model=APIResponse[TicketResponse])
def get_ticket(
    ticket_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.get_ticket(db, ticket_id, user)
    return APIResponse(data=result)


class TicketStatusUpdate(BaseModel):
    status: str

@router.patch("/{ticket_id}/status", response_model=APIResponse[TicketResponse])
def update_status(
    ticket_id: uuid.UUID,
    status_in: TicketStatusUpdate,
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.update_status(db, ticket_id, status_in.status, user)
    return APIResponse(data=result)


@router.post("/{ticket_id}/messages", response_model=APIResponse[MessageResponse])
def add_message(
    ticket_id: uuid.UUID,
    message_in: MessageCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.add_message(db, ticket_id, message_in, user)
    return APIResponse(data=result)


@router.post("/{ticket_id}/notes", response_model=APIResponse[NoteResponse])
def add_note(
    ticket_id: uuid.UUID,
    note_in: NoteCreate,
    user: Annotated[User, Depends(get_current_user)], 
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.add_note(db, ticket_id, note_in, user)
    return APIResponse(data=result)


class AssignmentRequest(BaseModel):
    assigned_agent_id: uuid.UUID | None

@router.post("/{ticket_id}/assign", response_model=APIResponse[TicketResponse])
def assign_ticket(
    ticket_id: uuid.UUID,
    assign_in: AssignmentRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.assign_ticket(db, ticket_id, assign_in.assigned_agent_id, user)
    return APIResponse(data=result)


class TicketTagRequest(BaseModel):
    tag_ids: list[uuid.UUID]

@router.post("/{ticket_id}/tags", response_model=APIResponse[TicketResponse])
def attach_tags(
    ticket_id: uuid.UUID,
    tag_req: TicketTagRequest,
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))], 
    db: Annotated[Session, Depends(get_db)],
):
    result = ticket_service.attach_tags(db, ticket_id, tag_req.tag_ids, user)
    return APIResponse(data=result)

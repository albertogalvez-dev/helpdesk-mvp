from datetime import datetime
import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.modules.tickets.models import TicketStatus, TicketPriority, TicketChannel
from app.modules.tags.schemas import TagResponse


class UserProfileResponse(BaseModel):
    department: str | None
    location: str | None
    device_label: str | None
    remote_access_id: str | None

class WorkspaceProfileResponse(BaseModel):
    company_name: str | None
    contact_email: str | None
    contact_phone: str | None
    support_hours: str | None
    remote_support_tool: str | None
    remote_support_instructions: str | None

class TicketBase(BaseModel):
    subject: str
    description: str


class TicketCreate(TicketBase):
    priority: TicketPriority = TicketPriority.MEDIUM
    channel: TicketChannel = TicketChannel.WEB


class TicketUpdate(BaseModel):
    subject: str | None = None
    description: str | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    


class TicketResponse(TicketBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_by_user_id: uuid.UUID
    status: TicketStatus
    priority: TicketPriority
    channel: TicketChannel
    assigned_agent_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
    
    tags: list[TagResponse] = []
    
    # Expanded details for UI
    requester: dict | None = None # Full object {id, full_name, email, profile}
    workspace: dict | None = None # Full object {id, name, profile}

    model_config = ConfigDict(from_attributes=True)


class MessageBase(BaseModel):
    body: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: uuid.UUID
    ticket_id: uuid.UUID
    author_user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteBase(BaseModel):
    body: str


class NoteCreate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: uuid.UUID
    ticket_id: uuid.UUID
    author_user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketFilter(BaseModel):
    page: int = 1
    size: int = 20
    q: str | None = None
    status: str | None = None # Comma separated
    priority: str | None = None
    assigned_to: uuid.UUID | Literal["unassigned"] | None = None
    tag: str | None = None # name or UUID
    # Sort
    sort: Literal["created_at", "updated_at", "priority", "status"] = Field(default="created_at", description="Sort field")
    order: Literal["asc", "desc"] = Field(default="desc", description="Sort order")

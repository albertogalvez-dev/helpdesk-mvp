from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, ConfigDict

class SLAPolicyBase(BaseModel):
    name: str # Unique per workspace
    first_response_time_minutes: int
    resolution_time_minutes: int
    business_hours: Optional[dict] = None
    is_active: bool = True

class SLAPolicyCreate(SLAPolicyBase):
    pass

class SLAPolicyUpdate(BaseModel):
    name: Optional[str] = None
    first_response_time_minutes: Optional[int] = None
    resolution_time_minutes: Optional[int] = None
    first_response_breached: Optional[bool] = None # Wait, update policy shouldn't specificy usage flags.
    is_active: Optional[bool] = None
    business_hours: Optional[dict] = None

class SLAPolicyResponse(SLAPolicyBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TicketSLAResponse(BaseModel):
    ticket_id: uuid.UUID
    policy_id: uuid.UUID
    first_response_due_at: datetime
    resolution_due_at: datetime
    first_response_met: bool
    resolution_met: bool
    first_response_breached: bool
    resolution_breached: bool
    escalated_level: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

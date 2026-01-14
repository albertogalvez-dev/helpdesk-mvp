from datetime import datetime
import uuid

from pydantic import BaseModel, EmailStr, ConfigDict

from app.core.security import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: Role = Role.CUSTOMER
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str
    role: str = "customer"
    phone: str | None = None
    anydesk_id: str | None = None
    department: str | None = None
    subscription_plan: str = "free"


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    phone: str | None = None
    anydesk_id: str | None = None
    department: str | None = None
    subscription_plan: str | None = None


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    role: Role
    is_active: bool
    workspace_id: uuid.UUID
    phone: str | None = None
    anydesk_id: str | None = None
    department: str | None = None
    subscription_plan: str | None = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

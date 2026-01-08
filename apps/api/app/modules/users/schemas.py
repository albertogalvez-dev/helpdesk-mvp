from datetime import datetime
import uuid

from pydantic import BaseModel, EmailStr, ConfigDict

from app.core.security import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: Role = Role.CUSTOMER
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    workspace_id: uuid.UUID


class UserRead(UserBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

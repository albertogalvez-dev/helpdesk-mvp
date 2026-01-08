import uuid
from pydantic import BaseModel, EmailStr

from app.modules.users.schemas import UserRead
from app.modules.workspaces.schemas import WorkspaceRead


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    workspace_name: str
    admin_email: EmailStr
    admin_full_name: str | None = None
    admin_password: str


class AuthMeResponse(BaseModel):
    user: UserRead
    workspace: WorkspaceRead

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.users.schemas import UserRead
from app.core.security import Role
from app.common.responses import APIResponse

router = APIRouter()


@router.get("/me", response_model=APIResponse[UserRead])
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return APIResponse(data=UserRead.model_validate(current_user))


@router.get("", response_model=APIResponse[list[UserRead]])
def list_users(
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
    role: Role | None = None,
):
    query = db.query(User).filter(User.workspace_id == user.workspace_id)
    if role:
        query = query.filter(User.role == role)
    
    users = query.all()
    return APIResponse(data=[UserRead.model_validate(u) for u in users])

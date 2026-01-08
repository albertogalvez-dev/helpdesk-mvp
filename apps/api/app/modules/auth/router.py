from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import RegisterRequest, LoginRequest, Token, AuthMeResponse
from app.modules.auth.service import auth_service
from app.modules.auth.deps import get_current_user
from app.modules.users.models import User
from app.modules.users.schemas import UserRead
from app.modules.workspaces.schemas import WorkspaceRead
from app.modules.workspaces.service import workspace_service
from app.common.responses import APIResponse

router = APIRouter()


@router.post("/register", response_model=APIResponse[AuthMeResponse], status_code=status.HTTP_201_CREATED)
def register(
    register_in: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
):
    result = auth_service.register(db, register_in)
    return APIResponse(data=result)


@router.post("/login", response_model=APIResponse[Token])
def login(
    login_in: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    result = auth_service.login(db, login_in)
    return APIResponse(data=result)


@router.get("/me", response_model=APIResponse[AuthMeResponse])
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    workspace = workspace_service.get_workspace(db, current_user.workspace_id)
    return APIResponse(
        data=AuthMeResponse(
            user=UserRead.model_validate(current_user),
            workspace=workspace
        )
    )

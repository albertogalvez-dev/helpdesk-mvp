from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import Role
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.tags.schemas import TagCreate, TagResponse
from app.modules.tags.repo import tag_repo
from app.common.responses import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[list[TagResponse]])
def list_tags(
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    tags = tag_repo.get_all(db, user.workspace_id)
    return APIResponse(data=tags)


@router.post("", response_model=APIResponse[TagResponse], status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_in: TagCreate,
    user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))], # Phase 2 suggests admin/agent management
    db: Annotated[Session, Depends(get_db)],
):
    tag = tag_repo.create(db, tag_in, user.workspace_id)
    return APIResponse(data=tag)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: uuid.UUID,
    user: Annotated[User, Depends(require_roles(Role.ADMIN))], # Strict Admin? Prompt: "agent/admin" for POST, "admin" for PATCH/DELETE? Prompt "DELETE ... admin - opcional". Let's stick to admin or agent.
    db: Annotated[Session, Depends(get_db)],
):
    tag_repo.delete(db, user.workspace_id, tag_id)
    return None

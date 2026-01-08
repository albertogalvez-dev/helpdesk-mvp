from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.workspaces.service import workspace_service
from app.modules.workspaces.schemas import WorkspaceRead
from app.modules.users.models import User
from app.core.security import Role
from app.common.responses import APIResponse

router = APIRouter()


@router.get("/me", response_model=APIResponse[WorkspaceRead])
def get_my_workspace(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    workspace = workspace_service.get_workspace(db, current_user.workspace_id)
    # Include profile if available
    result = WorkspaceRead.model_validate(workspace)
    return APIResponse(data=result)


class WorkspaceProfileUpdate(BaseModel):
    company_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    support_hours: str | None = None
    remote_support_tool: str | None = None
    remote_support_instructions: str | None = None


@router.patch("/me/profile", response_model=APIResponse[dict])
def update_workspace_profile(
    profile_in: WorkspaceProfileUpdate,
    user: Annotated[User, Depends(require_roles(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    # Get or create workspace profile
    from app.modules.workspaces.models import Workspace, WorkspaceProfile
    
    workspace = db.get(Workspace, user.workspace_id)
    if not workspace:
        from app.core.errors import NotFound
        raise NotFound("Workspace not found")
    
    # Check if profile exists
    profile = db.query(WorkspaceProfile).filter(WorkspaceProfile.workspace_id == user.workspace_id).first()
    
    if not profile:
        # Create profile
        profile = WorkspaceProfile(workspace_id=user.workspace_id)
        db.add(profile)
    
    # Update fields
    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    return APIResponse(data={
        "message": "Profile updated",
        "profile": {
            "company_name": profile.company_name,
            "contact_email": profile.contact_email,
            "contact_phone": profile.contact_phone,
            "support_hours": profile.support_hours,
            "remote_support_tool": profile.remote_support_tool,
            "remote_support_instructions": profile.remote_support_instructions,
        }
    })

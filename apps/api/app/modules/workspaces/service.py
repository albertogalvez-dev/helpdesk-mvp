import uuid
from sqlalchemy.orm import Session

from app.modules.workspaces.repo import workspace_repo
from app.modules.workspaces.schemas import WorkspaceCreate, WorkspaceRead
from app.core.errors import NotFound


class WorkspaceService:
    def create_workspace(self, db: Session, workspace_in: WorkspaceCreate) -> WorkspaceRead:
        workspace = workspace_repo.create(db, workspace_in)
        return WorkspaceRead.model_validate(workspace)

    def get_workspace(self, db: Session, workspace_id: uuid.UUID) -> WorkspaceRead:
        workspace = workspace_repo.get_by_id(db, workspace_id)
        if not workspace:
            raise NotFound(message="Workspace not found")
        return WorkspaceRead.model_validate(workspace)

workspace_service = WorkspaceService()

import uuid
from sqlalchemy.orm import Session

from app.modules.workspaces.models import Workspace
from app.modules.workspaces.schemas import WorkspaceCreate


class WorkspaceRepo:
    def create(self, db: Session, obj_in: WorkspaceCreate, commit: bool = True) -> Workspace:
        db_obj = Workspace(name=obj_in.name)
        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def get_by_id(self, db: Session, id: uuid.UUID) -> Workspace | None:
        return db.query(Workspace).filter(Workspace.id == id).first()

workspace_repo = WorkspaceRepo()

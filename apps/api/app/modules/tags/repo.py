import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.modules.tags.models import Tag
from app.modules.tags.schemas import TagCreate
from app.core.errors import BadRequest

class TagRepo:
    def create(self, db: Session, obj_in: TagCreate, workspace_id: uuid.UUID) -> Tag:
        try:
            db_obj = Tag(
                workspace_id=workspace_id,
                name=obj_in.name,
                color=obj_in.color
            )
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except IntegrityError:
            db.rollback()
            raise BadRequest(message=f"Tag '{obj_in.name}' already exists in this workspace")

    def get_all(self, db: Session, workspace_id: uuid.UUID) -> list[Tag]:
        return db.query(Tag).filter(Tag.workspace_id == workspace_id).all()

    def get_by_ids(self, db: Session, workspace_id: uuid.UUID, tag_ids: list[uuid.UUID]) -> list[Tag]:
        return db.query(Tag).filter(
            Tag.workspace_id == workspace_id,
            Tag.id.in_(tag_ids)
        ).all()
        
    def get_by_id(self, db: Session, workspace_id: uuid.UUID, tag_id: uuid.UUID) -> Tag | None:
        return db.query(Tag).filter(
            Tag.workspace_id == workspace_id,
            Tag.id == tag_id
        ).first()

    def delete(self, db: Session, workspace_id: uuid.UUID, tag_id: uuid.UUID) -> None:
        tag = self.get_by_id(db, workspace_id, tag_id)
        if tag:
            db.delete(tag)
            db.commit()

tag_repo = TagRepo()

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.users.models import User
from app.modules.users.schemas import UserCreate
from app.core.security import get_password_hash


class UserRepo:
    def create(self, db: Session, obj_in: UserCreate, commit: bool = True) -> User:
        db_obj = User(
            email=obj_in.email,
            full_name=obj_in.full_name,
            password_hash=get_password_hash(obj_in.password),
            role=obj_in.role,
            is_active=obj_in.is_active,
            workspace_id=obj_in.workspace_id,
        )
        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, user_id: uuid.UUID) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

user_repo = UserRepo()

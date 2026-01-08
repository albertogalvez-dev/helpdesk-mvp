import uuid
from sqlalchemy.orm import Session

from app.modules.users.repo import user_repo
from app.modules.users.schemas import UserCreate, UserRead
from app.core.errors import NotFound, BadRequest 


class UserService:
    def create_user(self, db: Session, user_in: UserCreate) -> UserRead:
        if user_repo.get_by_email(db, user_in.email):
            raise BadRequest(message="Email already registered")
        
        user = user_repo.create(db, user_in)
        return UserRead.model_validate(user)

    def get_user(self, db: Session, user_id: uuid.UUID) -> UserRead:
        user = user_repo.get_by_id(db, user_id)
        if not user:
            raise NotFound(message="User not found")
        return UserRead.model_validate(user)
    
    def get_by_email(self, db: Session, email: str): # Returns Model, internal use for auth
        return user_repo.get_by_email(db, email)

user_service = UserService()

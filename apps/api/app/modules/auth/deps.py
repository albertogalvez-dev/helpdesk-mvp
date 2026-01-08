import uuid
from typing import Annotated

from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.security import Role
from app.core.errors import NotAuthenticated, PermissionDenied, NotFound
from app.db.session import get_db
from app.modules.users.models import User
from app.modules.users.service import user_service

settings = get_settings()
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login" # Adjust path as needed
)


def get_current_user(
    token: Annotated[str, Depends(reusable_oauth2)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise NotAuthenticated(message="Could not validate credentials")
    except (JWTError, ValidationError):
        raise NotAuthenticated(message="Could not validate credentials")
    
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
         raise NotAuthenticated(message="Invalid token subject")

    user = user_service.get_user(db, user_id=user_id)
    if not user: # Should technically use repo get_by_id directly to avoid NotFound exception converting to 404 if we want 401
         # But user_service.get_user returns UserRead, we need Model for deps usually to check details
         # Wait, user_service.get_user returns UserRead (Pydantic). Detailed permission checks need Model? 
         # Let's fix user_service to have get_user_model or use repo directly here.
         # Using repo directly is better pattern for internal auth.
         pass
         
    # Better: use repo directly
    from app.modules.users.repo import user_repo
    user_model = user_repo.get_by_id(db, user_id)
    
    if not user_model:
        raise NotAuthenticated(message="User not found")
        
    if not user_model.is_active:
         raise PermissionDenied(message="User is inactive")
         
    return user_model


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if current_user.role != Role.ADMIN:
        raise PermissionDenied(message="Not enough privileges")
    return current_user


class RoleChecker:
    def __init__(self, allowed_roles: list[Role]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: CurrentUser) -> User:
        if user.role not in self.allowed_roles:
            raise PermissionDenied(message="Not enough privileges")
        return user

def require_roles(*roles: Role):
    return RoleChecker(list(roles))

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.deps import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.users.schemas import UserRead, UserCreate, UserUpdate
from app.core.security import Role, get_password_hash
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


@router.get("/{user_id}", response_model=APIResponse[UserRead])
def get_user_by_id(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_roles(Role.ADMIN, Role.AGENT))],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(
        User.id == user_id,
        User.workspace_id == current_user.workspace_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return APIResponse(data=UserRead.model_validate(user))


@router.post("", response_model=APIResponse[UserRead])
def create_user(
    data: UserCreate,
    current_user: Annotated[User, Depends(require_roles(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Map role string to Role enum
    role_map = {"admin": Role.ADMIN, "agent": Role.AGENT, "customer": Role.CUSTOMER}
    role = role_map.get(data.role.lower(), Role.CUSTOMER)
    
    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=get_password_hash(data.password),
        role=role,
        workspace_id=current_user.workspace_id,
        phone=data.phone,
        anydesk_id=data.anydesk_id,
        department=data.department,
        subscription_plan=data.subscription_plan,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return APIResponse(data=UserRead.model_validate(user))


@router.patch("/{user_id}", response_model=APIResponse[UserRead])
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: Annotated[User, Depends(require_roles(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(
        User.id == user_id,
        User.workspace_id == current_user.workspace_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return APIResponse(data=UserRead.model_validate(user))


@router.delete("/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_roles(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(
        User.id == user_id,
        User.workspace_id == current_user.workspace_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

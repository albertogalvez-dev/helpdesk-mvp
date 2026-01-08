from datetime import timedelta
from sqlalchemy.orm import Session

from app.core import security
from app.core import config
from app.core.errors import NotAuthenticated, BadRequest
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate
from app.modules.users.repo import user_repo
from app.modules.workspaces.schemas import WorkspaceCreate
from app.modules.workspaces.repo import workspace_repo
from app.modules.auth.schemas import RegisterRequest, Token, LoginRequest, AuthMeResponse, WorkspaceRead, UserRead

settings = config.get_settings()


class AuthService:
    def register(self, db: Session, register_in: RegisterRequest) -> AuthMeResponse:
        # Check if email exists globaly (strict unique email decision)
        if user_repo.get_by_email(db, register_in.admin_email):
            raise BadRequest(message="Email already registered")

        # Transactional creation
        try:
            # 1. Create Workspace
            workspace_in = WorkspaceCreate(name=register_in.workspace_name)
            workspace = workspace_repo.create(db, workspace_in, commit=False)
            db.flush() # get ID

            # 2. Create Admin User
            user_in = UserCreate(
                email=register_in.admin_email,
                full_name=register_in.admin_full_name,
                password=register_in.admin_password,
                role=security.Role.ADMIN,
                workspace_id=workspace.id
            )
            # We use repo create but need to make sure it doesn't commit automatically if we want atomicity?
            # Repo.create usually commits. Let's adjust or handle carefully. 
            # Ideally repo methods should accept commit=False.
            # My generated repo code has commit=True by default but logic allows commit=False.
            user = user_repo.create(db, user_in, commit=False)
            
            db.commit()
            db.refresh(user)
            db.refresh(workspace)
            
            return AuthMeResponse(
                user=UserRead.model_validate(user),
                workspace=WorkspaceRead.model_validate(workspace)
            )
        except Exception as e:
            db.rollback()
            raise e

    def login(self, db: Session, login_in: LoginRequest) -> Token:
        user = user_repo.get_by_email(db, login_in.email)
        if not user:
            raise NotAuthenticated(message="Incorrect email or password")
        
        if not security.verify_password(login_in.password, user.password_hash):
            raise NotAuthenticated(message="Incorrect email or password")
            
        if not user.is_active:
             raise NotAuthenticated(message="User is inactive")

        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = security.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60
        )

auth_service = AuthService()

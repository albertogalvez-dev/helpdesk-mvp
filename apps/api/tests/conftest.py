import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

# Ensure env vars are set before importing app if needed, 
# but main.py imports config which uses pydantic settings from env.
# We trust .env or default settings.

from app.main import app
from app.db.base import Base
from app.core.config import get_settings
from app.db.session import get_db

settings = get_settings()
# Use the same DB URL from settings (Docker PG)
engine = create_engine(settings.database_url)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Create tables in case migration didn't run or to be safe
    # But we ran migration, so this might be redundant or safe check.
    # Base.metadata.create_all(bind=engine) 
    yield
    # No drop to persist state for manual inspection if needed, or drop if desired.


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestingSessionLocal()
    # Clean before test to ensure fresh state
    session.execute(text("TRUNCATE TABLE users, workspaces RESTART IDENTITY CASCADE"))
    session.commit()
    
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_auth_headers(client):
    # Register admin (creates workspace)
    resp = client.post("/api/v1/auth/register", json={
        "workspace_name": "TestCorp",
        "admin_email": "admin@test.com",
        "admin_password": "password",
        "admin_full_name": "Admin"
    })
    
    # Always login to get token, as register might not return it
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "password"
    })
    if login_resp.status_code != 200:
         # Fallback if already logged in / registered? No, login should work.
         # If register failed because 400 (exists), login works.
         # If register success, login works.
         pass

    token = login_resp.json()["data"]["access_token"]
    
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def agent_auth_headers(client, admin_auth_headers):
    # Admin creates agent (requires User management endpoint which we might not have fully implemented in Phase 1? 
    # Wait, Phase 1 had /users/me but maybe not create user.
    # Check if we can create user? 
    # If not, we might need to insert into DB directly or use a helper function in tests.
    # Let's check if we have a way to create agent via API.
    # If not, let's just insert into DB using session.
    pass

# Direct DB insertion for users if API missing
from app.modules.users.models import User
from app.core.security import get_password_hash, Role
import uuid

@pytest.fixture
def agent_auth_headers(client, db, admin_auth_headers):
    # Get workspace id from admin (who we know exists now)
    # Or just query DB
    admin = db.query(User).filter(User.email == "admin@test.com").first()
    workspace_id = admin.workspace_id
    
    agent = User(
        email="agent@test.com",
        password_hash=get_password_hash("password"),
        full_name="Agent",
        role=Role.AGENT,
        workspace_id=workspace_id,
        is_active=True
    )
    db.add(agent)
    db.commit()
    
    # Login
    resp = client.post("/api/v1/auth/login", json={
        "email": "agent@test.com",
        "password": "password"
    })
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def customer_auth_headers(client, db, admin_auth_headers):
    # Get workspace id
    admin = db.query(User).filter(User.email == "admin@test.com").first()
    workspace_id = admin.workspace_id
    
    customer = User(
        email="customer@test.com",
        password_hash=get_password_hash("password"),
        full_name="Customer",
        role=Role.CUSTOMER,
        workspace_id=workspace_id,
        is_active=True
    )
    db.add(customer)
    db.commit()
    
    # Login
    resp = client.post("/api/v1/auth/login", json={
        "email": "customer@test.com",
        "password": "password"
    })
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

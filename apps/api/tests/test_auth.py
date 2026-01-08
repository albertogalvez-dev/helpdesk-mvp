from fastapi import status
from app.core import security

def test_register_creates_workspace_and_admin(client):
    payload = {
        "workspace_name": "Acme Corp",
        "admin_email": "admin@acme.com",
        "admin_password": "securepassword",
        "admin_full_name": "Admin User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()["data"]
    
    assert data["workspace"]["name"] == "Acme Corp"
    assert data["user"]["email"] == "admin@acme.com"
    assert data["user"]["role"] == security.Role.ADMIN
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_login_returns_token(client):
    # Register first
    client.post("/api/v1/auth/register", json={
        "workspace_name": "Acme",
        "admin_email": "admin@acme.com",
        "admin_password": "securepassword"
    })
    
    payload = {
        "email": "admin@acme.com",
        "password": "securepassword"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_me_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_user_workspace(client):
    # Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "workspace_name": "My Workspace",
        "admin_email": "me@demo.com",
        "admin_password": "pass"
    })
    
    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "me@demo.com",
        "password": "pass"
    })
    token = login_resp.json()["data"]["access_token"]
    
    # Me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    data = me_resp.json()["data"]
    
    assert data["workspace"]["name"] == "My Workspace"
    assert data["user"]["email"] == "me@demo.com"

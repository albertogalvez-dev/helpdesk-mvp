import pytest
from app.core.security import Role

def test_customer_can_create_and_list_own_tickets(client, customer_auth_headers):
    # Create Ticket
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "My Issue", "description": "Help me"}
    )
    assert resp.status_code == 201
    ticket_id = resp.json()["data"]["id"]
    
    # List Tickets
    resp = client.get("/api/v1/tickets", headers=customer_auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) >= 1
    assert any(t["id"] == ticket_id for t in items)

def test_customer_cannot_access_other_users_ticket(client, customer_auth_headers, agent_auth_headers):
    # Agent creates a ticket (simulate another user or just agent creating unrelated ticket)
    # Actually agent usually works on existing, but let's have agent create one
    resp = client.post(
        "/api/v1/tickets",
        headers=agent_auth_headers,
        json={"subject": "Agent Issue", "description": "Internal"}
    )
    other_ticket_id = resp.json()["data"]["id"]
    
    # Customer tries to get it
    resp = client.get(f"/api/v1/tickets/{other_ticket_id}", headers=customer_auth_headers)
    assert resp.status_code == 404 # Not found (scoped)

def test_agent_can_list_workspace_tickets(client, agent_auth_headers, customer_auth_headers):
    # Customer creates ticket
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "Customer Issue", "description": "For Agent"}
    )
    ticket_id = resp.json()["data"]["id"]
    
    # Agent lists
    resp = client.get("/api/v1/tickets", headers=agent_auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert any(t["id"] == ticket_id for t in items)

def test_agent_can_assign_ticket_and_msg(client, agent_auth_headers, customer_auth_headers):
    # Customer creates
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "Help", "description": "Plz"}
    )
    ticket_id = resp.json()["data"]["id"]
    
    # Agent assigns to self (need agent ID, but let's assign to None or just check endpoint)
    # Get current agent ID?
    me_resp = client.get("/api/v1/auth/me", headers=agent_auth_headers)
    agent_id = me_resp.json()["data"]["user"]["id"]
    
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/assign",
        headers=agent_auth_headers,
        json={"assigned_agent_id": agent_id}
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["assigned_agent_id"] == agent_id
    
    # Agent replies
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/messages",
        headers=agent_auth_headers,
        json={"body": "On it"}
    )
    assert resp.status_code == 200
    
    # Check status updated to OPEN (was NEW)
    resp = client.get(f"/api/v1/tickets/{ticket_id}", headers=agent_auth_headers)
    assert resp.json()["data"]["status"] == "OPEN"

def test_internal_notes_visibility(client, agent_auth_headers, customer_auth_headers):
    # Customer creates
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "Notes Test", "description": "..."}
    )
    ticket_id = resp.json()["data"]["id"]
    
    # Agent adds note
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/notes",
        headers=agent_auth_headers,
        json={"body": "Secret info"}
    )
    assert resp.status_code == 200
    
    # Customer tries to add note (forbidden)
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/notes",
        headers=customer_auth_headers,
        json={"body": "Hacker"}
    )
    assert resp.status_code == 403

def test_tags_operations(client, admin_auth_headers, agent_auth_headers):
    # Admin creates tag
    resp = client.post(
        "/api/v1/tags",
        headers=admin_auth_headers,
        json={"name": "Urgent", "color": "#FF0000"}
    )
    assert resp.status_code == 201
    
    # Create ticket
    t_resp = client.post(
        "/api/v1/tickets",
        headers=agent_auth_headers,
        json={"subject": "Tagged Ticket", "description": "..."}
    )
    # ticket_id = t_resp.json()["data"]["id"]
    
    # (Optional: Add tag to ticket if endpoint exists - prompt mentioned POST /tickets/{id}/tags, but I didn't implement it in router explicitly in my previous step! 
    # Checking prompt: "10) POST /api/v1/tickets/{ticket_id}/tags". 
    # Oops, missed implementing that endpoint in router.py. Need to add it.)

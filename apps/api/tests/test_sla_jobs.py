import pytest
from datetime import datetime, timedelta, timezone
from freezegun import freeze_time
from sqlalchemy.orm import Session
from app.modules.tickets.models import Ticket, TicketStatus
from app.modules.users.models import User
from app.modules.sla.models import TicketSLA, SLAPolicy
from app.modules.audit.models import AuditLog
from app.jobs import sla_escalation_job, auto_close_job, weekly_report_job

def test_sla_lifecycle(client, admin_auth_headers, agent_auth_headers, customer_auth_headers, db: Session):
    # 1. Create SLA Policy (Admin)
    resp = client.post(
        "/api/v1/slas",
        headers=admin_auth_headers,
        json={
            "name": "Standard Support",
            "first_response_time_minutes": 60,
            "resolution_time_minutes": 240
        }
    )
    assert resp.status_code == 201
    policy_id = resp.json()["data"]["id"]
    
    # 2. Create Ticket (Customer)
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "Urgent Problem", "description": "Fix it"}
    )
    ticket_id = resp.json()["data"]["id"]
    
    # 3. Apply SLA (Agent)
    resp = client.post(
        f"/api/v1/slas/{policy_id}/apply",
        headers=agent_auth_headers,
        json={"ticket_id": ticket_id}
    )
    assert resp.status_code == 200
    sla_data = resp.json()["data"]
    assert sla_data["first_response_met"] == False
    
    # Check TicketSLA in DB
    tsla = db.query(TicketSLA).filter_by(ticket_id=ticket_id).first()
    assert tsla is not None
    
    # 4. Agent Replies (Check First Response Met)
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/messages",
        headers=agent_auth_headers,
        json={"body": "I am working on it"}
    )
    assert resp.status_code == 200
    
    db.refresh(tsla)
    assert tsla.first_response_met == True
    
def test_sla_breach_and_escalation(client, admin_auth_headers, agent_auth_headers, customer_auth_headers, db: Session):
    # 1. Create Policy
    resp = client.post(
        "/api/v1/slas",
        headers=admin_auth_headers,
        json={
            "name": "Fast Support",
            "first_response_time_minutes": 10,
            "resolution_time_minutes": 30
        }
    )
    policy_id = resp.json()["data"]["id"]
    
    # 2. Create Ticket and Apply SLA
    resp = client.post(
        "/api/v1/tickets",
        headers=customer_auth_headers,
        json={"subject": "Breach Test", "description": "..."}
    )
    ticket_id = resp.json()["data"]["id"]
    
    client.post(
        f"/api/v1/slas/{policy_id}/apply",
        headers=agent_auth_headers,
        json={"ticket_id": ticket_id}
    )

    # 3. Fast Forward time to cause breach (20 mins later > 10 min first response)
    with freeze_time(datetime.now(timezone.utc) + timedelta(minutes=20)):
        # Run Job
        sla_escalation_job()
        
        # Verify Breach and Escalation
        tsla = db.query(TicketSLA).filter_by(ticket_id=ticket_id).first()
        db.refresh(tsla)
        assert tsla.first_response_breached == True
        assert tsla.escalated_level == 1
        
        ticket = db.query(Ticket).get(ticket_id)
        assert ticket.priority == "HIGH" # lvl 1
        
    # 4. Fast Forward more (60 mins later > 30 min resolution)
    with freeze_time(datetime.now(timezone.utc) + timedelta(minutes=60)):
        sla_escalation_job()
        
        db.refresh(tsla)
        assert tsla.resolution_breached == True
        assert tsla.escalated_level == 2
        
        db.refresh(ticket)
        assert ticket.priority == "URGENT"

def test_auto_close_job(client, admin_auth_headers, agent_auth_headers, customer_auth_headers, db: Session):
    # 1. Create and Resolve Ticket
    resp = client.post("/api/v1/tickets", headers=customer_auth_headers, json={"subject": "Auto Close", "description": "."})
    ticket_id = resp.json()["data"]["id"]
    
    # Resolve
    client.patch(f"/api/v1/tickets/{ticket_id}/status", headers=agent_auth_headers, json={"status": "RESOLVED"})
    
    # Check resolved
    ticket = db.query(Ticket).get(ticket_id)
    assert ticket.status == TicketStatus.RESOLVED
    
    # 2. Fast forward 8 days (default cutoff 7)
    with freeze_time(datetime.now(timezone.utc) + timedelta(days=8)):
        auto_close_job()
        
        db.refresh(ticket)
        assert ticket.status == TicketStatus.CLOSED
        
def test_reports_api(client, admin_auth_headers, db: Session):
    # Ensure some data exists (from previous tests or create new)
    # We can rely on isolation or create new. conftest usually isolates per test func?
    # db fixture truncates? Yes.
    
    # Create manually for report
    from app.modules.workspaces.models import Workspace
    ws = db.query(Workspace).first()
    user = db.query(User).filter_by(workspace_id=ws.id).first()
    
    # 1 created, 0 resolved
    t = Ticket(workspace_id=ws.id, subject="Report T", description=".", created_by_user_id=user.id) # Admin created
    db.add(t)
    db.commit()
    
    resp = client.get("/api/v1/reports/weekly", headers=admin_auth_headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["tickets_created"] >= 1

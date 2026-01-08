import sys
import os
import random
import uuid
from datetime import datetime, timedelta, timezone

# Add parent directory to path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../"))

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.session import SessionLocal
from app.modules.users.models import User
from app.modules.workspaces.models import Workspace
from app.modules.tickets.models import Ticket, TicketStatus, TicketPriority, TicketChannel, TicketMessage, InternalNote, Assignment, TicketTag
from app.modules.tags.models import Tag
from app.modules.sla.models import SLAPolicy, TicketSLA
from app.core.security import Role, get_password_hash

# Constants
WORKSPACE_NAME = "Acme IT Services"
ADMIN_EMAIL = "admin@acme.com"
PASSWORD = "password123"

def seed_demo():
    db = SessionLocal()
    try:
        print(f"Seeding Workspace: {WORKSPACE_NAME}...")
        
        # 1. Workspace
        ws = db.query(Workspace).filter_by(name=WORKSPACE_NAME).first()
        if not ws:
            ws = Workspace(name=WORKSPACE_NAME)
            db.add(ws)
            db.commit()
            db.refresh(ws)
            print(f"Created Workspace ID: {ws.id}")
        else:
            print(f"Workspace exists: {ws.id}")
            
        # 2. Users
        def create_user(email, name, role):
            u = db.query(User).filter_by(email=email).first()
            if not u:
                u = User(
                    email=email,
                    full_name=name,
                    password_hash=get_password_hash(PASSWORD),
                    role=role,
                    workspace_id=ws.id,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                print(f"Created {role}: {email}")
            return u

        print("Seeding Users...")
        admin = create_user(ADMIN_EMAIL, "Alice Admin", Role.ADMIN)
        agent1 = create_user("bob@acme.com", "Bob Agent", Role.AGENT)
        agent2 = create_user("carol@acme.com", "Carol Support", Role.AGENT)
        
        customers = []
        for i in range(1, 6):
            c = create_user(f"cust{i}@client.com", f"Customer {i}", Role.CUSTOMER)
            customers.append(c)

        # 3. Tags
        print("Seeding Tags...")
        tag_names = ["VPN", "Hardware", "Software", "Network", "Access", "Printer", "Email", "Security"]
        tags_map = {}
        for t_name in tag_names:
            t = db.query(Tag).filter_by(workspace_id=ws.id, name=t_name).first()
            if not t:
                t = Tag(workspace_id=ws.id, name=t_name, color=random.choice(["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff"]))
                db.add(t)
                db.commit()
                db.refresh(t)
            tags_map[t_name] = t
            
        # 4. SLA Policy
        print("Seeding SLA Policy...")
        policy = db.query(SLAPolicy).filter_by(workspace_id=ws.id, name="Standard SLA").first()
        if not policy:
            policy = SLAPolicy(
                workspace_id=ws.id,
                name="Standard SLA",
                first_response_time_minutes=60, # 1 hour
                resolution_time_minutes=480, # 8 hours
                is_active=True
            )
            db.add(policy)
            db.commit()
            db.refresh(policy)
            
        # 5. Tickets (Realistic Mix)
        print("Seeding Tickets...")
        
        # Helper to create ticket
        def create_ticket_scenario(subject, status, priority, author, assignee=None, created_delta_mins=0, tags=[]):
            # Check dup
            exists = db.query(Ticket).filter(Ticket.subject == subject, Ticket.workspace_id == ws.id).first()
            if exists: return exists
            
            created_at = datetime.now(timezone.utc) - timedelta(minutes=created_delta_mins)
            
            t = Ticket(
                workspace_id=ws.id,
                created_by_user_id=author.id,
                subject=subject,
                description=f"Description for {subject}. Please help.",
                status=status,
                priority=priority,
                created_at=created_at,
                updated_at=created_at,
                assigned_agent_id=assignee.id if assignee else None
            )
            db.add(t)
            db.commit()
            db.refresh(t)
            
            # Tags
            for tag_name in tags:
                if tag_name in tags_map:
                    tt = TicketTag(ticket_id=t.id, tag_id=tags_map[tag_name].id)
                    db.add(tt)
            
            # Apply SLA logic manually for demo purpose to simulate state
            # (In real app, we'd call service, but here we want to force states like breached)
            
            # Simple SLA attached
            sla_t = TicketSLA(
                ticket_id=t.id,
                workspace_id=ws.id,
                policy_id=policy.id,
                first_response_due_at=created_at + timedelta(minutes=policy.first_response_time_minutes),
                resolution_due_at=created_at + timedelta(minutes=policy.resolution_time_minutes),
                first_response_met=(status != TicketStatus.NEW),
                resolution_met=(status in [TicketStatus.RESOLVED, TicketStatus.CLOSED])
            )
            # Adjust breached flags if needed based on delta
            now = datetime.now(timezone.utc)
            if sla_t.first_response_due_at < now and not sla_t.first_response_met:
                sla_t.first_response_breached = True
            if sla_t.resolution_due_at < now and not sla_t.resolution_met:
                sla_t.resolution_breached = True
                
            db.add(sla_t)
            db.commit()
            
            return t

        # Scenario 1: Fresh New Tickets (High Urgency)
        create_ticket_scenario("VPN Down for entire office", TicketStatus.NEW, TicketPriority.URGENT, customers[0], created_delta_mins=5, tags=["VPN", "Network", "Urgent"])
        create_ticket_scenario("Cannot access Email", TicketStatus.NEW, TicketPriority.HIGH, customers[1], created_delta_mins=30, tags=["Email"])
        
        # Scenario 2: Active Tickets (Assigned)
        t_active = create_ticket_scenario("Printer Jammed", TicketStatus.OPEN, TicketPriority.MEDIUM, customers[2], assignee=agent1, created_delta_mins=120, tags=["Hardware", "Printer"])
        # Add message
        msg = TicketMessage(ticket_id=t_active.id, workspace_id=ws.id, author_user_id=agent1.id, body="Have you tried restarting it?", created_at=datetime.now(timezone.utc) - timedelta(minutes=60))
        db.add(msg)
        
        # Scenario 3: Breached Ticket (Escalated)
        t_breached = create_ticket_scenario("Data Export Failed", TicketStatus.OPEN, TicketPriority.URGENT, customers[3], assignee=agent2, created_delta_mins=600, tags=["Software"]) 
        # Manually force breach state in standard flow logic above would catch it (600 mins > 60 and 480)
        
        # Scenario 4: Resolved/Closed
        create_ticket_scenario("Request for New Mouse", TicketStatus.CLOSED, TicketPriority.LOW, customers[4], assignee=agent1, created_delta_mins=2000, tags=["Hardware"])
        
        # Fill rest with random
        statuses = list(TicketStatus)
        priorities = list(TicketPriority)
        for i in range(20):
            cust = random.choice(customers)
            stat = random.choice(statuses)
            agent = random.choice([agent1, agent2, None]) if stat != TicketStatus.NEW else None
            delta = random.randint(10, 10000)
            create_ticket_scenario(f"Random Issue {i}", stat, random.choice(priorities), cust, assignee=agent, created_delta_mins=delta)

        db.commit()
        print("Seeding Complete!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()

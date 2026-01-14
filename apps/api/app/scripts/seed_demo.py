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

# Realistic customer data
REALISTIC_CUSTOMERS = [
    {
        "email": "maria.garcia@techcorp.com",
        "full_name": "María García López",
        "phone": "+34 612 345 678",
        "anydesk_id": "987 654 321",
        "department": "Marketing",
        "subscription_plan": "pro"
    },
    {
        "email": "john.smith@innovate.io",
        "full_name": "John Smith",
        "phone": "+1 555 123 4567",
        "anydesk_id": "123 456 789",
        "department": "Engineering",
        "subscription_plan": "enterprise"
    },
    {
        "email": "laura.martinez@startup.es",
        "full_name": "Laura Martínez",
        "phone": "+34 655 987 654",
        "anydesk_id": "456 789 123",
        "department": "Sales",
        "subscription_plan": "pro"
    },
    {
        "email": "david.chen@globaltech.com",
        "full_name": "David Chen",
        "phone": "+1 415 555 0123",
        "anydesk_id": "789 123 456",
        "department": "IT",
        "subscription_plan": "enterprise"
    },
    {
        "email": "ana.rodriguez@empresa.com",
        "full_name": "Ana Rodríguez",
        "phone": "+34 622 111 222",
        "anydesk_id": "321 654 987",
        "department": "Finance",
        "subscription_plan": "free"
    }
]

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
        
        # Delete old generic customers
        old_customers = db.query(User).filter(
            User.workspace_id == ws.id,
            User.email.like("cust%@client.com")
        ).all()
        for c in old_customers:
            db.delete(c)
        db.commit()
        print(f"Deleted {len(old_customers)} old generic customers")
            
        # 2. Users
        def create_user(email, name, role, phone=None, anydesk_id=None, department=None, subscription_plan="free"):
            u = db.query(User).filter_by(email=email).first()
            if not u:
                u = User(
                    email=email,
                    full_name=name,
                    password_hash=get_password_hash(PASSWORD),
                    role=role,
                    workspace_id=ws.id,
                    is_active=True,
                    phone=phone,
                    anydesk_id=anydesk_id,
                    department=department,
                    subscription_plan=subscription_plan
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                print(f"Created {role}: {email}")
            return u

        print("Seeding Users...")
        admin = create_user(ADMIN_EMAIL, "Alice Admin", Role.ADMIN, phone="+1 555 000 0001", subscription_plan="enterprise")
        agent1 = create_user("bob@acme.com", "Bob Agent", Role.AGENT, phone="+1 555 000 0002")
        agent2 = create_user("carol@acme.com", "Carol Support", Role.AGENT, phone="+1 555 000 0003")
        
        # Create realistic customers
        customers = []
        for cust_data in REALISTIC_CUSTOMERS:
            c = create_user(
                email=cust_data["email"],
                name=cust_data["full_name"],
                role=Role.CUSTOMER,
                phone=cust_data.get("phone"),
                anydesk_id=cust_data.get("anydesk_id"),
                department=cust_data.get("department"),
                subscription_plan=cust_data.get("subscription_plan", "free")
            )
            customers.append(c)

        # 3. Tags
        print("Seeding Tags...")
        tag_names = ["VPN", "Hardware", "Software", "Network", "Access", "Printer", "Email", "Security"]
        tags_map = {}
        for t_name in tag_names:
            t = db.query(Tag).filter_by(workspace_id=ws.id, name=t_name).first()
            if not t:
                t = Tag(workspace_id=ws.id, name=t_name, color=random.choice(["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]))
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
                first_response_time_minutes=60,
                resolution_time_minutes=480,
                is_active=True
            )
            db.add(policy)
            db.commit()
            db.refresh(policy)
            
        # 5. Tickets
        print("Seeding Tickets...")
        
        def create_ticket_scenario(subject, status, priority, author, assignee=None, created_delta_mins=0, tags=[]):
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
            
            for tag_name in tags:
                if tag_name in tags_map:
                    tt = TicketTag(ticket_id=t.id, tag_id=tags_map[tag_name].id)
                    db.add(tt)
            
            sla_t = TicketSLA(
                ticket_id=t.id,
                workspace_id=ws.id,
                policy_id=policy.id,
                first_response_due_at=created_at + timedelta(minutes=policy.first_response_time_minutes),
                resolution_due_at=created_at + timedelta(minutes=policy.resolution_time_minutes),
                first_response_met=(status != TicketStatus.NEW),
                resolution_met=(status in [TicketStatus.RESOLVED, TicketStatus.CLOSED])
            )
            now = datetime.now(timezone.utc)
            if sla_t.first_response_due_at < now and not sla_t.first_response_met:
                sla_t.first_response_breached = True
            if sla_t.resolution_due_at < now and not sla_t.resolution_met:
                sla_t.resolution_breached = True
                
            db.add(sla_t)
            db.commit()
            
            return t

        # Realistic ticket scenarios
        create_ticket_scenario("VPN not connecting from home office", TicketStatus.NEW, TicketPriority.URGENT, customers[0], created_delta_mins=15, tags=["VPN", "Network"])
        create_ticket_scenario("Cannot access company email on mobile", TicketStatus.OPEN, TicketPriority.HIGH, customers[1], assignee=agent1, created_delta_mins=120, tags=["Email"])
        create_ticket_scenario("Laptop keyboard not working", TicketStatus.PENDING, TicketPriority.MEDIUM, customers[2], assignee=agent2, created_delta_mins=240, tags=["Hardware"])
        create_ticket_scenario("Need software license for Adobe Creative", TicketStatus.OPEN, TicketPriority.LOW, customers[3], assignee=agent1, created_delta_mins=480, tags=["Software"])
        create_ticket_scenario("Printer not printing in color", TicketStatus.RESOLVED, TicketPriority.LOW, customers[4], assignee=agent2, created_delta_mins=1440, tags=["Printer", "Hardware"])
        create_ticket_scenario("Network drive very slow", TicketStatus.OPEN, TicketPriority.MEDIUM, customers[0], assignee=agent1, created_delta_mins=180, tags=["Network"])
        create_ticket_scenario("Password reset needed", TicketStatus.CLOSED, TicketPriority.HIGH, customers[1], assignee=agent2, created_delta_mins=2880, tags=["Security", "Access"])

        db.commit()
        print("Seeding Complete!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()

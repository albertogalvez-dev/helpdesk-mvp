# Helpdesk Product Demo Walkthrough

This guide helps you present the Helpdesk API as a polished product using local seed data and manual automation.

## 1. Setup (Run this first)

```bash
# Start the stack (API + DB + Redis + Worker)
make up

# Wait 10s for DB to be ready, then run migrations
make migrate

# Populate with "Acme IT Services" realistic data
make seed

# Start Frontend (in a new terminal)
cd apps/web && npm run dev
# Open UI: http://127.0.0.1:5173
```

## 2. The Narrative (Demo Script)

### Scenario A: The "Morning Check" (Admin/Agent View)
**Goal**: Show volume of tickets and "Urgent" issues from overnight.

1.  **Login as Admin**:
    - Open `http://127.0.0.1:5173/login`
    - Credentials: `admin@acme.com` / `password123`

2.  **View Dashboard / Ticket List**:
    - Show `GET /api/v1/tickets?sort_by=priority&sort_order=desc` (API) or check Inbox UI.
    - *See*: Tickets sorted by Priority. Look for "VPN Down" (Urgent).

3.  **Check Weekly Report** (API Demo):
    - `GET /api/v1/reports/weekly`
    - *See*: Stats for "Acme IT Services" (Created, Resolved, Breaches).

### Scenario B: The "SLA Breach" (Automation)
**Goal**: Show how the system auto-escalates neglected tickets.

1.  **Simulate Time/Inaction**: 
    - (The seed script already created some "older" open tickets).
    - Or create a new ticket and manually update DB timestamp (advanced).
    - *Easier*: Just run the escalation job to catch any pending breaches from seed.

2.  **Trigger Escalation Manually**:
    ```bash
    make run-job JOB=sla_escalation
    ```
    - Check logs or response: "SLA Escalation Job executed".

3.  **Verify Impact**:
    - List tickets again. Look for tickets that moved to `priority: HIGH` or `URGENT` automatically.
    - Check UI for updated priority.

### Scenario C: The "Resolution"
**Goal**: Agent fixes issue and closes loop in UI.

1.  **Pick a Ticket (e.g., VPN Down)**.
2.  **Assign to Self (Bob Agent)**:
    - Click "Assign to me" or use API.
3.  **Add Internal Note**:
    - "Customer called, verified fix."
4.  **Resolve**:
    - Change Status to "RESOLVED".

### Scenario D: Auto-Close (Maintenance)
**Goal**: System cleaner.

1.  **Run Auto-Close Job**:
    ```bash
    make run-job JOB=auto_close
    ```
    - *Effect*: Any RESOLVED ticket older than 7 days (from seed) becomes CLOSED.

## 3. Reference Data (from Seed)

- **Admin**: `admin@acme.com` / `password123`
- **Agents**: `bob@acme.com`, `carol@acme.com`
- **Customers**: `cust1@client.com` ... `cust5@client.com`
- **Workspace**: Acme IT Services

## 4. Troubleshooting

- **Reset**: To start fresh, `make down`, `docker volume prune` (careful!), then Step 1.
- **Logs**: `make logs` to see worker processing jobs.

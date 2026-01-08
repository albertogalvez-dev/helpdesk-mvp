# Helpdesk MVP - Demo Walkthrough

## Quick Start

### 1. Start Backend (Docker)
```bash
cd infra
docker compose up -d
```

### 2. Start Frontend
```bash
cd apps/web
npm install && npm run dev
```

### 3. Access
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:18000/docs

---

## Test Credentials

| Role | Email | Password | Redirect |
|------|-------|----------|----------|
| **Admin** | admin@acme.com | password123 | /agent/inbox |
| **Agent** | agent@acme.com | password123 | /agent/inbox |
| **Customer** | customer@acme.com | password123 | /portal/tickets |

---

## Demo Flow

### 1. Customer Creates Ticket
1. Login as customer
2. Click "New Ticket"
3. Fill subject: "Printer not working"
4. Add description and submit
5. See ticket in "My Tickets"

### 2. Agent Responds
1. Login as admin/agent
2. Open ticket from Inbox
3. View requester/company info (right panel)
4. Add reply in conversation tab
5. Change status to "OPEN"

### 3. Admin Panel
1. Login as admin
2. Click Admin → Users (view team)
3. Click Admin → Workspace (company settings)
4. Click Admin → SLAs (manage policies)

---

## Features

### Agent Console
- **Inbox**: Ticket list with filters, search, pagination
- **Ticket Detail**: 3-column layout (metadata, conversation, requester info)
- **Reports**: Weekly stats and leaderboard
- **Admin**: User management, workspace settings, SLA policies

### Customer Portal
- **My Tickets**: View all submitted tickets
- **New Ticket**: Create support request
- **Ticket Detail**: View conversation and reply

### Design System
- Lime primary color (#d1f470)
- Dark sidebar theme
- Consistent badges and cards
- Inter typography

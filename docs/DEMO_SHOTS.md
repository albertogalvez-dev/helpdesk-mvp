# Demo Shots Guide

## Pages to Screenshot

### 1. Login Page
**URL:** `/login`
**Show:** Form with lime "Sign In" button

### 2. Agent Inbox
**URL:** `/agent/inbox`
**Show:**
- Search bar and status filter
- Dense ticket table with mixed statuses
- NEW/OPEN/PENDING badges visible
- Relative timestamps

### 3. Ticket Detail (Agent)
**URL:** `/agent/tickets/{id}`
**Show:**
- 3-column layout
- Left: Status/Priority/Assignee actions
- Center: Message timeline with replies
- Right: Requester panel with AnyDesk ID

### 4. Admin Users
**URL:** `/agent/admin/users`
**Show:**
- User table with role badges (admin=purple, agent=lime, customer=gray)
- User avatars

### 5. Admin Workspace
**URL:** `/agent/admin/workspace`
**Show:**
- Company settings form
- Remote support tool field

### 6. Reports
**URL:** `/agent/reports`
**Show:**
- Summary stat cards (Created, Resolved, Breaches)
- Leaderboard table

### 7. Portal - My Tickets
**URL:** `/portal/tickets`
**Show:**
- Clean customer ticket list
- Status badges
- "New Ticket" button in nav

### 8. Portal - Ticket Detail
**URL:** `/portal/tickets/{id}`
**Show:**
- Conversation timeline
- Reply form
- Customer view (no internal notes)

---

## Recommended Demo Data

For best screenshots, ensure seed has:
- 1 ticket with status NEW + priority URGENT
- 1 ticket with SLA breached
- 1 ticket with requester AnyDesk ID populated
- 1 RESOLVED ticket
- At least 3 agents with tickets assigned

---

## Screenshot Dimensions
**Recommended:** 1920x1080 (16:9 viewport)
**Tool:** Browser DevTools → Device toolbar → Custom

# Helpdesk MVP

> **B2B IT Remote Support Platform** – A modern, multi-tenant helpdesk application built for remote IT support teams. Features workspace isolation, SLA management, role-based access, and real-time ticket handling.

---

## 🎯 Features

- **Multi-tenant Architecture** – Complete workspace isolation for B2B clients
- **Role-based Access** – Admin, Agent, and Customer roles with appropriate permissions
- **Ticket Management** – Full lifecycle: create, assign, prioritize, resolve
- **SLA Policies** – Configurable response/resolution times with escalation
- **Customer Portal** – Self-service ticket creation and tracking
- **Agent Console** – Unified inbox with filtering and search
- **Reports & Analytics** – Agent performance and ticket metrics
- **Background Jobs** – Redis Queue (RQ) for SLA checking and email notifications

---

## 🏗️ Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | React 18 + Vite + TailwindCSS | Agent Console & Customer Portal |
| **Backend** | FastAPI (Python 3.11+) | REST API with OpenAPI docs |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache/Queue** | Redis 7 | Session cache & job queue |
| **Worker** | RQ (Redis Queue) | Background job processing |
| **Scheduler** | APScheduler | Periodic SLA checks |
| **Infra** | Docker Compose | Local development stack |

---

## 📁 Repository Structure

```
helpdesk-mvp/
├── apps/
│   ├── api/          # FastAPI backend
│   │   ├── app/      # Application code
│   │   │   ├── modules/   # Feature modules (auth, tickets, sla, etc.)
│   │   │   ├── core/      # Config, security, logging
│   │   │   └── db/        # Database session, models
│   │   ├── alembic/  # Database migrations
│   │   └── tests/    # API tests
│   └── web/          # React frontend
│       └── src/
│           ├── features/  # Feature pages (tickets, portal, admin)
│           ├── components/ # Shared UI components
│           └── lib/       # API client, auth store
├── infra/
│   ├── docker-compose.yml
│   └── scripts/      # Smoke tests, utilities
├── scripts/
│   └── screenshots/  # Automated screenshot capture
├── docs/             # Architecture & design docs
├── @fotos/           # Generated screenshots (after running capture)
├── Makefile          # Common commands
└── .env.example      # Environment template
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose**
- **Make** (optional, for convenience commands)
- **Node.js 18+** (for frontend dev / screenshots)

### 1. Setup Environment

```bash
cp .env.example .env
```

### 2. Start the Stack

```bash
make up
```

This starts all services:

| Service | URL | Description |
|---------|-----|-------------|
| **Web UI** | http://localhost:5173 | React frontend |
| **API** | http://localhost:18000 | FastAPI backend |
| **API Docs** | http://localhost:18000/docs | Swagger UI |
| **ReDoc** | http://localhost:18000/redoc | Alternative API docs |
| **PostgreSQL** | localhost:15432 | Database |
| **Redis** | localhost:16379 | Cache & Queue |

### 3. Verify Health

```bash
curl http://localhost:18000/health
# {"status":"ok","service":"helpdesk-api","version":"0.1.0"}
```

### 4. Seed Demo Data (Optional)

```bash
make seed
```

Creates demo workspace with test users.

---

## 🔑 Default Credentials

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@acme.com` | `password123` |
| Agent | `agent@acme.com` | `password123` |
| Customer | `customer@acme.com` | `password123` |

---

## 📡 API Endpoints

### Health & Docs

```bash
GET  /health         # Health check
GET  /docs           # Swagger UI
GET  /redoc          # ReDoc
```

### Authentication

```bash
POST /api/v1/auth/register   # Create workspace + admin
POST /api/v1/auth/login      # Get JWT token
GET  /api/v1/auth/me         # Current user info
```

### Tickets

```bash
GET    /api/v1/tickets              # List tickets (filtered by role)
POST   /api/v1/tickets              # Create ticket
GET    /api/v1/tickets/{id}         # Get ticket details
PATCH  /api/v1/tickets/{id}         # Update ticket
POST   /api/v1/tickets/{id}/messages # Add message to ticket
```

### Example: Create Ticket

```bash
TOKEN=$(curl -s -X POST http://localhost:18000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@acme.com","password":"password123"}' \
  | jq -r '.data.access_token')

curl -X POST http://localhost:18000/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "VPN not connecting",
    "description": "Unable to connect to corporate VPN since this morning",
    "priority": "high"
  }'
```

> **Note**: All API operations are scoped to the user's workspace (multi-tenant isolation).

---

## 📸 Screenshots

Automated screenshots are generated in `@fotos/` directory.

### Generate Screenshots

```bash
make screenshots
```

This will:
1. Install Playwright dependencies
2. Wait for API health
3. Capture all public pages, API docs, agent console, and customer portal
4. Save to `@fotos/desktop/` with `manifest.json`

### Environment Variables for Screenshot Capture

| Variable | Default | Description |
|----------|---------|-------------|
| `HELP_DESK_BASE_URL` | `http://localhost:18000` | API URL |
| `HELP_DESK_WEB_URL` | `http://localhost:5173` | Web app URL |
| `HELP_DESK_E2E_ADMIN_EMAIL` | `admin@acme.com` | Admin login |
| `HELP_DESK_E2E_ADMIN_PASS` | `password123` | Admin password |

---

## 🧪 Testing

### API Tests

```bash
make test
```

### Smoke Test

```bash
make smoke
```

### Lint & Format

```bash
make lint    # Check code style
make format  # Auto-format code
```

---

## 🛠️ Development

### Backend (API)

```bash
cd apps/api
# With Docker running:
docker compose exec api bash
# Or locally with Poetry:
poetry install
poetry run uvicorn app.main:app --reload
```

### Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

### Database Migrations

```bash
# Run migrations
make migrate

# Create new migration
docker compose exec api alembic revision --autogenerate -m "description"
```

---

## 📋 Available Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | Tail service logs |
| `make ps` | Show running services |
| `make build` | Rebuild containers |
| `make test` | Run API tests |
| `make lint` | Run linter |
| `make format` | Format code |
| `make migrate` | Run DB migrations |
| `make seed` | Seed demo data |
| `make smoke` | Run smoke tests |
| `make screenshots` | Generate screenshots |

---

## 🗺️ Roadmap

- [ ] Email notifications for ticket updates
- [ ] Real-time updates via WebSocket
- [ ] Knowledge base / FAQ module
- [ ] Custom ticket fields per workspace
- [ ] Reporting dashboard with charts
- [ ] Mobile-responsive improvements

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `make test`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

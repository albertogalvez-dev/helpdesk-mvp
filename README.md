# Helpdesk API (B2B IT Remote Support)

MVP scaffold for a multi-tenant helpdesk focused on remote IT support teams.

## Run locally in 2 commands
1) cp .env.example .env
2) make up

## Verify /health
- curl http://localhost:18000/health

## Services and ports
| Service | Container Port | Host Port |
| --- | --- | --- |
| api | 8000 | 18000 |
| postgres | 5432 | 15432 |
| redis | 6379 | 16379 |

## Isolation (no interference)
- COMPOSE_PROJECT_NAME=helpdesk en `.env`
- Volumenes dedicados: helpdesk_pgdata, helpdesk_redisdata
- Red dedicada: helpdesk_net

## Services
- api (FastAPI)
- postgres (PostgreSQL)
- redis
- worker (RQ)
- scheduler

## Repo structure
- apps/api: backend service
- apps/web: placeholder for UI
- infra: docker-compose and scripts
- docs: architecture, workflow, UX specs

## Roadmap (high level)
- Phase 1: Auth y RBAC
- Phase 2: Tickets, SLAs, reportes
- Phase 3: Jobs y scheduler con reglas reales

## Phase 1: Authentication & Workspaces verification
### Register (Create Workspace + Admin)
```bash
curl -X POST http://localhost:18000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"workspace_name":"Acme","admin_email":"admin@acme.com","admin_password":"secure"}'
```

### Login
```bash
curl -X POST http://localhost:18000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"secure"}'
```

### Me (Protected)
```bash
curl http://localhost:18000/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Phase 2: Usage Examples (Tickets)
### Create Ticket (Customer)
```bash
curl -X POST http://localhost:18000/api/v1/tickets \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Printer error","description":"PC Load Letter"}'
```

### List Tickets (Agent - Filtered)
```bash
curl "http://localhost:18000/api/v1/tickets?status=NEW,OPEN&priority=HIGH" \
  -H "Authorization: Bearer <AGENT_TOKEN>"
```

### Add Message (Agent Reply)
```bash
curl -X POST http://localhost:18000/api/v1/tickets/<TICKET_ID>/messages \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"body":"Please restart the printer."}'
```

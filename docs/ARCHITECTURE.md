# Architecture

## System diagram (textual)
[Client] -> [API] -> [Postgres]
[Client] -> [API] -> [Redis] -> [Worker]
[Scheduler] -> [Redis] -> [Worker]

## Services (compose)
- api (FastAPI)
- postgres (PostgreSQL)
- redis
- worker (RQ)
- scheduler (RQ enqueue loop)

## Multi-tenant flow
- workspace_id vendra del token (futuro)
- Router -> Service -> Repo aplica filtros por workspace_id
- Repo nunca lee fuera del scope del workspace

## Auth (conceptual)
- JWT con roles (agent/admin/customer)
- Middleware extrae claims y los pasa al request context

## Modulos y capas
- router -> service -> repo -> models
- schemas (Pydantic) separados de models (SQLAlchemy)

## Respuestas y errores
- Envelope: {"data": ..., "meta": ..., "error": ...}
- Errores con code estable: WORKSPACE_FORBIDDEN, ROLE_REQUIRED, VALIDATION_ERROR, NOT_FOUND

## Paginacion y filtros
- page/size para MVP
- filtros: status, priority, assigned, tag, q, from, to

## Jobs (RQ)
- SLA escalation, auto-close, weekly snapshot
- Scheduler encola trabajos periodicos
- Idempotencia por job_id y locks (futuro)

## Migraciones
- Alembic usa DATABASE_URL
- Ejecutar con make migrate

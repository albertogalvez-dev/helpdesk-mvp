# Workflow

## Requisitos previos
- Docker Desktop y Docker Compose v2
- Python 3.11+ (solo si ejecutas fuera de Docker)
- Make

## Arranque local en 2 comandos
1) cp .env.example .env
2) make up

## Verificar /health
- curl http://localhost:18000/health

## Comandos Makefile
- make up: levanta servicios con build
- make down: baja servicios
- make logs: logs de api con tail
- make ps: estado de servicios
- make test: pytest en contenedor api
- make lint: ruff check
- make format: ruff format
- make migrate: alembic upgrade head (placeholder)

## Aislamiento y puertos (anti-colision)
- Puertos host: API 18000, Postgres 15432, Redis 16379
- Dentro de Docker: Postgres 5432, Redis 6379, API 8000
- Volumenes: helpdesk_pgdata, helpdesk_redisdata
- Red: helpdesk_net
- COMPOSE_PROJECT_NAME=helpdesk para prefijo estable y evitar mezcla de stacks

## Convencion de commits (Conventional Commits)
- feat: nueva funcionalidad
- fix: bugfix
- chore: tareas de mantenimiento
- docs: cambios en documentacion
- test: cambios en tests

Ejemplos
- feat(api): add health endpoint
- docs: add architecture overview

## Checklist DoD
- Proyecto arranca o importa sin errores
- docker-compose levanta servicios sin fallos
- /health responde ok
- ruff format + lint pasan
- pytest configurado y pasa
- docs actualizadas si cambia estructura
- No hay secretos reales en el repo

## Politica de ramas
- main estable
- feature branches para trabajo diario

## Variables de entorno y secretos
- Usar .env local (no versionar)
- Documentar defaults en .env.example
- Rotar secretos en entornos reales

## Politica de seeds
- Seeds reproducibles y no destructivos
- No borrar datos sin confirmacion

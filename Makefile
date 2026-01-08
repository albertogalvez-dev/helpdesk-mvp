.PHONY: up down logs ps build test lint format migrate seed smoke run-job

up:
	docker compose -f infra/docker-compose.yml --env-file .env up -d

down:
	docker compose -f infra/docker-compose.yml --env-file .env down

logs:
	docker compose -f infra/docker-compose.yml --env-file .env logs -f

ps:
	docker compose -f infra/docker-compose.yml --env-file .env ps

build:
	docker compose -f infra/docker-compose.yml --env-file .env build

test:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm -e PYTHONPATH=. api pytest tests/ -vv

lint:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm api ruff check .

format:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm api ruff format .

migrate:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm -e PYTHONPATH=. api alembic upgrade head

seed:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm -e PYTHONPATH=. api python -m app.scripts.seed_demo

smoke:
	./infra/scripts/smoke.sh

# Usage: make run-job JOB=sla_escalation
run-job:
	docker compose -f infra/docker-compose.yml --env-file .env run --rm -e PYTHONPATH=. api curl -X POST http://localhost:8000/api/v1/admin/jobs/run -H "Content-Type: application/json" -d '{"job": "$(JOB)"}' 
	# Note: curl inside container might not reach localhost:8000 of container itself easily if not started. 
	# Better to use external curl if 'up' is running, or python script. 
	# For "run-job" via make, let's assume 'up' is running and we curl from host.
	# But user wants "NO VPS", just local. 
	# If make run-job is from host, we curl localhost:18000 (mapped).
	curl -X POST http://localhost:18000/api/v1/admin/jobs/run \
		-H "Content-Type: application/json" \
		-d '{"job": "$(JOB)"}' \
		-H "Authorization: Bearer $(shell cat .token 2>/dev/null || echo 'LOGIN_FIRST')"

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.core.errors import HelpdeskException
from app.common.responses import ResponseError, APIResponse

# Routers
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.workspaces.router import router as workspaces_router
from app.modules.tickets.router import router as tickets_router
from app.modules.tags.router import router as tags_router
from app.modules.sla.router import router as sla_router
from app.modules.reports.router import router as reports_router
from app.modules.admin.router import router as admin_router


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()

    app = FastAPI(
        title="Helpdesk API",
        version=settings.service_version,
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Exception Handler
    @app.exception_handler(HelpdeskException)
    async def helpdesk_exception_handler(request: Request, exc: HelpdeskException):
        return JSONResponse(
            status_code=exc.status_code,
            content=APIResponse(
                error=ResponseError(
                    code=exc.code,
                    message=exc.message,
                    details=exc.details
                )
            ).model_dump(exclude_none=True)
        )

    @app.get("/health", tags=["Health"])
    def health() -> dict[str, str]:
        return {
            "status": "ok",
            "service": settings.service_name,
            "version": settings.service_version,
        }

    # API V1
    API_PREFIX = "/api/v1"
    
    app.include_router(auth_router, prefix=f"{API_PREFIX}/auth", tags=["Auth"])
    app.include_router(users_router, prefix=f"{API_PREFIX}/users", tags=["Users"])
    app.include_router(workspaces_router, prefix=f"{API_PREFIX}/workspaces", tags=["Workspaces"])
    app.include_router(tickets_router, prefix=f"{API_PREFIX}/tickets", tags=["Tickets"])
    app.include_router(tags_router, prefix=f"{API_PREFIX}/tags", tags=["Tags"])
    app.include_router(sla_router, prefix=f"{API_PREFIX}/slas", tags=["SLA"])
    app.include_router(reports_router, prefix=f"{API_PREFIX}/reports", tags=["Reports"])
    from app.modules.reports.agents import router as agent_stats_router
    app.include_router(agent_stats_router, prefix=f"{API_PREFIX}/reports/agents", tags=["Agent Stats"])
    app.include_router(admin_router, prefix=f"{API_PREFIX}/admin", tags=["Admin"])
    
    return app


app = create_app()

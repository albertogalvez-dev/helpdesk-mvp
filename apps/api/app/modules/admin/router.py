from typing import Annotated
from enum import Enum
from fastapi import APIRouter, Depends, Query, Body, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import Role
from app.modules.auth.deps import require_roles
from app.modules.users.models import User
from app.common.responses import APIResponse
from app.jobs import sla_escalation_job, auto_close_job, weekly_report_job

router = APIRouter()

class JobName(str, Enum):
    SLA_ESCALATION = "sla_escalation"
    AUTO_CLOSE = "auto_close"
    WEEKLY_SNAPSHOT = "weekly_snapshot"

class JobRunRequest(BaseModel):
    job: JobName
    
    model_config = ConfigDict(json_schema_extra={
        "examples": [{"job": "sla_escalation"}]
    })

@router.post("/jobs/run", response_model=APIResponse[dict], status_code=status.HTTP_200_OK)
def run_job_manually(
    job_req: JobRunRequest,
    user: Annotated[User, Depends(require_roles(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Manually trigger a background job. ADMIN only.
    Use for demo or debugging purposes.
    """
    # Simply call the job function synchronously for immediate effect in demo.
    # Alternatively, enqueue it. But for demo, sync is better to "see result instantly".
    # User asked for "SAFE" execution. 
    # Let's run it synchronously so we can return "done".
    
    result_msg = ""
    
    if job_req.job == JobName.SLA_ESCALATION:
        sla_escalation_job()
        result_msg = "SLA Escalation Job executed."
    elif job_req.job == JobName.AUTO_CLOSE:
        auto_close_job()
        result_msg = "Auto-close Job executed."
    elif job_req.job == JobName.WEEKLY_SNAPSHOT:
        weekly_report_job()
        result_msg = "Weekly Snapshot Job executed."
        
    return APIResponse(data={"message": result_msg, "job": job_req.job})

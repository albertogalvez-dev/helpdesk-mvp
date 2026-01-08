# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.modules.workspaces.models import Workspace  # noqa
from app.modules.users.models import User  # noqa
from app.modules.tickets.models import Ticket, TicketMessage  # noqa
from app.modules.tags.models import Tag  # noqa
from app.modules.sla.models import SLAPolicy, TicketSLA # noqa
from app.modules.audit.models import AuditLog # noqa
from app.modules.reports.models import WeeklyReportSnapshot # noqa

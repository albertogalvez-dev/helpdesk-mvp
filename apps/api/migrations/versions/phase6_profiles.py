"""create_profiles_and_modify_db

Revision ID: phase6_profiles
Revises: phase2_base
Create Date: 2026-01-07 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'phase6_profiles'
down_revision: Union[str, None] = '01eabc123456' # We will need to find the actual last revision ID
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create workspace_profiles
    op.create_table('workspace_profiles',
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('company_name', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('contact_email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('contact_phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('support_hours', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('remote_support_tool', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('remote_support_instructions', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('security_notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ),
        sa.PrimaryKeyConstraint('workspace_id')
    )

    # 2. Create user_profiles
    op.create_table('user_profiles',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('department', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('location', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('device_label', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('remote_access_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id')
    )


def downgrade() -> None:
    op.drop_table('user_profiles')
    op.drop_table('workspace_profiles')

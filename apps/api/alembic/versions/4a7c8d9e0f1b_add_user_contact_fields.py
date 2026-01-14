"""add user contact fields

Revision ID: 4a7c8d9e0f1b
Revises: 3e6e2f849030
Create Date: 2026-01-08 17:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a7c8d9e0f1b'
down_revision: Union[str, None] = '3e6e2f849030'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('users', sa.Column('anydesk_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('department', sa.String(), nullable=True))
    op.add_column('users', sa.Column('subscription_plan', sa.String(), nullable=True, server_default='free'))


def downgrade() -> None:
    op.drop_column('users', 'subscription_plan')
    op.drop_column('users', 'department')
    op.drop_column('users', 'anydesk_id')
    op.drop_column('users', 'phone')

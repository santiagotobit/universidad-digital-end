"""Agrega la fecha límite a las tareas.

Revision ID: d012e4a1b2c3
Revises: c012e4a1b2c3
Create Date: 2026-04-17

"""
from alembic import op
import sqlalchemy as sa

revision = "d012e4a1b2c3"
down_revision = "c012e4a1b2c3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("due_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "due_date")

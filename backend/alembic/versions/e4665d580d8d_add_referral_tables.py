"""add referral tables

Revision ID: e4665d580d8d
Revises: 129fdc49f5a6
Create Date: 2025-07-26 13:56:15.821158

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e4665d580d8d"
down_revision: Union[str, None] = "129fdc49f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "referrals",
        "ReferralID",
        existing_type=sa.INTEGER(),
        type_=sa.String(length=36),
        existing_nullable=False,
        existing_server_default=sa.text(
            "nextval('\"referrals_ReferralID_seq\"'::regclass)"
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "referrals",
        "ReferralID",
        existing_type=sa.String(length=36),
        type_=sa.INTEGER(),
        existing_nullable=False,
        existing_server_default=sa.text(
            "nextval('\"referrals_ReferralID_seq\"'::regclass)"
        ),
    )
    # ### end Alembic commands ###

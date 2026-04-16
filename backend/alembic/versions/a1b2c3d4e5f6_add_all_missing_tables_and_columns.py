"""add all missing tables and columns

Revision ID: a1b2c3d4e5f6
Revises: ca52dfcce72d
Create Date: 2026-04-12 00:00:00.000000

Covers everything added after the initial migration:
  - creators: onboarding social columns + enriched analysis columns
  - creator_analyses: missing columns added during development
  - campaigns table (new)
  - investments table (new)
  - genres table (new)
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'ca52dfcce72d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _add_column_if_missing(table: str, column: str, col_type: sa.types.TypeEngine) -> None:
    """Add a column only if it does not already exist (safe for re-runs)."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = [c["name"] for c in inspector.get_columns(table)]
    if column not in existing:
        op.add_column(table, sa.Column(column, col_type, nullable=True))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # ── 1. creators — onboarding social handles ─────────────────────────────
    _add_column_if_missing('creators', 'youtube_url',        sa.String())
    _add_column_if_missing('creators', 'instagram_username', sa.String())
    _add_column_if_missing('creators', 'twitter_handle',     sa.String())
    _add_column_if_missing('creators', 'tiktok_handle',      sa.String())
    _add_column_if_missing('creators', 'linkedin_url',       sa.String())

    # ── 2. creators — enriched analysis columns ──────────────────────────────
    _add_column_if_missing('creators', 'genres',          sa.JSON())
    _add_column_if_missing('creators', 'niche',           sa.String())
    _add_column_if_missing('creators', 'ai_score',        sa.Integer())
    _add_column_if_missing('creators', 'risk_level',      sa.String())
    _add_column_if_missing('creators', 'subscribers_str', sa.String())
    _add_column_if_missing('creators', 'avg_views_str',   sa.String())
    _add_column_if_missing('creators', 'growth_rate_str', sa.String())

    # ── 3. creator_analyses — columns missing from initial migration ─────────
    _add_column_if_missing('creator_analyses', 'news_data',            sa.JSON())
    _add_column_if_missing('creator_analyses', 'social_data',          sa.JSON())
    _add_column_if_missing('creator_analyses', 'life_events',          sa.JSON())
    _add_column_if_missing('creator_analyses', 'controversy_signals',  sa.JSON())
    _add_column_if_missing('creator_analyses', 'scores',               sa.JSON())
    _add_column_if_missing('creator_analyses', 'forecast',             sa.JSON())
    _add_column_if_missing('creator_analyses', 'revenue_proxy',        sa.JSON())
    _add_column_if_missing('creator_analyses', 'narrative',            sa.Text())
    _add_column_if_missing('creator_analyses', 'error',                sa.Text())

    # ── 4. campaigns table ───────────────────────────────────────────────────
    if 'campaigns' not in existing_tables:
        op.create_table(
            'campaigns',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('creator_id', sa.UUID(), nullable=False),
            sa.Column('analysis_id', sa.UUID(), nullable=True),
            sa.Column('term_months', sa.Integer(), nullable=False),
            sa.Column('revenue_share_pct', sa.Float(), nullable=False),
            sa.Column('target_amount', sa.Float(), nullable=False),
            sa.Column('raised_amount', sa.Float(), nullable=False, server_default='0'),
            sa.Column('investor_count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('start_date', sa.String(), nullable=True),
            sa.Column('status', sa.Enum('draft', 'live', 'completed', name='campaign_status'), nullable=False, server_default='live'),
            sa.Column('return_low', sa.Float(), nullable=True),
            sa.Column('return_base', sa.Float(), nullable=True),
            sa.Column('return_high', sa.Float(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['creator_id'], ['creators.id']),
            sa.ForeignKeyConstraint(['analysis_id'], ['creator_analyses.id']),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index('ix_campaigns_creator_id', 'campaigns', ['creator_id'])
        op.create_index('ix_campaigns_analysis_id', 'campaigns', ['analysis_id'])

    # ── 5. investments table ─────────────────────────────────────────────────
    if 'investments' not in existing_tables:
        op.create_table(
            'investments',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('campaign_id', sa.UUID(), nullable=False),
            sa.Column('fan_email', sa.String(), nullable=False),
            sa.Column('fan_name', sa.String(), nullable=True),
            sa.Column('amount', sa.Float(), nullable=False),
            sa.Column('invested_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id']),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index('ix_investments_campaign_id', 'investments', ['campaign_id'])
        op.create_index('ix_investments_fan_email', 'investments', ['fan_email'])

    # ── 6. genres table ──────────────────────────────────────────────────────
    if 'genres' not in existing_tables:
        op.create_table(
            'genres',
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
            sa.PrimaryKeyConstraint('name'),
        )


def downgrade() -> None:
    op.drop_table('genres')
    op.drop_index('ix_investments_fan_email', table_name='investments')
    op.drop_index('ix_investments_campaign_id', table_name='investments')
    op.drop_table('investments')
    op.drop_index('ix_campaigns_analysis_id', table_name='campaigns')
    op.drop_index('ix_campaigns_creator_id', table_name='campaigns')
    op.drop_table('campaigns')

    for col in ['growth_rate_str', 'avg_views_str', 'subscribers_str', 'risk_level',
                'ai_score', 'niche', 'genres', 'linkedin_url', 'tiktok_handle',
                'twitter_handle', 'instagram_username', 'youtube_url']:
        op.drop_column('creators', col)

    for col in ['error', 'narrative', 'revenue_proxy', 'forecast', 'scores',
                'controversy_signals', 'life_events', 'social_data', 'news_data']:
        op.drop_column('creator_analyses', col)

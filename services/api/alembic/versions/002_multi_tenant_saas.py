"""Multi-tenant SaaS foundation schema migration.

Adds user-scoped entities:
- profiles
- broker_providers
- broker_connections
- broker_permissions
- broker_sessions
- strategy_assignments
- automation_runs
- positions
- notifications
- notification_channels
- alert_delivery_logs
- plans
- entitlements
- subscriptions
- feature_flags
- platform_settings
- compliance_approvals
- system_incidents

Adds tenant ownership (user_id) columns across existing tables and backfills legacy data.

Revision ID: 002_multi_tenant_saas
Revises: 001_initial_schema
Create Date: 2026-10-28 17:10:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import json

revision: str = "002_multi_tenant_saas"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001"


def upgrade() -> None:
    # --------------------------------------------------------------------------
    # 1. profiles
    # --------------------------------------------------------------------------
    op.create_table(
        "profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("pan_number_masked", sa.String(length=20), nullable=True),
        sa.Column("kyc_status", sa.String(length=50), nullable=False, server_default="VERIFIED"),
        sa.Column("risk_appetite", sa.String(length=50), nullable=False, server_default="MODERATE"),
        sa.Column("max_capital_allocation", sa.Numeric(precision=15, scale=4), nullable=False, server_default="500000.0000"),
        sa.Column("is_onboarded", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("onboarded_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_profiles_user_id", "profiles", ["user_id"])

    # --------------------------------------------------------------------------
    # 2. broker_providers
    # --------------------------------------------------------------------------
    op.create_table(
        "broker_providers",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("auth_model", sa.String(length=50), nullable=False, server_default="OAUTH2"),
        sa.Column("is_partner_api", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("requires_static_ip", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("api_docs_url", sa.String(length=255), nullable=True),
        sa.Column("login_url", sa.String(length=255), nullable=True),
        sa.Column("capabilities_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # --------------------------------------------------------------------------
    # 3. broker_connections
    # --------------------------------------------------------------------------
    op.create_table(
        "broker_connections",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("provider_id", sa.String(length=50), nullable=False),
        sa.Column("account_id", sa.String(length=100), nullable=True),
        sa.Column("alias", sa.String(length=100), nullable=False, server_default="Primary Broker"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("state", sa.String(length=50), nullable=False, server_default="NOT_CONFIGURED"),
        sa.Column("credentials_encrypted", sa.Text(), nullable=True),
        sa.Column("api_key_masked", sa.String(length=100), nullable=True),
        sa.Column("static_ip_assigned", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["provider_id"], ["broker_providers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_broker_connections_provider_id", "broker_connections", ["provider_id"])
    op.create_index("ix_broker_connections_user_id", "broker_connections", ["user_id"])

    # --------------------------------------------------------------------------
    # 4. broker_permissions
    # --------------------------------------------------------------------------
    op.create_table(
        "broker_permissions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("connection_id", sa.String(length=36), nullable=False),
        sa.Column("can_read_quotes", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("can_read_funds", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("can_read_positions", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("can_execute_orders", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("max_lots_per_order", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("allowed_segments_json", sa.JSON(), nullable=False, server_default='["NFO"]'),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["connection_id"], ["broker_connections.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("connection_id"),
    )
    op.create_index("ix_broker_permissions_connection_id", "broker_permissions", ["connection_id"])

    # --------------------------------------------------------------------------
    # 5. broker_sessions
    # --------------------------------------------------------------------------
    op.create_table(
        "broker_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("connection_id", sa.String(length=36), nullable=False),
        sa.Column("access_token_encrypted", sa.Text(), nullable=True),
        sa.Column("refresh_token_encrypted", sa.Text(), nullable=True),
        sa.Column("session_token_encrypted", sa.Text(), nullable=True),
        sa.Column("feed_token_encrypted", sa.Text(), nullable=True),
        sa.Column("market_feed_status", sa.String(length=50), nullable=False, server_default="DISCONNECTED"),
        sa.Column("order_feed_status", sa.String(length=50), nullable=False, server_default="DISCONNECTED"),
        sa.Column("session_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_valid", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_heartbeat_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("egress_ip_verified", sa.String(length=50), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["connection_id"], ["broker_connections.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("connection_id"),
    )
    op.create_index("ix_broker_sessions_connection_id", "broker_sessions", ["connection_id"])

    # --------------------------------------------------------------------------
    # 6. strategy_assignments
    # --------------------------------------------------------------------------
    op.create_table(
        "strategy_assignments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("strategy_id", sa.String(length=36), nullable=False),
        sa.Column("connection_id", sa.String(length=36), nullable=False),
        sa.Column("version_id", sa.String(length=36), nullable=True),
        sa.Column("trading_mode", sa.String(length=50), nullable=False, server_default="OFF"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("allocated_capital", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0000"),
        sa.Column("max_loss_limit", sa.Numeric(precision=15, scale=4), nullable=False, server_default="3000.0000"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["connection_id"], ["broker_connections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["strategy_id"], ["strategies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["version_id"], ["strategy_versions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_strategy_assignments_connection_id", "strategy_assignments", ["connection_id"])
    op.create_index("ix_strategy_assignments_strategy_id", "strategy_assignments", ["strategy_id"])
    op.create_index("ix_strategy_assignments_user_id", "strategy_assignments", ["user_id"])

    # --------------------------------------------------------------------------
    # 7. automation_runs
    # --------------------------------------------------------------------------
    op.create_table(
        "automation_runs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("strategy_assignment_id", sa.String(length=36), nullable=True),
        sa.Column("strategy_id", sa.String(length=36), nullable=False),
        sa.Column("trading_mode", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("run_date", sa.String(length=20), nullable=False),
        sa.Column("evaluation_summary", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["strategy_assignment_id"], ["strategy_assignments.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["strategy_id"], ["strategies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_automation_runs_run_date", "automation_runs", ["run_date"])
    op.create_index("ix_automation_runs_strategy_assignment_id", "automation_runs", ["strategy_assignment_id"])
    op.create_index("ix_automation_runs_strategy_id", "automation_runs", ["strategy_id"])
    op.create_index("ix_automation_runs_user_id", "automation_runs", ["user_id"])

    # --------------------------------------------------------------------------
    # 8. positions
    # --------------------------------------------------------------------------
    op.create_table(
        "positions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("connection_id", sa.String(length=36), nullable=False),
        sa.Column("trading_symbol", sa.String(length=100), nullable=False),
        sa.Column("instrument_token", sa.String(length=100), nullable=False),
        sa.Column("exchange", sa.String(length=50), nullable=False, server_default="NFO"),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_price", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0000"),
        sa.Column("last_price", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0000"),
        sa.Column("unrealized_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0000"),
        sa.Column("realized_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0000"),
        sa.Column("is_open", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("product", sa.String(length=50), nullable=False, server_default="NRML"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["connection_id"], ["broker_connections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_positions_connection_id", "positions", ["connection_id"])
    op.create_index("ix_positions_instrument_token", "positions", ["instrument_token"])
    op.create_index("ix_positions_user_id", "positions", ["user_id"])

    # --------------------------------------------------------------------------
    # 9. notifications
    # --------------------------------------------------------------------------
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False, server_default="INFO"),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="SYSTEM"),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("data_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    # --------------------------------------------------------------------------
    # 10. notification_channels & system_incidents & alert_delivery_logs
    # --------------------------------------------------------------------------
    op.create_table(
        "system_incidents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("incident_type", sa.String(length=100), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_system_incidents_incident_type", "system_incidents", ["incident_type"])
    op.create_index("ix_system_incidents_severity", "system_incidents", ["severity"])
    op.create_index("ix_system_incidents_user_id", "system_incidents", ["user_id"])

    op.create_table(
        "notification_channels",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("channel_type", sa.String(length=50), nullable=False),
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("min_severity", sa.String(length=50), nullable=False, server_default="WARNING"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notification_channels_user_id", "notification_channels", ["user_id"])

    op.create_table(
        "alert_delivery_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("channel_id", sa.String(length=36), nullable=False),
        sa.Column("incident_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["channel_id"], ["notification_channels.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["incident_id"], ["system_incidents.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alert_delivery_logs_channel_id", "alert_delivery_logs", ["channel_id"])

    # --------------------------------------------------------------------------
    # 11. plans, entitlements, subscriptions
    # --------------------------------------------------------------------------
    op.create_table(
        "plans",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_inr_monthly", sa.Numeric(precision=10, scale=2), nullable=False, server_default="0.00"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "entitlements",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("plan_id", sa.String(length=50), nullable=False),
        sa.Column("max_broker_connections", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("max_active_strategies", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("live_trading_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("historical_retention_days", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("webhook_alerts_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("dedicated_ip_support", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_entitlements_plan_id", "entitlements", ["plan_id"])

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("plan_id", sa.String(length=50), nullable=False, server_default="FREE"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])

    # --------------------------------------------------------------------------
    # 12. feature_flags, platform_settings, compliance_approvals
    # --------------------------------------------------------------------------
    op.create_table(
        "feature_flags",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("is_globally_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("enabled_user_ids_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "platform_settings",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("value_json", sa.JSON(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "compliance_approvals",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("declaration_type", sa.String(length=100), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False, server_default="v1.0"),
        sa.Column("ip_address", sa.String(length=50), nullable=False),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("audit_hash", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_compliance_approvals_user_id", "compliance_approvals", ["user_id"])

    # --------------------------------------------------------------------------
    # 13. Additive Columns to Existing Tables (Tenant Ownership & Linkage)
    # --------------------------------------------------------------------------
    # user_preferences
    op.add_column("user_preferences", sa.Column("default_broker_id", sa.String(length=50), nullable=True))

    # strategies
    op.add_column("strategies", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_strategies_user_id", "strategies", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_strategies_user_id", "strategies", ["user_id"])

    # strategy_versions
    op.add_column("strategy_versions", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_strategy_versions_user_id", "strategy_versions", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_strategy_versions_user_id", "strategy_versions", ["user_id"])

    # strategy_runs
    op.add_column("strategy_runs", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_strategy_runs_user_id", "strategy_runs", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_strategy_runs_user_id", "strategy_runs", ["user_id"])

    # execution_intents
    op.add_column("execution_intents", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_execution_intents_user_id", "execution_intents", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_execution_intents_user_id", "execution_intents", ["user_id"])

    # orders
    op.add_column("orders", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.add_column("orders", sa.Column("broker_connection_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_orders_user_id", "orders", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("fk_orders_broker_connection_id", "orders", "broker_connections", ["broker_connection_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_broker_connection_id", "orders", ["broker_connection_id"])

    # executions
    op.add_column("executions", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_executions_user_id", "executions", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_executions_user_id", "executions", ["user_id"])

    # account_snapshots
    op.add_column("account_snapshots", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_account_snapshots_user_id", "account_snapshots", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_account_snapshots_user_id", "account_snapshots", ["user_id"])

    # position_snapshots
    op.add_column("position_snapshots", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_position_snapshots_user_id", "position_snapshots", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_position_snapshots_user_id", "position_snapshots", ["user_id"])

    # trade_cycles
    op.add_column("trade_cycles", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_trade_cycles_user_id", "trade_cycles", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_trade_cycles_user_id", "trade_cycles", ["user_id"])

    # charge_entries
    op.add_column("charge_entries", sa.Column("user_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_charge_entries_user_id", "charge_entries", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_charge_entries_user_id", "charge_entries", ["user_id"])

    # --------------------------------------------------------------------------
    # 14. Data Seeding & Legacy Backfill
    # --------------------------------------------------------------------------
    # Ensure default user exists
    op.execute(
        sa.text(
            f"""
            INSERT INTO users (id, email, full_name, is_active, created_at, updated_at)
            VALUES ('{DEFAULT_TENANT_ID}', 'trader@autotrader.local', 'Primary Trader', true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            """
        )
    )

    # Backfill orphaned legacy trading records to DEFAULT_TENANT_ID
    for table_name in [
        "strategies",
        "strategy_versions",
        "strategy_runs",
        "execution_intents",
        "orders",
        "executions",
        "trade_cycles",
        "charge_entries",
        "account_snapshots",
        "position_snapshots",
    ]:
        op.execute(
            sa.text(
                f"""
                UPDATE {table_name}
                SET user_id = '{DEFAULT_TENANT_ID}'
                WHERE user_id IS NULL;
                """
            )
        )

    # Seed default broker providers
    broker_providers_data = [
        ("KOTAK_NEO", "Kotak Neo", "OAUTH2", False, True, True, "https://www.kotaksecurities.com/tradeapi", "https://neo.kotaksecurities.com"),
        ("ZERODHA_KITE", "Zerodha Kite Connect", "OAUTH2", False, True, False, "https://kite.trade/docs/connect/v3", "https://kite.zerodha.com"),
        ("UPSTOX", "Upstox API v2", "OAUTH2", False, True, False, "https://upstox.com/developer/api-documentation", "https://login.upstox.com"),
        ("ANGEL_ONE", "Angel One SmartAPI", "SESSION_TOKEN", False, True, False, "https://smartapi.angelbroking.com", "https://smartapi.angelbroking.com"),
        ("DHAN", "Dhan HQ API", "STATIC_API_KEY", False, True, True, "https://dhanhq.co/docs", "https://login.dhan.co"),
        ("FYERS", "Fyers API v3", "OAUTH2", False, True, False, "https://myapi.fyers.in/docsv3", "https://api.fyers.in"),
    ]
    for b_id, name, auth_model, is_partner, is_active, req_static_ip, docs_url, login_url in broker_providers_data:
        op.execute(
            sa.text(
                f"""
                INSERT INTO broker_providers (id, name, auth_model, is_partner_api, is_active, requires_static_ip, api_docs_url, login_url, capabilities_json, created_at, updated_at)
                VALUES ('{b_id}', '{name}', '{auth_model}', {str(is_partner).lower()}, {str(is_active).lower()}, {str(req_static_ip).lower()}, '{docs_url}', '{login_url}', '{{}}', NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
                """
            )
        )

    # Seed default plans & entitlements
    plans_data = [
        ("FREE", "Free Tier", "Essential observation and backtesting suite", 0.00),
        ("STARTER", "Starter Trader", "Single broker connection with manual order execution", 999.00),
        ("PRO", "Professional Trader", "Multi-broker connectivity and automated strategy execution", 2499.00),
        ("ENTERPRISE", "Enterprise / Prop", "Dedicated static egress IPs and unlimited broker accounts", 9999.00),
    ]
    for p_id, p_name, p_desc, p_price in plans_data:
        op.execute(
            sa.text(
                f"""
                INSERT INTO plans (id, name, description, price_inr_monthly, is_active, created_at)
                VALUES ('{p_id}', '{p_name}', '{p_desc}', {p_price}, true, NOW())
                ON CONFLICT (id) DO NOTHING;
                """
            )
        )

    # Entitlements
    entitlements_data = [
        ("ent-free", "FREE", 1, 1, False, 30, False, False),
        ("ent-starter", "STARTER", 1, 2, False, 90, True, False),
        ("ent-pro", "PRO", 3, 5, True, 365, True, False),
        ("ent-enterprise", "ENTERPRISE", 10, 20, True, 1825, True, True),
    ]
    for e_id, p_id, max_conn, max_strat, live_en, ret_days, wh_en, ip_sup in entitlements_data:
        op.execute(
            sa.text(
                f"""
                INSERT INTO entitlements (id, plan_id, max_broker_connections, max_active_strategies, live_trading_enabled, historical_retention_days, webhook_alerts_enabled, dedicated_ip_support)
                VALUES ('{e_id}', '{p_id}', {max_conn}, {max_strat}, {str(live_en).lower()}, {ret_days}, {str(wh_en).lower()}, {str(ip_sup).lower()})
                ON CONFLICT (id) DO NOTHING;
                """
            )
        )

    # Seed default subscription and profile for default user
    op.execute(
        sa.text(
            f"""
            INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
            VALUES ('sub-{DEFAULT_TENANT_ID}', '{DEFAULT_TENANT_ID}', 'PRO', 'ACTIVE', NOW(), NOW() + INTERVAL '365 days', false, NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING;
            """
        )
    )

    op.execute(
        sa.text(
            f"""
            INSERT INTO profiles (id, user_id, phone_number, pan_number_masked, kyc_status, risk_appetite, max_capital_allocation, is_onboarded, onboarded_at, created_at, updated_at)
            VALUES ('prof-{DEFAULT_TENANT_ID}', '{DEFAULT_TENANT_ID}', '+919999999999', 'ABCDE1234F', 'VERIFIED', 'MODERATE', 500000.0000, true, NOW(), NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING;
            """
        )
    )

    # Seed default platform settings
    platform_settings = [
        ("SYSTEM_TICK_SIZE", "0.05", "Standard minimum price movement for Indian equity derivatives"),
        ("DEFAULT_SLIPPAGE_TOLERANCE_PCT", "0.20", "Max permitted slippage percentage for limit-market fills"),
        ("CIRCUIT_BREAKER_MAX_DRAWDOWN_PCT", "3.00", "Daily account drawdown threshold triggering automatic lockout"),
    ]
    for s_id, s_val, s_desc in platform_settings:
        val_json = json.dumps(s_val)
        op.execute(
            sa.text(
                f"""
                INSERT INTO platform_settings (id, value_json, version, description, updated_by, updated_at)
                VALUES ('{s_id}', '{val_json}', 1, '{s_desc}', 'SYSTEM', NOW())
                ON CONFLICT (id) DO NOTHING;
                """
            )
        )


def downgrade() -> None:
    # Remove added foreign keys and columns
    op.drop_constraint("fk_charge_entries_user_id", "charge_entries", type_="foreignkey")
    op.drop_index("ix_charge_entries_user_id", table_name="charge_entries")
    op.drop_column("charge_entries", "user_id")

    op.drop_constraint("fk_trade_cycles_user_id", "trade_cycles", type_="foreignkey")
    op.drop_index("ix_trade_cycles_user_id", table_name="trade_cycles")
    op.drop_column("trade_cycles", "user_id")

    op.drop_constraint("fk_position_snapshots_user_id", "position_snapshots", type_="foreignkey")
    op.drop_index("ix_position_snapshots_user_id", table_name="position_snapshots")
    op.drop_column("position_snapshots", "user_id")

    op.drop_constraint("fk_account_snapshots_user_id", "account_snapshots", type_="foreignkey")
    op.drop_index("ix_account_snapshots_user_id", table_name="account_snapshots")
    op.drop_column("account_snapshots", "user_id")

    op.drop_constraint("fk_executions_user_id", "executions", type_="foreignkey")
    op.drop_index("ix_executions_user_id", table_name="executions")
    op.drop_column("executions", "user_id")

    op.drop_constraint("fk_orders_broker_connection_id", "orders", type_="foreignkey")
    op.drop_constraint("fk_orders_user_id", "orders", type_="foreignkey")
    op.drop_index("ix_orders_broker_connection_id", table_name="orders")
    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_column("orders", "broker_connection_id")
    op.drop_column("orders", "user_id")

    op.drop_constraint("fk_execution_intents_user_id", "execution_intents", type_="foreignkey")
    op.drop_index("ix_execution_intents_user_id", table_name="execution_intents")
    op.drop_column("execution_intents", "user_id")

    op.drop_constraint("fk_strategy_runs_user_id", "strategy_runs", type_="foreignkey")
    op.drop_index("ix_strategy_runs_user_id", table_name="strategy_runs")
    op.drop_column("strategy_runs", "user_id")

    op.drop_constraint("fk_strategy_versions_user_id", "strategy_versions", type_="foreignkey")
    op.drop_index("ix_strategy_versions_user_id", table_name="strategy_versions")
    op.drop_column("strategy_versions", "user_id")

    op.drop_constraint("fk_strategies_user_id", "strategies", type_="foreignkey")
    op.drop_index("ix_strategies_user_id", table_name="strategies")
    op.drop_column("strategies", "user_id")

    op.drop_column("user_preferences", "default_broker_id")

    # Drop tables in reverse creation order
    op.drop_table("compliance_approvals")
    op.drop_table("platform_settings")
    op.drop_table("feature_flags")
    op.drop_table("subscriptions")
    op.drop_table("entitlements")
    op.drop_table("plans")
    op.drop_table("alert_delivery_logs")
    op.drop_table("notification_channels")
    op.drop_table("system_incidents")
    op.drop_table("notifications")
    op.drop_table("positions")
    op.drop_table("automation_runs")
    op.drop_table("strategy_assignments")
    op.drop_table("broker_sessions")
    op.drop_table("broker_permissions")
    op.drop_table("broker_connections")
    op.drop_table("broker_providers")
    op.drop_table("profiles")

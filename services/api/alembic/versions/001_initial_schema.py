"""Initial migration schema for all 21 trading system tables.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-28 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. user_preferences
    op.create_table(
        "user_preferences",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("theme", sa.String(length=50), nullable=False, server_default="dark"),
        sa.Column("default_lot_size", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("sound_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])

    # 3. broker_accounts
    op.create_table(
        "broker_accounts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("broker_name", sa.String(length=100), nullable=False, server_default="KOTAK_NEO"),
        sa.Column("account_id", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("consumer_key_masked", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_broker_accounts_user_id", "broker_accounts", ["user_id"])

    # 4. broker_connection_status
    op.create_table(
        "broker_connection_status",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("broker_account_id", sa.String(length=36), nullable=False),
        sa.Column("state", sa.String(length=50), nullable=False, server_default="NOT_CONFIGURED"),
        sa.Column("market_feed_status", sa.String(length=50), nullable=False, server_default="DISCONNECTED"),
        sa.Column("order_feed_status", sa.String(length=50), nullable=False, server_default="DISCONNECTED"),
        sa.Column("report_api_status", sa.String(length=50), nullable=False, server_default="DISCONNECTED"),
        sa.Column("static_ip_compliant", sa.Boolean(), nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("session_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["broker_account_id"], ["broker_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("broker_account_id"),
    )
    op.create_index("ix_broker_connection_status_broker_account_id", "broker_connection_status", ["broker_account_id"])

    # 5. instruments
    op.create_table(
        "instruments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("instrument_token", sa.String(length=100), nullable=False),
        sa.Column("trading_symbol", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=True),
        sa.Column("exchange", sa.String(length=50), nullable=False),
        sa.Column("instrument_type", sa.String(length=50), nullable=False),
        sa.Column("option_type", sa.String(length=10), nullable=True),
        sa.Column("strike_price", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("expiry_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lot_size", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("tick_size", sa.Numeric(precision=10, scale=4), nullable=False, server_default="0.05"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_instruments_instrument_token", "instruments", ["instrument_token"], unique=True)
    op.create_index("ix_instruments_trading_symbol", "instruments", ["trading_symbol"])

    # 6. account_snapshots
    op.create_table(
        "account_snapshots",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("broker_account_id", sa.String(length=36), nullable=False),
        sa.Column("available_cash", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("used_margin", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("available_margin", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("total_collateral", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("unrealized_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("realized_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("as_of", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["broker_account_id"], ["broker_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_account_snapshots_broker_account_id", "account_snapshots", ["broker_account_id"])
    op.create_index("ix_account_snapshots_timestamp", "account_snapshots", ["timestamp"])

    # 7. position_snapshots
    op.create_table(
        "position_snapshots",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("broker_account_id", sa.String(length=36), nullable=False),
        sa.Column("instrument_token", sa.String(length=100), nullable=False),
        sa.Column("trading_symbol", sa.String(length=100), nullable=False),
        sa.Column("exchange", sa.String(length=50), nullable=False),
        sa.Column("instrument_type", sa.String(length=50), nullable=False),
        sa.Column("option_type", sa.String(length=10), nullable=True),
        sa.Column("strike_price", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("expiry_date", sa.String(length=50), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_price", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("last_price", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("day_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("product", sa.String(length=50), nullable=False, server_default="NRML"),
        sa.Column("side", sa.String(length=20), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["broker_account_id"], ["broker_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_position_snapshots_broker_account_id", "position_snapshots", ["broker_account_id"])
    op.create_index("ix_position_snapshots_instrument_token", "position_snapshots", ["instrument_token"])
    op.create_index("ix_position_snapshots_timestamp", "position_snapshots", ["timestamp"])

    # 8. strategies
    op.create_table(
        "strategies",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("trading_mode", sa.String(length=50), nullable=False, server_default="OFF"),
        sa.Column("current_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # 9. strategy_versions
    op.create_table(
        "strategy_versions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strategy_id", sa.String(length=36), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("config_json", sa.JSON(), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("change_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["strategy_id"], ["strategies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_strategy_versions_strategy_id", "strategy_versions", ["strategy_id"])

    # 10. strategy_runs
    op.create_table(
        "strategy_runs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strategy_id", sa.String(length=36), nullable=False),
        sa.Column("strategy_version_id", sa.String(length=36), nullable=True),
        sa.Column("trading_mode", sa.String(length=50), nullable=False),
        sa.Column("engine_state", sa.String(length=50), nullable=False, server_default="STOPPED"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_trades", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("realized_pnl", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.ForeignKeyConstraint(["strategy_id"], ["strategies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["strategy_version_id"], ["strategy_versions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_strategy_runs_strategy_id", "strategy_runs", ["strategy_id"])
    op.create_index("ix_strategy_runs_strategy_version_id", "strategy_runs", ["strategy_version_id"])

    # 11. trade_cycles
    op.create_table(
        "trade_cycles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strategy_run_id", sa.String(length=36), nullable=True),
        sa.Column("trading_mode", sa.String(length=50), nullable=False, server_default="OFF"),
        sa.Column("state", sa.String(length=50), nullable=False, server_default="PENDING_ENTRY"),
        sa.Column("entry_order_id", sa.String(length=36), nullable=True),
        sa.Column("exit_order_id", sa.String(length=36), nullable=True),
        sa.Column("realized_pnl", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("net_pnl", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["strategy_run_id"], ["strategy_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trade_cycles_strategy_run_id", "trade_cycles", ["strategy_run_id"])
    op.create_index("ix_trade_cycles_state", "trade_cycles", ["state"])

    # 12. orders
    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("broker_account_id", sa.String(length=36), nullable=True),
        sa.Column("strategy_run_id", sa.String(length=36), nullable=True),
        sa.Column("trade_cycle_id", sa.String(length=36), nullable=True),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("broker_order_id", sa.String(length=100), nullable=True),
        sa.Column("trading_symbol", sa.String(length=100), nullable=False),
        sa.Column("exchange", sa.String(length=50), nullable=False),
        sa.Column("side", sa.String(length=20), nullable=False),
        sa.Column("order_type", sa.String(length=50), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("filled_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("price", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("trigger_price", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("average_filled_price", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("status_message", sa.Text(), nullable=True),
        sa.Column("placed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["broker_account_id"], ["broker_accounts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["strategy_run_id"], ["strategy_runs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["trade_cycle_id"], ["trade_cycles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_idempotency_key", "orders", ["idempotency_key"], unique=True)
    op.create_index("ix_orders_broker_order_id", "orders", ["broker_order_id"])
    op.create_index("ix_orders_status", "orders", ["status"])

    # 13. order_events
    op.create_table(
        "order_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_events_order_id", "order_events", ["order_id"])

    # 14. executions
    op.create_table(
        "executions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("broker_trade_id", sa.String(length=100), nullable=False),
        sa.Column("trading_symbol", sa.String(length=100), nullable=False),
        sa.Column("exchange", sa.String(length=50), nullable=False),
        sa.Column("side", sa.String(length=20), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column("trade_time", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_executions_order_id", "executions", ["order_id"])
    op.create_index("ix_executions_broker_trade_id", "executions", ["broker_trade_id"], unique=True)

    # 15. charge_entries
    op.create_table(
        "charge_entries",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("trade_cycle_id", sa.String(length=36), nullable=False),
        sa.Column("execution_id", sa.String(length=36), nullable=True),
        sa.Column("brokerage", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("stt", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("exchange_txn_charge", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("gst", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("sebi_charges", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("stamp_duty", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("total_charges", sa.Numeric(precision=15, scale=4), nullable=False, server_default="0.0"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["trade_cycle_id"], ["trade_cycles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["execution_id"], ["executions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_charge_entries_trade_cycle_id", "charge_entries", ["trade_cycle_id"])

    # 16. execution_intents
    op.create_table(
        "execution_intents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strategy_run_id", sa.String(length=36), nullable=False),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("intent_type", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("parameters_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["strategy_run_id"], ["strategy_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_execution_intents_strategy_run_id", "execution_intents", ["strategy_run_id"])
    op.create_index("ix_execution_intents_idempotency_key", "execution_intents", ["idempotency_key"], unique=True)

    # 17. risk_events
    op.create_table(
        "risk_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strategy_run_id", sa.String(length=36), nullable=True),
        sa.Column("rule_name", sa.String(length=100), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("details_json", sa.JSON(), nullable=True),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["strategy_run_id"], ["strategy_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_risk_events_strategy_run_id", "risk_events", ["strategy_run_id"])

    # 18. system_events
    op.create_table(
        "system_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("details_json", sa.JSON(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_system_events_timestamp", "system_events", ["timestamp"])

    # 19. worker_heartbeats
    op.create_table(
        "worker_heartbeats",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("worker_id", sa.String(length=100), nullable=False),
        sa.Column("hostname", sa.String(length=255), nullable=False),
        sa.Column("engine_state", sa.String(length=50), nullable=False),
        sa.Column("trading_mode", sa.String(length=50), nullable=False),
        sa.Column("is_leader", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_heartbeat_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_worker_heartbeats_worker_id", "worker_heartbeats", ["worker_id"])
    op.create_index("ix_worker_heartbeats_last_heartbeat_at", "worker_heartbeats", ["last_heartbeat_at"])

    # 20. reconciliation_runs
    op.create_table(
        "reconciliation_runs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("worker_id", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("discrepancies_found", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("summary_json", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # 21. audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("entity_type", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=100), nullable=True),
        sa.Column("diff_json", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("reconciliation_runs")
    op.drop_table("worker_heartbeats")
    op.drop_table("system_events")
    op.drop_table("risk_events")
    op.drop_table("execution_intents")
    op.drop_table("charge_entries")
    op.drop_table("executions")
    op.drop_table("order_events")
    op.drop_table("orders")
    op.drop_table("trade_cycles")
    op.drop_table("strategy_runs")
    op.drop_table("strategy_versions")
    op.drop_table("strategies")
    op.drop_table("position_snapshots")
    op.drop_table("account_snapshots")
    op.drop_table("instruments")
    op.drop_table("broker_connection_status")
    op.drop_table("broker_accounts")
    op.drop_table("user_preferences")
    op.drop_table("users")

"""SQLAlchemy 2.x ORM models for all 21 financial trading tables."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import (
    BrokerConnectionState,
    EngineState,
    Exchange,
    InstrumentType,
    OptionType,
    OrderSide,
    OrderStatus,
    OrderType,
    SystemEventSeverity,
    TradeCycleState,
    TradingMode,
)


def gen_uuid() -> str:
    """Generate RFC 4122 UUID4 string."""
    return str(uuid.uuid4())


def now_utc() -> datetime:
    """Current timestamp in UTC timezone."""
    return datetime.now(timezone.utc)


class JSONType(TypeDecorator):
    """Platform-independent JSON type that uses JSONB on Postgres and JSON on SQLite."""
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(JSON())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    broker_accounts: Mapped[List["BrokerAccount"]] = relationship("BrokerAccount", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    theme: Mapped[str] = mapped_column(String(50), default="dark", nullable=False)
    default_lot_size: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="preferences")


class BrokerAccount(Base):
    __tablename__ = "broker_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_name: Mapped[str] = mapped_column(String(100), default="KOTAK_NEO", nullable=False)
    account_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    consumer_key_masked: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="broker_accounts")
    connection_status: Mapped[Optional["BrokerConnectionStatus"]] = relationship("BrokerConnectionStatus", back_populates="broker_account", uselist=False, cascade="all, delete-orphan")
    account_snapshots: Mapped[List["AccountSnapshot"]] = relationship("AccountSnapshot", back_populates="broker_account", cascade="all, delete-orphan")
    position_snapshots: Mapped[List["PositionSnapshot"]] = relationship("PositionSnapshot", back_populates="broker_account", cascade="all, delete-orphan")


class BrokerConnectionStatus(Base):
    __tablename__ = "broker_connection_status"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    broker_account_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), default=BrokerConnectionState.NOT_CONFIGURED.value, nullable=False)
    market_feed_status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    order_feed_status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    report_api_status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    static_ip_compliant: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    connected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    session_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    broker_account: Mapped["BrokerAccount"] = relationship("BrokerAccount", back_populates="connection_status")


class Instrument(Base):
    __tablename__ = "instruments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    instrument_token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    exchange: Mapped[str] = mapped_column(String(50), nullable=False)
    instrument_type: Mapped[str] = mapped_column(String(50), nullable=False)
    option_type: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    strike_price: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    lot_size: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    tick_size: Mapped[float] = mapped_column(Numeric(10, 4), default=0.05, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)


class AccountSnapshot(Base):
    __tablename__ = "account_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    broker_account_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    available_cash: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    used_margin: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    available_margin: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    total_collateral: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    unrealized_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    realized_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)
    as_of: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    broker_account: Mapped["BrokerAccount"] = relationship("BrokerAccount", back_populates="account_snapshots")


class PositionSnapshot(Base):
    __tablename__ = "position_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    broker_account_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    instrument_token: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    exchange: Mapped[str] = mapped_column(String(50), nullable=False)
    instrument_type: Mapped[str] = mapped_column(String(50), nullable=False)
    option_type: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    strike_price: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    last_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    day_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    product: Mapped[str] = mapped_column(String(50), default="NRML", nullable=False)
    side: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)

    broker_account: Mapped["BrokerAccount"] = relationship("BrokerAccount", back_populates="position_snapshots")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    broker_account_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("broker_accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    strategy_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    trade_cycle_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("trade_cycles.id", ondelete="SET NULL"), nullable=True, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    broker_order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    exchange: Mapped[str] = mapped_column(String(50), nullable=False)
    side: Mapped[str] = mapped_column(String(20), nullable=False)
    order_type: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    filled_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    trigger_price: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    average_filled_price: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=OrderStatus.PENDING.value, nullable=False, index=True)
    status_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    events: Mapped[List["OrderEvent"]] = relationship("OrderEvent", back_populates="order", cascade="all, delete-orphan")
    executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="order", cascade="all, delete-orphan")


class OrderEvent(Base):
    __tablename__ = "order_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="events")


class Execution(Base):
    __tablename__ = "executions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_trade_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    exchange: Mapped[str] = mapped_column(String(50), nullable=False)
    side: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    trade_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="executions")


class TradeCycle(Base):
    __tablename__ = "trade_cycles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    trading_mode: Mapped[str] = mapped_column(String(50), default=TradingMode.OFF.value, nullable=False)
    state: Mapped[str] = mapped_column(String(50), default=TradeCycleState.PENDING_ENTRY.value, nullable=False, index=True)
    entry_order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    exit_order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    realized_pnl: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    net_pnl: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    charges: Mapped[List["ChargeEntry"]] = relationship("ChargeEntry", back_populates="trade_cycle", cascade="all, delete-orphan")


class ChargeEntry(Base):
    __tablename__ = "charge_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    trade_cycle_id: Mapped[str] = mapped_column(String(36), ForeignKey("trade_cycles.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("executions.id", ondelete="SET NULL"), nullable=True)
    brokerage: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    stt: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    exchange_txn_charge: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    gst: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    sebi_charges: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    stamp_duty: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    total_charges: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    trade_cycle: Mapped["TradeCycle"] = relationship("TradeCycle", back_populates="charges")


class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(50), default=TradingMode.OFF.value, nullable=False)
    current_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    versions: Mapped[List["StrategyVersion"]] = relationship("StrategyVersion", back_populates="strategy", cascade="all, delete-orphan")
    runs: Mapped[List["StrategyRun"]] = relationship("StrategyRun", back_populates="strategy", cascade="all, delete-orphan")


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    config_json: Mapped[Dict[str, Any]] = mapped_column(JSONType, nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    change_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    strategy: Mapped["Strategy"] = relationship("Strategy", back_populates="versions")
    runs: Mapped[List["StrategyRun"]] = relationship("StrategyRun", back_populates="version")


class StrategyRun(Base):
    __tablename__ = "strategy_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_version_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_versions.id", ondelete="SET NULL"), nullable=True, index=True)
    trading_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    engine_state: Mapped[str] = mapped_column(String(50), default=EngineState.STOPPED.value, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    total_trades: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    realized_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)

    strategy: Mapped["Strategy"] = relationship("Strategy", back_populates="runs")
    version: Mapped[Optional["StrategyVersion"]] = relationship("StrategyVersion", back_populates="runs")
    intents: Mapped[List["ExecutionIntent"]] = relationship("ExecutionIntent", back_populates="strategy_run", cascade="all, delete-orphan")
    risk_events: Mapped[List["RiskEvent"]] = relationship("RiskEvent", back_populates="strategy_run", cascade="all, delete-orphan")


class ExecutionIntent(Base):
    __tablename__ = "execution_intents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    intent_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    parameters_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    strategy_run: Mapped["StrategyRun"] = relationship("StrategyRun", back_populates="intents")


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="CASCADE"), nullable=True, index=True)
    rule_name: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    strategy_run: Mapped[Optional["StrategyRun"]] = relationship("StrategyRun", back_populates="risk_events")


class SystemEvent(Base):
    __tablename__ = "system_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class WorkerHeartbeat(Base):
    __tablename__ = "worker_heartbeats"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    worker_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    engine_state: Mapped[str] = mapped_column(String(50), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    is_leader: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_heartbeat_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    worker_id: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    discrepancies_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    summary_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    diff_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class SystemIncident(Base):
    __tablename__ = "system_incidents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    incident_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False, index=True)
    details_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class NotificationChannel(Base):
    __tablename__ = "notification_channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    channel_type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    min_severity: Mapped[str] = mapped_column(String(50), default="WARNING", nullable=False)
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)


class AlertDeliveryLog(Base):
    __tablename__ = "alert_delivery_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("system_incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_type: Mapped[str] = mapped_column(String(50), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)

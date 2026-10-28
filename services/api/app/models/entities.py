"""SQLAlchemy 2.x ORM models for all Multi-Tenant SaaS trading system tables."""

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
    SupportedBroker,
    BrokerAuthModel,
    SubscriptionPlanTier,
    SubscriptionStatus,
    ComplianceDeclarationType,
    AutomationRunStatus,
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


# ==============================================================================
# 1. USER & IDENTITY MODELS (Tenant Boundary)
# ==============================================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    broker_accounts: Mapped[List["BrokerAccount"]] = relationship("BrokerAccount", back_populates="user", cascade="all, delete-orphan")
    broker_connections: Mapped[List["BrokerConnection"]] = relationship("BrokerConnection", back_populates="user", cascade="all, delete-orphan")
    strategies: Mapped[List["Strategy"]] = relationship("Strategy", back_populates="user", cascade="all, delete-orphan")
    strategy_assignments: Mapped[List["StrategyAssignment"]] = relationship("StrategyAssignment", back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    positions: Mapped[List["Position"]] = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    trade_cycles: Mapped[List["TradeCycle"]] = relationship("TradeCycle", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    compliance_approvals: Mapped[List["ComplianceApproval"]] = relationship("ComplianceApproval", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    """User profile for KYC, contact, and trader risk classification."""
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pan_number_masked: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    kyc_status: Mapped[str] = mapped_column(String(50), default="VERIFIED", nullable=False)
    risk_appetite: Mapped[str] = mapped_column(String(50), default="MODERATE", nullable=False)
    is_onboarded: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    onboarded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="profile")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    theme: Mapped[str] = mapped_column(String(50), default="light", nullable=False)
    default_lot_size: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    default_broker_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="preferences")


# ==============================================================================
# 2. MULTI-BROKER PROVIDER & CONNECTION MODELS
# ==============================================================================

class BrokerProvider(Base):
    """Catalog of supported brokers (Kotak Neo, Zerodha Kite, Upstox, Angel One, Dhan, Fyers)."""
    __tablename__ = "broker_providers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g. KOTAK_NEO, ZERODHA_KITE
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    auth_model: Mapped[str] = mapped_column(String(50), default=BrokerAuthModel.OAUTH2.value, nullable=False)
    is_partner_api: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    requires_static_ip: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    api_docs_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    login_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    capabilities_json: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    connections: Mapped[List["BrokerConnection"]] = relationship("BrokerConnection", back_populates="provider")


class BrokerConnection(Base):
    """User-scoped broker connection instance with encrypted credentials."""
    __tablename__ = "broker_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[str] = mapped_column(String(50), ForeignKey("broker_providers.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Client trading code e.g. X123456
    alias: Mapped[str] = mapped_column(String(100), default="Primary Broker", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    state: Mapped[str] = mapped_column(String(50), default=BrokerConnectionState.NOT_CONFIGURED.value, nullable=False)
    credentials_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # AES-256-GCM ciphertext
    api_key_masked: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    static_ip_assigned: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="broker_connections")
    provider: Mapped["BrokerProvider"] = relationship("BrokerProvider", back_populates="connections")
    permissions: Mapped[Optional["BrokerPermission"]] = relationship("BrokerPermission", back_populates="connection", uselist=False, cascade="all, delete-orphan")
    session: Mapped[Optional["BrokerSession"]] = relationship("BrokerSession", back_populates="connection", uselist=False, cascade="all, delete-orphan")
    positions: Mapped[List["Position"]] = relationship("Position", back_populates="connection", cascade="all, delete-orphan")
    strategy_assignments: Mapped[List["StrategyAssignment"]] = relationship("StrategyAssignment", back_populates="connection")


class BrokerPermission(Base):
    """Scoped execution permissions per broker connection."""
    __tablename__ = "broker_permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    connection_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_connections.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    can_read_quotes: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_read_funds: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_read_positions: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_execute_orders: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # Requires explicit compliance unlock
    max_lots_per_order: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    allowed_segments_json: Mapped[List[str]] = mapped_column(JSONType, default=lambda: ["NFO"], nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    connection: Mapped["BrokerConnection"] = relationship("BrokerConnection", back_populates="permissions")


class BrokerSession(Base):
    """Active daily authenticated session tokens and feed state."""
    __tablename__ = "broker_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    connection_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_connections.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    access_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    refresh_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    session_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    feed_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    market_feed_status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    order_feed_status: Mapped[str] = mapped_column(String(50), default="DISCONNECTED", nullable=False)
    session_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_heartbeat_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    egress_ip_verified: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    connection: Mapped["BrokerConnection"] = relationship("BrokerConnection", back_populates="session")


# Preserved legacy broker account model for backward compatibility
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


# ==============================================================================
# 3. INSTRUMENTS & MARKET TELEMETRY
# ==============================================================================

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


# ==============================================================================
# 4. STRATEGIES, VERSIONS & ASSIGNMENTS (User-Scoped)
# ==============================================================================

class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(50), default=TradingMode.OFF.value, nullable=False)
    current_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="strategies")
    versions: Mapped[List["StrategyVersion"]] = relationship("StrategyVersion", back_populates="strategy", cascade="all, delete-orphan")
    runs: Mapped[List["StrategyRun"]] = relationship("StrategyRun", back_populates="strategy", cascade="all, delete-orphan")
    assignments: Mapped[List["StrategyAssignment"]] = relationship("StrategyAssignment", back_populates="strategy", cascade="all, delete-orphan")


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    config_json: Mapped[Dict[str, Any]] = mapped_column(JSONType, nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    change_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    strategy: Mapped["Strategy"] = relationship("Strategy", back_populates="versions")
    runs: Mapped[List["StrategyRun"]] = relationship("StrategyRun", back_populates="version")


class StrategyAssignment(Base):
    """Binds an approved strategy version to an active broker connection with capital allocation."""
    __tablename__ = "strategy_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    connection_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_connections.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id: Optional[Mapped[str]] = mapped_column(String(36), ForeignKey("strategy_versions.id", ondelete="SET NULL"), nullable=True)
    trading_mode: Mapped[str] = mapped_column(String(50), default=TradingMode.OFF.value, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allocated_capital: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    max_loss_limit: Mapped[float] = mapped_column(Numeric(15, 4), default=3000.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="strategy_assignments")
    strategy: Mapped["Strategy"] = relationship("Strategy", back_populates="assignments")
    connection: Mapped["BrokerConnection"] = relationship("BrokerConnection", back_populates="strategy_assignments")
    automation_runs: Mapped[List["AutomationRun"]] = relationship("AutomationRun", back_populates="assignment")


class AutomationRun(Base):
    """Daily automation execution history per strategy assignment."""
    __tablename__ = "automation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_assignment_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_assignments.id", ondelete="SET NULL"), nullable=True, index=True)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    trading_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=AutomationRunStatus.PENDING.value, nullable=False)
    run_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    evaluation_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    assignment: Mapped[Optional["StrategyAssignment"]] = relationship("StrategyAssignment", back_populates="automation_runs")


class StrategyRun(Base):
    __tablename__ = "strategy_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_version_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_versions.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    side: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    target_price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    stop_loss_price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    strategy_run: Mapped["StrategyRun"] = relationship("StrategyRun", back_populates="intents")


# ==============================================================================
# 5. ORDERS, FILLS, POSITIONS & SNAPSHOTS (User-Scoped)
# ==============================================================================

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    broker_account_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("broker_accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    broker_connection_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("broker_connections.id", ondelete="SET NULL"), nullable=True, index=True)
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

    user: Mapped[Optional["User"]] = relationship("User", back_populates="orders")
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
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    broker_trade_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    exchange: Mapped[str] = mapped_column(String(50), nullable=False)
    side: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    trade_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="executions")


class Position(Base):
    """Normalized open/closed positions table per user and connection."""
    __tablename__ = "positions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    connection_id: Mapped[str] = mapped_column(String(36), ForeignKey("broker_connections.id", ondelete="CASCADE"), nullable=False, index=True)
    trading_symbol: Mapped[str] = mapped_column(String(100), nullable=False)
    instrument_token: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    exchange: Mapped[str] = mapped_column(String(50), default="NFO", nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    last_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    unrealized_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    realized_pnl: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    product: Mapped[str] = mapped_column(String(50), default="NRML", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="positions")
    connection: Mapped["BrokerConnection"] = relationship("BrokerConnection", back_populates="positions")


class AccountSnapshot(Base):
    __tablename__ = "account_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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


# ==============================================================================
# 6. TRADE CYCLES & CHARGES (User-Scoped Accounting)
# ==============================================================================

class TradeCycle(Base):
    __tablename__ = "trade_cycles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    strategy_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    trading_mode: Mapped[str] = mapped_column(String(50), default=TradingMode.OFF.value, nullable=False)
    state: Mapped[str] = mapped_column(String(50), default=TradeCycleState.PENDING_ENTRY.value, nullable=False, index=True)
    entry_order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    exit_order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    realized_pnl: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    net_pnl: Mapped[Optional[float]] = mapped_column(Numeric(15, 4), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="trade_cycles")
    charges: Mapped[List["ChargeEntry"]] = relationship("ChargeEntry", back_populates="trade_cycle", cascade="all, delete-orphan")


class ChargeEntry(Base):
    __tablename__ = "charge_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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


# ==============================================================================
# 7. NOTIFICATIONS & ALERTS (User-Scoped)
# ==============================================================================

class Notification(Base):
    """User in-app notifications and alert delivery log."""
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default=SystemEventSeverity.INFO.value, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="SYSTEM", nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    data_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")


class NotificationChannel(Base):
    __tablename__ = "notification_channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    channel_type: Mapped[str] = mapped_column(String(50), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    min_severity: Mapped[str] = mapped_column(String(50), default=SystemEventSeverity.WARNING.value, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    deliveries: Mapped[List["AlertDeliveryLog"]] = relationship("AlertDeliveryLog", back_populates="channel", cascade="all, delete-orphan")


class AlertDeliveryLog(Base):
    __tablename__ = "alert_delivery_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    channel_id: Mapped[str] = mapped_column(String(36), ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("system_incidents.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    channel: Mapped["NotificationChannel"] = relationship("NotificationChannel", back_populates="deliveries")


# ==============================================================================
# 8. SUBSCRIPTIONS, PLANS & ENTITLEMENTS
# ==============================================================================

class Plan(Base):
    """SaaS pricing plan definitions (FREE, STARTER, PRO, ENTERPRISE)."""
    __tablename__ = "plans"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # FREE, STARTER, PRO, ENTERPRISE
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price_inr_monthly: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    entitlements: Mapped[List["Entitlement"]] = relationship("Entitlement", back_populates="plan", cascade="all, delete-orphan")
    subscriptions: Mapped[List["Subscription"]] = relationship("Subscription", back_populates="plan")


class Entitlement(Base):
    """Specific quota limits assigned to a pricing plan."""
    __tablename__ = "entitlements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    plan_id: Mapped[str] = mapped_column(String(50), ForeignKey("plans.id", ondelete="CASCADE"), nullable=False, index=True)
    max_broker_connections: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_active_strategies: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    live_trading_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    historical_retention_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    webhook_alerts_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dedicated_ip_support: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    plan: Mapped["Plan"] = relationship("Plan", back_populates="entitlements")


class Subscription(Base):
    """Trader subscription state and active plan."""
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(50), ForeignKey("plans.id", ondelete="CASCADE"), default=SubscriptionPlanTier.FREE.value, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=SubscriptionStatus.ACTIVE.value, nullable=False)
    current_period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="subscription")
    plan: Mapped["Plan"] = relationship("Plan", back_populates="subscriptions")


# ==============================================================================
# 9. PLATFORM SETTINGS, FEATURE FLAGS & COMPLIANCE
# ==============================================================================

class FeatureFlag(Base):
    """Platform-wide and targeted per-user feature switches."""
    __tablename__ = "feature_flags"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # Flag key e.g. "MULTI_BROKER_OAUTH"
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    is_globally_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    enabled_user_ids_json: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)


class PlatformSetting(Base):
    """Validated, versioned system-wide settings with audit log."""
    __tablename__ = "platform_settings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g. "DEFAULT_STRIKE_DISTANCE"
    value_json: Mapped[Any] = mapped_column(JSONType, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)


class ComplianceApproval(Base):
    """Immutable audit of user regulatory declarations and risk sign-offs."""
    __tablename__ = "compliance_approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    declaration_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. RETAIL_ALGO_ACKNOWLEDGMENT
    version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    audit_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="compliance_approvals")


# ==============================================================================
# 10. SYSTEM EVENTS, AUDIT LOGS, WATCHDOG & INCIDENTS
# ==============================================================================

class SystemEvent(Base):
    __tablename__ = "system_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    strategy_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategy_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_name: Mapped[str] = mapped_column(String(100), nullable=False)
    limit_value: Mapped[str] = mapped_column(String(100), nullable=False)
    actual_value: Mapped[str] = mapped_column(String(100), nullable=False)
    action_taken: Mapped[str] = mapped_column(String(50), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    strategy_run: Mapped["StrategyRun"] = relationship("StrategyRun", back_populates="risk_events")


class WorkerHeartbeat(Base):
    __tablename__ = "worker_heartbeats"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    worker_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hostname: Mapped[str] = mapped_column(String(100), nullable=False)
    is_leader: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    engine_state: Mapped[str] = mapped_column(String(50), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    discrepancies_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    report_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    entity_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    diff_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False, index=True)


class SystemIncident(Base):
    __tablename__ = "system_incidents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)


# Domain Model Aliases for Task 2 Specification
BrokerOrder = Order
BrokerFill = Execution
ChargeRecord = ChargeEntry

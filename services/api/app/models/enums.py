"""Domain enums mirroring packages/api-contracts/src/index.ts."""

from enum import Enum


class TradingMode(str, Enum):
    OFF = "OFF"
    PAPER = "PAPER"
    LIVE = "LIVE"


class EngineState(str, Enum):
    STOPPED = "STOPPED"
    STARTING = "STARTING"
    READY = "READY"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    RECONCILING = "RECONCILING"
    DEGRADED = "DEGRADED"
    ERROR = "ERROR"
    RISK_LOCKED = "RISK_LOCKED"


class BrokerConnectionState(str, Enum):
    # Rule 24 Genuine States
    NOT_CONFIGURED = "NOT_CONFIGURED"
    ACCESS_PENDING = "ACCESS_PENDING"
    LOADING = "LOADING"
    READY = "READY"
    STALE = "STALE"
    NOT_CONNECTED = "NOT_CONNECTED"
    ERROR = "ERROR"
    UNSUPPORTED = "UNSUPPORTED"
    # Backward compatibility shims
    DISCONNECTED = "DISCONNECTED"
    CONNECTING = "CONNECTING"
    CONNECTED = "CONNECTED"
    SESSION_EXPIRED = "SESSION_EXPIRED"


class SupportedBroker(str, Enum):
    KOTAK_NEO = "KOTAK_NEO"
    ZERODHA_KITE = "ZERODHA_KITE"
    UPSTOX = "UPSTOX"
    ANGEL_ONE = "ANGEL_ONE"
    DHAN = "DHAN"
    FYERS = "FYERS"


class BrokerAuthModel(str, Enum):
    OAUTH2 = "OAUTH2"
    CREDENTIAL_TOTP = "CREDENTIAL_TOTP"
    ACCESS_TOKEN = "ACCESS_TOKEN"


class SubscriptionPlanTier(str, Enum):
    FREE = "FREE"
    STARTER = "STARTER"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    TRIAL = "TRIAL"
    PAST_DUE = "PAST_DUE"
    CANCELLED = "CANCELLED"


class ComplianceDeclarationType(str, Enum):
    RETAIL_ALGO_ACKNOWLEDGMENT = "RETAIL_ALGO_ACKNOWLEDGMENT"
    RISK_DISCLOSURE_DERIVATIVES = "RISK_DISCLOSURE_DERIVATIVES"
    STATIC_IP_CONSENT = "STATIC_IP_CONSENT"
    TERMS_OF_SERVICE = "TERMS_OF_SERVICE"


class AutomationRunStatus(str, Enum):
    PENDING = "PENDING"
    EVALUATING = "EVALUATING"
    SIGNAL_GENERATED = "SIGNAL_GENERATED"
    ORDER_PLACED = "ORDER_PLACED"
    SKIPPED = "SKIPPED"
    FAILED = "FAILED"


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    SL = "SL"
    SL_MARKET = "SL_MARKET"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    OPEN = "OPEN"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    ERROR = "ERROR"


class OrderLifecycleState(str, Enum):
    CREATED = "CREATED"
    VALIDATING = "VALIDATING"
    AWAITING_SUBMISSION = "AWAITING_SUBMISSION"
    SUBMITTING = "SUBMITTING"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    OPEN = "OPEN"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCEL_PENDING = "CANCEL_PENDING"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    UNKNOWN = "UNKNOWN"
    RECONCILING = "RECONCILING"


class MarketTrendState(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    SIDEWAYS = "SIDEWAYS"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    STALE_DATA = "STALE_DATA"
    MARKET_CLOSED = "MARKET_CLOSED"


class OptionType(str, Enum):
    CE = "CE"
    PE = "PE"


class InstrumentType(str, Enum):
    EQUITY = "EQUITY"
    FUTURES = "FUTURES"
    OPTIONS = "OPTIONS"
    INDEX = "INDEX"


class Exchange(str, Enum):
    NSE = "NSE"
    NFO = "NFO"
    BSE = "BSE"
    BFO = "BFO"
    CDS = "CDS"
    MCX = "MCX"


class TradeCycleState(str, Enum):
    PENDING_ENTRY = "PENDING_ENTRY"
    ENTRY_PLACED = "ENTRY_PLACED"
    IN_POSITION = "IN_POSITION"
    EXIT_PLACED = "EXIT_PLACED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"
    ERROR = "ERROR"


class SystemEventSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class DataFreshness(str, Enum):
    LIVE = "LIVE"
    RECENT = "RECENT"
    STALE = "STALE"
    UNAVAILABLE = "UNAVAILABLE"

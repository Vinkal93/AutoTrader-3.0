"""Strategy management, template seeding, and strict risk validation service."""

import logging
import re
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import BrokerConnection, Strategy, StrategyVersion
from app.models.enums import InstrumentType, TradingMode
from app.schemas.strategy import (
    LiveReadiness,
    Strategy as StrategySchema,
    StrategyConfig,
    StrategyControlAction,
    StrategyControlResponse,
    StrategyCreateRequest,
    StrategyUpdateRequest,
    StrategyValidationError,
    StrategyValidationResult,
    StrategyValidationWarning,
)

logger = logging.getLogger(__name__)

DEFAULT_STRATEGY_ID = "10000000-0000-0000-0000-000000000001"
DEFAULT_STRATEGY_NAME = "NIFTY 12:20 Rule-Based Directional Buyer"
DEFAULT_STRATEGY_DESCRIPTION = (
    "Algorithmic options buying strategy targeting momentum breakouts at 12:20 PM IST "
    "using 5m candles and EMA 9/21 cross. Premium target 40-45. Unvalidated strategy parameters."
)

REQUIRED_LIVE_RISK_FIELDS = [
    "max_risk_per_trade",
    "max_daily_loss",
    "min_trading_funds",
    "max_bid_ask_spread",
    "min_liquidity",
    "entry_price_tolerance",
    "max_data_age_seconds",
    "max_order_wait_seconds",
    "time_based_exit_ist",
    "expiry_selection_policy",
    "market_holiday_behavior",
    "automated_recovery_policy",
]


class StrategyService:
    """Business logic for strategy configurations, safety validations, and versioning."""

    @staticmethod
    def get_default_config() -> StrategyConfig:
        """Returns the base unconfigured template matching TASK 1 & 4."""
        return StrategyConfig(
            underlying="NIFTY",
            instrument_type=InstrumentType.OPTIONS,
            entry_time_ist="12:20",
            premium_min="40.00",
            premium_max="45.00",
            target_premium_move="1.00",
            initial_stop_loss="3.00",
            candle_interval="5m",
            trend_indicators=["EMA_9", "EMA_21"],
            max_trades_per_day=1,
            lot_count=1,
            sideways_action="SKIP",
            direction="AUTO",
            connection_id=None,
            broker_account_id=None,
            # Risk limits are explicitly unconfigured (None)
            max_risk_per_trade=None,
            max_daily_loss=None,
            min_trading_funds=None,
            max_bid_ask_spread=None,
            min_liquidity=None,
            entry_price_tolerance=None,
            max_data_age_seconds=None,
            max_order_wait_seconds=None,
            time_based_exit_ist="15:15",
            expiry_selection_policy="CURRENT_WEEK",
            market_holiday_behavior="SKIP",
            automated_recovery_policy="PAUSE",
        )

    @classmethod
    def get_nifty_template(cls) -> Dict[str, Any]:
        """Original NIFTY 12:20 PM strategy template with compliance disclaimers."""
        return {
            "name": "NIFTY 12:20 Momentum Breakout",
            "description": "Rule-based directional options buyer targeting ₹1 profit movement at 12:20 PM IST.",
            "tradingMode": "PAPER",
            "disclaimer": "Unvalidated strategy parameters, not proven profitable settings. User is solely responsible for backtesting and evaluating risk. Stop-Loss Limit orders do not guarantee execution in market gaps.",
            "config": {
                "underlying": "NIFTY",
                "instrumentType": "OPTIONS",
                "direction": "AUTO",
                "entryTimeIST": "12:20",
                "timeBasedExitIST": "15:15",
                "candleInterval": "5m",
                "trendIndicators": ["EMA_9", "EMA_21"],
                "premiumMin": "40.00",
                "premiumMax": "45.00",
                "targetPremiumMove": "1.00",
                "initialStopLoss": "3.00",
                "maxTradesPerDay": 1,
                "lotCount": 1,
                "sidewaysAction": "SKIP",
                "maxRiskPerTrade": "1500.00",
                "maxDailyLoss": "3000.00",
                "minTradingFunds": "10000.00",
                "maxBidAskSpread": "1.50",
                "minLiquidity": 50,
                "entryPriceTolerance": "0.50",
                "maxDataAgeSeconds": 10,
                "maxOrderWaitSeconds": 30,
                "expirySelectionPolicy": "CURRENT_WEEK",
                "marketHolidayBehavior": "SKIP",
                "automatedRecoveryPolicy": "PAUSE",
            },
        }

    @classmethod
    def validate_config(cls, config: StrategyConfig) -> StrategyValidationResult:
        """Thoroughly validate strategy parameters and verify LIVE trading readiness."""
        errors: List[StrategyValidationError] = []
        warnings: List[StrategyValidationWarning] = []

        # 1. Premium Range Validation
        try:
            p_min = Decimal(config.premium_min)
            p_max = Decimal(config.premium_max)
            if p_min <= Decimal("0"):
                errors.append(
                    StrategyValidationError(
                        field="premiumMin",
                        message="Minimum premium must be greater than zero",
                        code="INVALID_PREMIUM_MIN",
                    )
                )
            if p_max <= p_min:
                errors.append(
                    StrategyValidationError(
                        field="premiumMax",
                        message="Maximum premium must exceed minimum premium",
                        code="INVALID_PREMIUM_RANGE",
                    )
                )
        except Exception:
            errors.append(
                StrategyValidationError(
                    field="premiumRange",
                    message="Premium range must be valid decimal numbers",
                    code="MALFORMED_DECIMAL",
                )
            )

        # 2. Target & Stop Loss Validation
        try:
            target = Decimal(config.target_premium_move)
            stop_loss = Decimal(config.initial_stop_loss)
            if target <= Decimal("0"):
                errors.append(
                    StrategyValidationError(
                        field="targetPremiumMove",
                        message="Target premium move must be positive",
                        code="INVALID_TARGET",
                    )
                )
            if stop_loss <= Decimal("0"):
                errors.append(
                    StrategyValidationError(
                        field="initialStopLoss",
                        message="Initial stop loss must be positive",
                        code="INVALID_STOP_LOSS",
                    )
                )

            # Warning on unfavorable risk/reward
            if target > 0 and stop_loss > target * Decimal("3"):
                warnings.append(
                    StrategyValidationWarning(
                        field="riskRewardRatio",
                        message=f"Stop loss ({stop_loss}) is more than 3x the profit target ({target}). This represents an unfavorable risk-reward ratio.",
                    )
                )
        except Exception:
            errors.append(
                StrategyValidationError(
                    field="targetOrStopLoss",
                    message="Target and stop loss must be valid decimals",
                    code="MALFORMED_DECIMAL",
                )
            )

        # 3. Entry Time Validation (HH:mm in IST, 09:15 - 15:30)
        time_pattern = r"^([01]\d|2[0-3]):([0-5]\d)$"
        if not re.match(time_pattern, config.entry_time_ist):
            errors.append(
                StrategyValidationError(
                    field="entryTimeIST",
                    message="Entry time must be in HH:mm format (e.g. 12:20)",
                    code="INVALID_TIME_FORMAT",
                )
            )
        else:
            parts = config.entry_time_ist.split(":")
            h, m = int(parts[0]), int(parts[1])
            mins = h * 60 + m
            market_open = 9 * 60 + 15
            market_close = 15 * 60 + 30
            if mins < market_open or mins > market_close:
                errors.append(
                    StrategyValidationError(
                        field="entryTimeIST",
                        message="Entry time must be within Indian market hours (09:15 to 15:30 IST)",
                        code="TIME_OUT_OF_MARKET_HOURS",
                    )
                )

        # 4. Trades & Lot Count
        if config.max_trades_per_day < 1:
            errors.append(
                StrategyValidationError(
                    field="maxTradesPerDay",
                    message="Max trades per day must be at least 1",
                    code="INVALID_MAX_TRADES",
                )
            )
        if config.lot_count < 1:
            errors.append(
                StrategyValidationError(
                    field="lotCount",
                    message="Lot count must be at least 1",
                    code="INVALID_LOT_COUNT",
                )
            )

        # 5. Live Readiness Check: All risk limits must be configured
        missing_fields: List[str] = []
        for field in REQUIRED_LIVE_RISK_FIELDS:
            val = getattr(config, field, None)
            if val is None or (isinstance(val, str) and not val.strip()):
                parts = field.split("_")
                camel_field = parts[0] + "".join(p.capitalize() for p in parts[1:])
                missing_fields.append(camel_field)

        live_ready = len(missing_fields) == 0 and len(errors) == 0

        if missing_fields:
            warnings.append(
                StrategyValidationWarning(
                    field="riskLimits",
                    message=f"Missing {len(missing_fields)} risk management fields required before LIVE mode can be armed.",
                )
            )

        return StrategyValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            live_readiness=LiveReadiness(
                ready=live_ready,
                missing_required_fields=missing_fields,
            ),
        )

    @classmethod
    async def seed_default_strategy_if_empty(cls, db: AsyncSession) -> Strategy:
        """Seed initial strategy template if no strategies exist in DB."""
        stmt = select(Strategy).limit(1)
        res = await db.execute(stmt)
        existing = res.scalars().first()
        if existing:
            return existing

        default_cfg = cls.get_default_config()
        strat = Strategy(
            id=DEFAULT_STRATEGY_ID,
            name=DEFAULT_STRATEGY_NAME,
            description=DEFAULT_STRATEGY_DESCRIPTION,
            is_active=True,
            trading_mode=TradingMode.OFF.value,
            current_version=1,
        )
        db.add(strat)
        await db.flush()

        ver = StrategyVersion(
            strategy_id=strat.id,
            version_number=1,
            config_json=default_cfg.model_dump(by_alias=True),
            created_by="system",
            change_reason="Default initial seed template",
        )
        db.add(ver)
        await db.commit()
        await db.refresh(strat)
        logger.info(f"Seeded default strategy: {strat.id}")
        return strat

    @classmethod
    async def get_all_strategies(cls, db: AsyncSession, user_id: Optional[str] = None) -> List[StrategySchema]:
        """Fetch all strategies with latest version configs, filtered by user if provided."""
        stmt = select(Strategy)
        if user_id:
            stmt = stmt.where((Strategy.user_id == user_id) | (Strategy.user_id.is_(None)))
        stmt = stmt.order_by(Strategy.created_at.desc())
        res = await db.execute(stmt)
        strats = res.scalars().all()
        results: List[StrategySchema] = []
        for s in strats:
            v_stmt = (
                select(StrategyVersion)
                .where(
                    StrategyVersion.strategy_id == s.id,
                    StrategyVersion.version_number == s.current_version,
                )
                .limit(1)
            )
            v_res = await db.execute(v_stmt)
            ver = v_res.scalars().first()
            cfg_dict = ver.config_json if ver else cls.get_default_config().model_dump(by_alias=True)

            conn_id = s.broker_connection_id or cfg_dict.get("connectionId")
            broker_account_id = cfg_dict.get("brokerAccountId")
            if conn_id and not broker_account_id:
                conn_res = await db.execute(select(BrokerConnection).where(BrokerConnection.id == conn_id).limit(1))
                conn_obj = conn_res.scalars().first()
                if conn_obj:
                    broker_account_id = conn_obj.account_id

            results.append(
                StrategySchema(
                    id=s.id,
                    name=s.name,
                    description=s.description or "",
                    version=s.current_version,
                    current_version=s.current_version,
                    is_active=s.is_active,
                    trading_mode=TradingMode(s.trading_mode),
                    config=StrategyConfig.model_validate(cfg_dict),
                    user_id=s.user_id,
                    connection_id=conn_id,
                    broker_account_id=broker_account_id,
                    created_at=s.created_at.isoformat(),
                    updated_at=s.updated_at.isoformat(),
                )
            )
        return results

    @classmethod
    async def get_active_strategy(cls, db: AsyncSession, user_id: Optional[str] = None) -> Optional[StrategySchema]:
        """Get the currently active strategy."""
        stmt = select(Strategy).where(Strategy.is_active.is_(True))
        if user_id:
            stmt = stmt.where((Strategy.user_id == user_id) | (Strategy.user_id.is_(None)))
        stmt = stmt.order_by(Strategy.updated_at.desc()).limit(1)
        res = await db.execute(stmt)
        strat = res.scalars().first()
        if not strat:
            strat = await cls.seed_default_strategy_if_empty(db)

        v_stmt = (
            select(StrategyVersion)
            .where(
                StrategyVersion.strategy_id == strat.id,
                StrategyVersion.version_number == strat.current_version,
            )
            .limit(1)
        )
        v_res = await db.execute(v_stmt)
        ver = v_res.scalars().first()
        cfg_dict = ver.config_json if ver else cls.get_default_config().model_dump(by_alias=True)

        conn_id = strat.broker_connection_id or cfg_dict.get("connectionId")
        broker_account_id = cfg_dict.get("brokerAccountId")
        if conn_id and not broker_account_id:
            conn_res = await db.execute(select(BrokerConnection).where(BrokerConnection.id == conn_id).limit(1))
            conn_obj = conn_res.scalars().first()
            if conn_obj:
                broker_account_id = conn_obj.account_id

        return StrategySchema(
            id=strat.id,
            name=strat.name,
            description=strat.description or "",
            version=strat.current_version,
            current_version=strat.current_version,
            is_active=strat.is_active,
            trading_mode=TradingMode(strat.trading_mode),
            config=StrategyConfig.model_validate(cfg_dict),
            user_id=strat.user_id,
            connection_id=conn_id,
            broker_account_id=broker_account_id,
            created_at=strat.created_at.isoformat(),
            updated_at=strat.updated_at.isoformat(),
        )

    @classmethod
    async def create_user_strategy(
        cls,
        user_id: str,
        payload: StrategyCreateRequest,
        db: AsyncSession,
        user_email: str = "trader",
    ) -> Tuple[StrategySchema, StrategyValidationResult]:
        """Create an independently isolated strategy configuration for a user."""
        validation = cls.validate_config(payload.config)
        if not validation.is_valid:
            raise ValueError("; ".join(f"{e.field}: {e.message}" for e in validation.errors))

        conn_id = payload.connection_id or payload.config.connection_id
        broker_account_id = payload.config.broker_account_id
        if conn_id and not broker_account_id:
            conn_res = await db.execute(select(BrokerConnection).where(BrokerConnection.id == conn_id).limit(1))
            conn_obj = conn_res.scalars().first()
            if conn_obj:
                broker_account_id = conn_obj.account_id

        strat = Strategy(
            user_id=user_id,
            broker_connection_id=conn_id,
            name=payload.name,
            description=payload.description or "",
            is_active=True,
            trading_mode=(payload.trading_mode or TradingMode.PAPER).value,
            current_version=1,
        )
        db.add(strat)
        await db.flush()

        ver = StrategyVersion(
            strategy_id=strat.id,
            user_id=user_id,
            version_number=1,
            config_json=payload.config.model_dump(by_alias=True),
            created_by=user_email,
            change_reason="Initial user strategy creation",
        )
        db.add(ver)
        await db.commit()
        await db.refresh(strat)

        return (
            StrategySchema(
                id=strat.id,
                name=strat.name,
                description=strat.description or "",
                version=strat.current_version,
                current_version=strat.current_version,
                is_active=strat.is_active,
                trading_mode=TradingMode(strat.trading_mode),
                config=payload.config,
                user_id=strat.user_id,
                connection_id=conn_id,
                broker_account_id=broker_account_id,
                created_at=strat.created_at.isoformat(),
                updated_at=strat.updated_at.isoformat(),
            ),
            validation,
        )

    @classmethod
    async def update_strategy(
        cls,
        strategy_id: str,
        update_data: StrategyUpdateRequest,
        db: AsyncSession,
        user_email: str = "system",
    ) -> Tuple[StrategySchema, StrategyValidationResult]:
        """Update strategy configuration, validate changes, and create new version."""
        stmt = select(Strategy).where(Strategy.id == strategy_id)
        res = await db.execute(stmt)
        strat = res.scalars().first()
        if not strat:
            raise ValueError(f"Strategy {strategy_id} not found")

        if update_data.name is not None:
            strat.name = update_data.name
        if update_data.description is not None:
            strat.description = update_data.description
        if update_data.is_active is not None:
            strat.is_active = update_data.is_active
        if update_data.trading_mode is not None:
            strat.trading_mode = update_data.trading_mode.value

        v_stmt = (
            select(StrategyVersion)
            .where(
                StrategyVersion.strategy_id == strat.id,
                StrategyVersion.version_number == strat.current_version,
            )
            .limit(1)
        )
        v_res = await db.execute(v_stmt)
        latest_ver = v_res.scalars().first()

        current_cfg = (
            StrategyConfig.model_validate(latest_ver.config_json)
            if latest_ver
            else cls.get_default_config()
        )

        new_config = update_data.config or current_cfg
        validation_result = cls.validate_config(new_config)

        if not validation_result.is_valid:
            return (
                StrategySchema(
                    id=strat.id,
                    name=strat.name,
                    description=strat.description or "",
                    version=strat.current_version,
                    current_version=strat.current_version,
                    is_active=strat.is_active,
                    trading_mode=TradingMode(strat.trading_mode),
                    config=new_config,
                    user_id=strat.user_id,
                    connection_id=strat.broker_connection_id,
                    broker_account_id=new_config.broker_account_id,
                    created_at=strat.created_at.isoformat(),
                    updated_at=strat.updated_at.isoformat(),
                ),
                validation_result,
            )

        # Block LIVE mode if not ready
        if strat.trading_mode == TradingMode.LIVE.value and not validation_result.live_readiness.ready:
            strat.trading_mode = TradingMode.OFF.value
            validation_result.errors.append(
                StrategyValidationError(
                    field="tradingMode",
                    message="LIVE trading cannot be enabled until all risk limits are configured.",
                    code="LIVE_MODE_BLOCKED_UNCONFIGURED_RISK",
                )
            )

        if new_config.connection_id:
            strat.broker_connection_id = new_config.connection_id

        if update_data.config is not None:
            new_version_num = strat.current_version + 1
            strat.current_version = new_version_num
            new_ver = StrategyVersion(
                strategy_id=strat.id,
                user_id=strat.user_id,
                version_number=new_version_num,
                config_json=new_config.model_dump(by_alias=True),
                created_by=user_email,
                change_reason=update_data.change_reason or "Strategy configuration update",
            )
            db.add(new_ver)

        strat.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(strat)

        return (
            StrategySchema(
                id=strat.id,
                name=strat.name,
                description=strat.description or "",
                version=strat.current_version,
                current_version=strat.current_version,
                is_active=strat.is_active,
                trading_mode=TradingMode(strat.trading_mode),
                config=new_config,
                user_id=strat.user_id,
                connection_id=strat.broker_connection_id,
                broker_account_id=new_config.broker_account_id,
                created_at=strat.created_at.isoformat(),
                updated_at=strat.updated_at.isoformat(),
            ),
            validation_result,
        )

    @classmethod
    async def handle_strategy_control(
        cls,
        strategy_id: str,
        action: StrategyControlAction,
        reason: Optional[str],
        user_id: Optional[str],
        db: AsyncSession,
    ) -> StrategyControlResponse:
        """Execute control action: PAUSE, RESUME, DISABLE_ENTRIES, or EMERGENCY_HALT."""
        stmt = select(Strategy).where(Strategy.id == strategy_id)
        if user_id:
            stmt = stmt.where((Strategy.user_id == user_id) | (Strategy.user_id.is_(None)))
        res = await db.execute(stmt)
        strat = res.scalars().first()
        if not strat:
            raise ValueError(f"Strategy {strategy_id} not found or access unauthorized")

        now_str = datetime.now(timezone.utc).isoformat()
        msg = f"Action {action} applied successfully."

        if action == "PAUSE":
            strat.is_active = False
            msg = f"Automation paused. Reason: {reason or 'Operator paused'}"
        elif action == "RESUME":
            strat.is_active = True
            msg = f"Automation resumed. Reason: {reason or 'Operator resumed'}"
        elif action == "DISABLE_ENTRIES":
            strat.trading_mode = TradingMode.OFF.value
            msg = f"New entries disabled. Existing positions will be monitored for exit. Reason: {reason or 'Operator disabled entries'}"
        elif action == "EMERGENCY_HALT":
            strat.is_active = False
            strat.trading_mode = TradingMode.OFF.value
            msg = f"CRITICAL: Emergency halt triggered. Automation halted immediately. Reason: {reason or 'Emergency halt initiated'}"

        strat.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(strat)

        return StrategyControlResponse(
            strategy_id=strat.id,
            status="HALTED" if action == "EMERGENCY_HALT" else ("PAUSED" if not strat.is_active else "ACTIVE"),
            is_active=strat.is_active,
            trading_mode=TradingMode(strat.trading_mode),
            action_applied=action,
            applied_at=now_str,
            message=msg,
        )

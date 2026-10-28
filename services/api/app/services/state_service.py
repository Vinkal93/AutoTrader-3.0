"""Engine state machine, mode switching, and system transition auditing."""

import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.broker.factory import get_broker_adapter
from app.models.entities import SystemEvent
from app.models.enums import (
    BrokerConnectionState,
    EngineState,
    SystemEventSeverity,
    TradingMode,
)
from app.schemas.health import LastStateChange, SystemStatusResponse
from app.services.strategy_service import StrategyService

logger = logging.getLogger(__name__)


class StateService:
    """Manages the trading engine lifecycle, mode enforcement, and state auditing."""

    _engine_state: EngineState = EngineState.STOPPED
    _trading_mode: TradingMode = TradingMode.OFF
    _last_state_change: LastStateChange = LastStateChange(
        state=EngineState.STOPPED,
        reason="Engine initialized",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    _active_strategy_id: Optional[str] = "10000000-0000-0000-0000-000000000001"
    _worker_heartbeat: Optional[datetime] = None

    @classmethod
    def get_current_state(cls) -> EngineState:
        return cls._engine_state

    @classmethod
    def get_trading_mode(cls) -> TradingMode:
        return cls._trading_mode

    @classmethod
    def record_worker_heartbeat(cls) -> None:
        cls._worker_heartbeat = datetime.now(timezone.utc)

    @classmethod
    async def get_system_status(cls, db: Optional[AsyncSession] = None) -> SystemStatusResponse:
        """Compile complete system status with current market hours check."""
        broker = get_broker_adapter()
        conn_status = await broker.connection_status()

        # Determine market status (NSE: Mon-Fri 09:15 - 15:30 IST)
        now_utc = datetime.now(timezone.utc)
        # IST is UTC + 5:30
        ist_hour = (now_utc.hour + 5 + (now_utc.minute + 30) // 60) % 24
        ist_min = (now_utc.minute + 30) % 60
        mins_since_midnight = ist_hour * 60 + ist_min

        # Check weekend (Saturday = 5, Sunday = 6)
        # Note: weekday in IST may shift slightly
        weekday = now_utc.weekday()
        if weekday in (5, 6):
            market_status = "CLOSED"
        elif 9 * 60 <= mins_since_midnight < 9 * 60 + 15:
            market_status = "PRE_OPEN"
        elif 9 * 60 + 15 <= mins_since_midnight < 15 * 60 + 30:
            market_status = "OPEN"
        else:
            market_status = "CLOSED"

        return SystemStatusResponse(
            trading_mode=cls._trading_mode,
            engine_state=cls._engine_state,
            broker_connection=conn_status.state,
            active_strategy_id=cls._active_strategy_id,
            worker_heartbeat=cls._worker_heartbeat.isoformat() if cls._worker_heartbeat else None,
            market_status=market_status,
            last_state_change=cls._last_state_change,
        )

    @classmethod
    async def transition_engine_state(
        cls,
        new_state: EngineState,
        reason: str,
        db: Optional[AsyncSession] = None,
        severity: SystemEventSeverity = SystemEventSeverity.INFO,
    ) -> EngineState:
        """Transition engine state and log audit event."""
        prev_state = cls._engine_state
        cls._engine_state = new_state
        now_iso = datetime.now(timezone.utc).isoformat()
        cls._last_state_change = LastStateChange(
            state=new_state,
            reason=reason,
            timestamp=now_iso,
        )

        logger.info(f"Engine state transition: {prev_state.value} -> {new_state.value} ({reason})")

        if db:
            event = SystemEvent(
                severity=severity.value,
                category="ENGINE_STATE",
                message=f"State changed from {prev_state.value} to {new_state.value}: {reason}",
                details_json={
                    "previousState": prev_state.value,
                    "newState": new_state.value,
                    "reason": reason,
                },
            )
            db.add(event)
            try:
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to persist engine state system event: {e}")

        return cls._engine_state

    @classmethod
    async def set_mode(
        cls,
        new_mode: TradingMode,
        reason: str,
        db: AsyncSession,
    ) -> TradingMode:
        """Switch trading mode with strict safety gates for LIVE trading."""
        if new_mode == cls._trading_mode:
            return cls._trading_mode

        if new_mode == TradingMode.LIVE:
            # GATING RULE 1: Broker must be CONNECTED
            broker = get_broker_adapter()
            conn = await broker.connection_status()
            if conn.state != BrokerConnectionState.CONNECTED:
                raise ValueError("Cannot switch to LIVE mode: Broker is not connected.")

            # GATING RULE 2: Strategy risk limits MUST be configured
            active_strat = await StrategyService.get_active_strategy(db)
            if active_strat:
                val = StrategyService.validate_config(active_strat.config)
                if not val.live_readiness.ready:
                    missing = ", ".join(val.live_readiness.missing_required_fields)
                    raise ValueError(
                        f"Cannot switch to LIVE mode: Strategy risk limits are unconfigured ({missing})."
                    )

        prev_mode = cls._trading_mode
        cls._trading_mode = new_mode

        # If switching to OFF, also pause or stop running engine
        if new_mode == TradingMode.OFF and cls._engine_state in (
            EngineState.RUNNING,
            EngineState.READY,
        ):
            await cls.transition_engine_state(
                EngineState.STOPPED,
                f"Mode switched to OFF: {reason}",
                db=db,
            )
        elif new_mode in (TradingMode.PAPER, TradingMode.LIVE) and cls._engine_state == EngineState.STOPPED:
            await cls.transition_engine_state(
                EngineState.READY,
                f"Mode switched to {new_mode.value}: {reason}",
                db=db,
            )

        event = SystemEvent(
            severity=SystemEventSeverity.INFO.value,
            category="TRADING_MODE",
            message=f"Trading mode switched from {prev_mode.value} to {new_mode.value}: {reason}",
            details_json={
                "previousMode": prev_mode.value,
                "newMode": new_mode.value,
                "reason": reason,
            },
        )
        db.add(event)
        await db.commit()

        logger.info(f"Trading mode changed: {prev_mode.value} -> {new_mode.value}")
        return cls._trading_mode

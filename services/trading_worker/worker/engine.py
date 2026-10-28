"""
Trading Engine State Machine Foundation
Handles lifecycle states: STOPPED, STARTING, READY, RUNNING, PAUSED, RECONCILING, DEGRADED, ERROR, RISK_LOCKED
Phase 1 Scope: State management only. Real trading execution is strictly locked.
"""
import enum
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("worker.engine")


class EngineState(str, enum.Enum):
    STOPPED = "STOPPED"
    STARTING = "STARTING"
    READY = "READY"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    RECONCILING = "RECONCILING"
    DEGRADED = "DEGRADED"
    ERROR = "ERROR"
    RISK_LOCKED = "RISK_LOCKED"


class TradingMode(str, enum.Enum):
    OFF = "OFF"
    PAPER = "PAPER"
    LIVE = "LIVE"


class TradingEngine:
    def __init__(self, mode: TradingMode = TradingMode.OFF):
        self.state: EngineState = EngineState.STOPPED
        self.mode: TradingMode = mode
        self.last_transition_reason: str = "Initial worker bootstrap"
        self.last_transition_time: datetime = datetime.now(timezone.utc)

    def transition_to(self, new_state: EngineState, reason: str):
        prev = self.state
        self.state = new_state
        self.last_transition_reason = reason
        self.last_transition_time = datetime.now(timezone.utc)
        logger.info(f"Engine transition: {prev.value} -> {new_state.value}. Reason: {reason}")

    def set_mode(self, new_mode: TradingMode, reason: str):
        if new_mode == TradingMode.LIVE:
            raise ValueError(
                "LIVE trading mode cannot be activated in Phase 1 (Safety Lock active)."
            )
        prev = self.mode
        self.mode = new_mode
        logger.info(f"Trading mode updated: {prev.value} -> {new_mode.value}. Reason: {reason}")

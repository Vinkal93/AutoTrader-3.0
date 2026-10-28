"""Tests for strategy validation and live trading safety gates."""

import pytest
from app.schemas.strategy import StrategyConfig
from app.services.strategy_service import StrategyService


def test_default_strategy_template_blocks_live_readiness():
    default_cfg = StrategyService.get_default_config()
    val = StrategyService.validate_config(default_cfg)

    # Base parameters are valid
    assert val.is_valid is True
    assert len(val.errors) == 0

    # LIVE mode must be blocked
    assert val.live_readiness.ready is False
    assert len(val.live_readiness.missing_required_fields) > 0
    assert "maxRiskPerTrade" in val.live_readiness.missing_required_fields
    assert "maxDailyLoss" in val.live_readiness.missing_required_fields
    assert "minTradingFunds" in val.live_readiness.missing_required_fields


def test_invalid_premium_range_fails_validation():
    cfg = StrategyConfig(
        premium_min="50.00",
        premium_max="40.00",  # max < min
    )
    val = StrategyService.validate_config(cfg)
    assert val.is_valid is False
    assert any(e.code == "INVALID_PREMIUM_RANGE" for e in val.errors)


def test_entry_time_outside_market_hours_fails():
    cfg = StrategyConfig(
        entry_time_ist="08:30",  # Prior to 09:15
    )
    val = StrategyService.validate_config(cfg)
    assert val.is_valid is False
    assert any(e.code == "TIME_OUT_OF_MARKET_HOURS" for e in val.errors)


def test_malformed_time_format_fails():
    cfg = StrategyConfig(
        entry_time_ist="12-20",  # Hyphen instead of colon
    )
    val = StrategyService.validate_config(cfg)
    assert val.is_valid is False
    assert any(e.code == "INVALID_TIME_FORMAT" for e in val.errors)


def test_invalid_target_and_stop_loss():
    cfg = StrategyConfig(
        target_premium_move="-1.00",
        initial_stop_loss="0.00",
    )
    val = StrategyService.validate_config(cfg)
    assert val.is_valid is False
    assert any(e.code == "INVALID_TARGET" for e in val.errors)
    assert any(e.code == "INVALID_STOP_LOSS" for e in val.errors)


def test_unfavorable_risk_reward_warning():
    cfg = StrategyConfig(
        target_premium_move="1.00",
        initial_stop_loss="5.00",  # 5x target
    )
    val = StrategyService.validate_config(cfg)
    assert any(w.field == "riskRewardRatio" for w in val.warnings)


def test_fully_configured_strategy_achieves_live_readiness():
    cfg = StrategyConfig(
        underlying="NIFTY",
        entry_time_ist="12:20",
        premium_min="40.00",
        premium_max="45.00",
        target_premium_move="1.50",
        initial_stop_loss="3.00",
        candle_interval="5m",
        max_trades_per_day=1,
        lot_count=1,
        sideways_action="SKIP",
        max_risk_per_trade="1500.00",
        max_daily_loss="3000.00",
        min_trading_funds="50000.00",
        max_bid_ask_spread="0.50",
        min_liquidity=5000,
        entry_price_tolerance="0.25",
        max_data_age_seconds=5,
        max_order_wait_seconds=10,
        time_based_exit_ist="15:15",
        expiry_selection_policy="CURRENT_WEEK",
        market_holiday_behavior="SKIP",
        automated_recovery_policy="PAUSE",
    )
    val = StrategyService.validate_config(cfg)

    assert val.is_valid is True
    assert len(val.errors) == 0
    assert val.live_readiness.ready is True
    assert len(val.live_readiness.missing_required_fields) == 0

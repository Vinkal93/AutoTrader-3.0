"""Unit tests for Phase 7 Trading Analytics Service and mathematical formulas."""

from decimal import Decimal
import pytest
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    ComprehensiveAnalytics,
    DailyPnlEntry,
    EquityPoint,
    HeatmapDayEntry,
    HoldingTimeAnalysis,
    OptionTypePerformance,
    SlippageAnalysis,
)


class TestAnalyticsMath:
    """Test suite for financial calculations in AnalyticsService."""

    def test_win_loss_rates_zero_divide_protection(self):
        """Zero trades should yield 0.0% win and loss rates without crashing."""
        win_rate, loss_rate = AnalyticsService.compute_win_loss_rates(0, 0, 0)
        assert win_rate == 0.0
        assert loss_rate == 0.0

    def test_win_loss_rates_standard(self):
        """Standard win and loss percentages with rounding."""
        win_rate, loss_rate = AnalyticsService.compute_win_loss_rates(7, 3, 10)
        assert win_rate == 70.0
        assert loss_rate == 30.0

        # With breakeven trades (6 wins, 2 losses, 2 breakeven = 10 total)
        win_rate, loss_rate = AnalyticsService.compute_win_loss_rates(6, 2, 10)
        assert win_rate == 60.0
        assert loss_rate == 20.0

    def test_profit_factor_standard(self):
        """Profit factor = gross wins / |gross losses|."""
        pf = AnalyticsService.compute_profit_factor(Decimal("1500.00"), Decimal("-500.00"))
        assert pf == 3.0

    def test_profit_factor_zero_losses(self):
        """Zero losses should return 999.0 (undefined ceiling) without divide-by-zero."""
        pf = AnalyticsService.compute_profit_factor(Decimal("1200.00"), Decimal("0.00"))
        assert pf == 999.0

    def test_profit_factor_zero_trades(self):
        """Zero wins and zero losses should return None."""
        pf = AnalyticsService.compute_profit_factor(Decimal("0.00"), Decimal("0.00"))
        assert pf is None

    def test_drawdown_peak_to_trough(self):
        """Computes max drawdown correctly from equity curve."""
        # Equity progression: 0 -> 100 -> 250 (peak) -> 180 (dd=70) -> 150 (dd=100) -> 300 (new peak) -> 280 (dd=20)
        equity = [
            Decimal("100.00"),
            Decimal("250.00"),
            Decimal("180.00"),
            Decimal("150.00"),
            Decimal("300.00"),
            Decimal("280.00"),
        ]
        max_dd, max_dd_pct, peak, trough = AnalyticsService.compute_drawdown(equity)
        assert max_dd == Decimal("100.00")
        assert peak == Decimal("300.00")
        assert trough == Decimal("150.00")
        assert max_dd_pct == 40.0  # 100 / 250 * 100

    def test_drawdown_empty_series(self):
        """Empty equity series returns 0 with None percentage."""
        max_dd, max_dd_pct, peak, trough = AnalyticsService.compute_drawdown([])
        assert max_dd == Decimal("0")
        assert max_dd_pct is None
        assert peak == Decimal("0")
        assert trough == Decimal("0")

    def test_expectancy_positive_edge(self):
        """Calculates positive expectancy per trade."""
        # 60% win rate, ₹100 avg win, 40% loss rate, ₹50 avg loss
        # E = (0.60 * 100) - (0.40 * 50) = 60 - 20 = ₹40.00
        expectancy, ratio = AnalyticsService.compute_expectancy(
            win_rate_pct=60.0,
            avg_win=Decimal("100.00"),
            loss_rate_pct=40.0,
            avg_loss=Decimal("50.00"),
        )
        assert expectancy == Decimal("40.00")
        assert ratio == 0.8  # 40 / 50

    def test_expectancy_zero_losses(self):
        """Expectancy when there are no losses."""
        expectancy, ratio = AnalyticsService.compute_expectancy(
            win_rate_pct=100.0,
            avg_win=Decimal("80.00"),
            loss_rate_pct=0.0,
            avg_loss=Decimal("0.00"),
        )
        assert expectancy == Decimal("80.00")
        assert ratio is None

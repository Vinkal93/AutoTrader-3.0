"""Unit tests for Phase 8 System Monitoring and Watchdog Service."""

import pytest
from app.services.monitoring_service import MonitoringService


class TestMonitoringWatchdog:
    """Tests for MonitoringService diagnostics and emergency runbook."""

    def test_emergency_runbook_contains_broker_disconnect_caveat(self):
        """Verifies Phase 8 mandate: Do not claim watchdog can close positions when broker is disconnected."""
        steps = MonitoringService.get_emergency_runbook_steps()
        assert len(steps) >= 4

        # Verify Step 2 explicitly warns about broker disconnection
        step2 = next(s for s in steps if s.step_number == 2)
        assert "Kotak Neo" in step2.action_required
        assert step2.caveat is not None
        assert "CANNOT automatically close open positions" in step2.caveat

    def test_emergency_runbook_duplicate_buy_prevention(self):
        """Verifies Step 1 explicitly highlights duplicate BUY prevention."""
        steps = MonitoringService.get_emergency_runbook_steps()
        step1 = next(s for s in steps if s.step_number == 1)
        assert "duplicate BUY" in step1.critical_notice

    def test_deduplication_constants(self):
        """Validates that alert deduplication window is 300s (5m) and heartbeat timeout is 15s."""
        assert MonitoringService.ALERT_DEDUP_WINDOW_SECONDS == 300
        assert MonitoringService.HEARTBEAT_TIMEOUT_SECONDS == 15
        assert MonitoringService.FEED_STALENESS_TIMEOUT_SECONDS == 30

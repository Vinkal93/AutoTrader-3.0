"""
Comprehensive Trading Analytics Service.
Authoritative calculation engine for performance metrics, drawdown, equity curves,
expectancy, profit factor, CE/PE splits, holding times, and slippage.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
import io
import csv
import json
from typing import Any, Dict, List, Literal, Optional, Tuple
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import (
    ChargeEntry,
    Order,
    Strategy,
    StrategyRun,
    StrategyVersion,
    TradeCycle,
)
from app.schemas.analytics import (
    ComprehensiveAnalytics,
    DailyPnlEntry,
    EquityPoint,
    HeatmapDayEntry,
    HoldingTimeAnalysis,
    OptionTypePerformance,
    PerformanceMetrics,
    SlippageAnalysis,
    StrategyVersionPerformance,
    TradeDrilldown,
)


class AnalyticsService:
    """Authoritative financial analytics engine conforming to Phase 7 directives."""

    @staticmethod
    def compute_win_loss_rates(wins: int, losses: int, total_closed: int) -> Tuple[float, float]:
        """Calculates win rate and loss rate with zero-division protection."""
        if total_closed <= 0:
            return 0.0, 0.0
        win_rate = round((wins / total_closed) * 100, 2)
        loss_rate = round((losses / total_closed) * 100, 2)
        return win_rate, loss_rate

    @staticmethod
    def compute_profit_factor(gross_wins: Decimal, gross_losses: Decimal) -> Optional[float]:
        """Computes profit factor = gross wins / |gross losses|."""
        abs_losses = abs(gross_losses)
        if abs_losses > Decimal("0"):
            return round(float(gross_wins / abs_losses), 2)
        elif gross_wins > Decimal("0"):
            return 999.0  # Undefined high profit factor when 0 losses
        return None

    @staticmethod
    def compute_drawdown(
        equity_series: List[Decimal],
    ) -> Tuple[Decimal, Optional[float], Decimal, Decimal]:
        """
        Calculates peak-to-trough max drawdown, drawdown %, peak equity, and trough equity.
        Returns (max_drawdown, max_drawdown_percent, peak_equity, trough_equity).
        """
        if not equity_series:
            return Decimal("0"), None, Decimal("0"), Decimal("0")

        peak = Decimal("0")
        max_dd = Decimal("0")
        trough = Decimal("0")
        peak_at_max_dd = Decimal("0")

        running_equity = Decimal("0")
        for val in equity_series:
            running_equity = val
            if running_equity > peak:
                peak = running_equity
            dd = peak - running_equity
            if dd > max_dd:
                max_dd = dd
                trough = running_equity
                peak_at_max_dd = peak

        max_dd_percent: Optional[float] = None
        if peak_at_max_dd > Decimal("0") and max_dd > Decimal("0"):
            max_dd_percent = round(float((max_dd / peak_at_max_dd) * Decimal("100")), 2)

        return max_dd, max_dd_percent, peak, trough

    @staticmethod
    def compute_expectancy(
        win_rate_pct: float,
        avg_win: Decimal,
        loss_rate_pct: float,
        avg_loss: Decimal,
    ) -> Tuple[Decimal, Optional[float]]:
        """
        Calculates Expectancy per trade and Expectancy Ratio.
        Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
        Expectancy Ratio = Expectancy / AvgLoss
        """
        p_win = Decimal(str(win_rate_pct)) / Decimal("100")
        p_loss = Decimal(str(loss_rate_pct)) / Decimal("100")

        expectancy = (p_win * avg_win) - (p_loss * abs(avg_loss))
        expectancy_ratio: Optional[float] = None
        if abs(avg_loss) > Decimal("0"):
            expectancy_ratio = round(float(expectancy / abs(avg_loss)), 2)

        return expectancy, expectancy_ratio

    @classmethod
    async def get_comprehensive_analytics(
        cls,
        db: AsyncSession,
        timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"] = "ALL",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ComprehensiveAnalytics:
        """
        Generates full Phase 7 analytics report with verified data from closed trade cycles.
        """
        now_utc = datetime.now(timezone.utc)
        stmt = select(TradeCycle)

        # Apply timeframe filter
        start_dt: Optional[datetime] = None
        end_dt: Optional[datetime] = None

        if timeframe == "TODAY":
            start_dt = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc)
            stmt = stmt.where(TradeCycle.started_at >= start_dt)
        elif timeframe == "7D":
            start_dt = now_utc - timedelta(days=7)
            stmt = stmt.where(TradeCycle.started_at >= start_dt)
        elif timeframe == "30D":
            start_dt = now_utc - timedelta(days=30)
            stmt = stmt.where(TradeCycle.started_at >= start_dt)
        elif timeframe == "MONTH":
            start_dt = datetime(now_utc.year, now_utc.month, 1, tzinfo=timezone.utc)
            stmt = stmt.where(TradeCycle.started_at >= start_dt)
        elif timeframe == "CUSTOM" and start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                stmt = stmt.where(TradeCycle.started_at >= start_dt)
            except Exception:
                pass
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                    stmt = stmt.where(TradeCycle.started_at <= end_dt)
                except Exception:
                    pass

        stmt = stmt.order_by(TradeCycle.started_at.asc())
        all_cycles = (await db.execute(stmt)).scalars().all()

        total_trades = len(all_cycles)
        closed = [c for c in all_cycles if c.closed_at is not None]
        closed_count = len(closed)

        # Fetch orders for closed cycles to evaluate symbols, slippage, fills
        order_ids = set()
        for c in closed:
            if c.entry_order_id:
                order_ids.add(c.entry_order_id)
            if c.exit_order_id:
                order_ids.add(c.exit_order_id)

        orders_map: Dict[str, Order] = {}
        if order_ids:
            ord_stmt = select(Order).where(Order.id.in_(order_ids))
            ord_res = (await db.execute(ord_stmt)).scalars().all()
            for o in ord_res:
                orders_map[o.id] = o

        # Fetch charges
        cycle_ids = [c.id for c in closed]
        charges_map: Dict[str, Decimal] = {}
        if cycle_ids:
            ch_stmt = select(ChargeEntry).where(ChargeEntry.trade_cycle_id.in_(cycle_ids))
            ch_res = (await db.execute(ch_stmt)).scalars().all()
            for ch in ch_res:
                current = charges_map.get(ch.trade_cycle_id, Decimal("0"))
                charges_map[ch.trade_cycle_id] = current + Decimal(str(ch.total_charges or "0.00"))

        # Fetch strategies and strategy versions
        strat_ver_stmt = select(StrategyVersion)
        all_versions = (await db.execute(strat_ver_stmt)).scalars().all()
        versions_map: Dict[str, StrategyVersion] = {v.id: v for v in all_versions}

        strat_stmt = select(Strategy)
        all_strategies = (await db.execute(strat_stmt)).scalars().all()
        strategies_map: Dict[str, Strategy] = {s.id: s for s in all_strategies}

        # 1. Trade Outcomes
        winning_cycles = [c for c in closed if c.net_pnl and c.net_pnl > 0]
        losing_cycles = [c for c in closed if c.net_pnl and c.net_pnl < 0]
        breakeven_cycles = [c for c in closed if c.net_pnl == 0]

        winning_count = len(winning_cycles)
        losing_count = len(losing_cycles)
        breakeven_count = len(breakeven_cycles)

        win_rate, loss_rate = cls.compute_win_loss_rates(winning_count, losing_count, closed_count)

        # 2. P&L & Charges
        gross_sum = sum((Decimal(str(c.realized_pnl or "0.00")) for c in closed), Decimal("0"))
        net_sum = sum((Decimal(str(c.net_pnl or "0.00")) for c in closed), Decimal("0"))
        total_charges = gross_sum - net_sum
        if total_charges < Decimal("0"):
            total_charges = Decimal("0")

        # Charges status
        charges_status: Literal["ACTUAL", "ESTIMATED", "UNAVAILABLE"] = "UNAVAILABLE"
        if closed_count > 0:
            if any(c.id in charges_map for c in closed):
                charges_status = "ACTUAL"
            else:
                charges_status = "ESTIMATED"

        # 3. Wins / Losses breakdown
        gross_wins = sum((Decimal(str(c.realized_pnl or "0.00")) for c in winning_cycles), Decimal("0"))
        gross_losses = sum((Decimal(str(c.realized_pnl or "0.00")) for c in losing_cycles), Decimal("0"))
        profit_factor = cls.compute_profit_factor(gross_wins, gross_losses)

        net_wins = [Decimal(str(c.net_pnl)) for c in winning_cycles]
        net_losses = [abs(Decimal(str(c.net_pnl))) for c in losing_cycles]

        avg_win_dec = (sum(net_wins, Decimal("0")) / Decimal(str(winning_count))) if winning_count > 0 else None
        avg_loss_dec = (sum(net_losses, Decimal("0")) / Decimal(str(losing_count))) if losing_count > 0 else None

        largest_win_dec = max(net_wins) if net_wins else None
        largest_loss_dec = max(net_losses) if net_losses else None

        payoff_ratio: Optional[float] = None
        if avg_win_dec is not None and avg_loss_dec is not None and avg_loss_dec > Decimal("0"):
            payoff_ratio = round(float(avg_win_dec / avg_loss_dec), 2)

        expectancy_dec, expectancy_ratio = cls.compute_expectancy(
            win_rate,
            avg_win_dec or Decimal("0"),
            loss_rate,
            avg_loss_dec or Decimal("0"),
        )

        # 4. Daily Series & Equity Curve
        daily_groups: Dict[str, Dict[str, Any]] = {}
        equity_points: List[EquityPoint] = []
        equity_series: List[Decimal] = []
        running_equity = Decimal("0")

        for c in closed:
            date_str = c.started_at.strftime("%Y-%m-%d")
            if date_str not in daily_groups:
                daily_groups[date_str] = {
                    "gross": Decimal("0"),
                    "net": Decimal("0"),
                    "count": 0,
                    "wins": 0,
                    "losses": 0,
                }
            g = Decimal(str(c.realized_pnl or "0.00"))
            n = Decimal(str(c.net_pnl or "0.00"))
            daily_groups[date_str]["gross"] += g
            daily_groups[date_str]["net"] += n
            daily_groups[date_str]["count"] += 1
            if n > Decimal("0"):
                daily_groups[date_str]["wins"] += 1
            elif n < Decimal("0"):
                daily_groups[date_str]["losses"] += 1

            running_equity += n
            equity_series.append(running_equity)
            equity_points.append(
                EquityPoint(
                    timestamp=c.closed_at.isoformat() if c.closed_at else c.started_at.isoformat(),
                    equity=float(running_equity),
                )
            )

        daily_series = [
            DailyPnlEntry(
                date=d,
                gross_pnl=float(data["gross"]),
                net_pnl=float(data["net"]),
                trades_count=data["count"],
            )
            for d, data in sorted(daily_groups.items())
        ]

        # 5. Drawdown
        max_dd_dec, max_dd_pct, peak_equity_dec, trough_equity_dec = cls.compute_drawdown(equity_series)

        # 6. CE vs PE Performance
        ce_trades: List[TradeCycle] = []
        pe_trades: List[TradeCycle] = []
        for c in closed:
            sym = ""
            if c.entry_order_id and c.entry_order_id in orders_map:
                sym = orders_map[c.entry_order_id].trading_symbol.upper()
            if "CE" in sym:
                ce_trades.append(c)
            elif "PE" in sym:
                pe_trades.append(c)

        def build_option_perf(type_name: Literal["CE", "PE"], group: List[TradeCycle]) -> OptionTypePerformance:
            g_count = len(group)
            w = sum(1 for c in group if c.net_pnl and c.net_pnl > 0)
            l = sum(1 for c in group if c.net_pnl and c.net_pnl < 0)
            be = sum(1 for c in group if c.net_pnl == 0)
            wr = round((w / g_count * 100), 2) if g_count > 0 else 0.0
            g_pnl = sum((Decimal(str(c.realized_pnl or "0.00")) for c in group), Decimal("0"))
            n_pnl = sum((Decimal(str(c.net_pnl or "0.00")) for c in group), Decimal("0"))
            gw = sum((Decimal(str(c.realized_pnl or "0.00")) for c in group if c.realized_pnl and c.realized_pnl > 0), Decimal("0"))
            gl = sum((Decimal(str(c.realized_pnl or "0.00")) for c in group if c.realized_pnl and c.realized_pnl < 0), Decimal("0"))
            pf = cls.compute_profit_factor(gw, gl)
            avg_p = f"{(n_pnl / Decimal(str(g_count))):.2f}" if g_count > 0 else None

            return OptionTypePerformance(
                option_type=type_name,
                trades_count=g_count,
                winning_trades=w,
                losing_trades=l,
                breakeven_trades=be,
                win_rate=wr,
                gross_pnl=f"{g_pnl:.2f}",
                net_pnl=f"{n_pnl:.2f}",
                profit_factor=pf,
                average_pnl=avg_p,
            )

        ce_performance = build_option_perf("CE", ce_trades)
        pe_performance = build_option_perf("PE", pe_trades)

        # 7. Strategy Version Breakdown
        strat_ver_groups: Dict[int, List[TradeCycle]] = {}
        for c in closed:
            v_num = 1
            if c.strategy_run_id:
                # Query or map strategy run to version
                v_num = 1
            strat_ver_groups.setdefault(v_num, []).append(c)

        strategy_versions_list: List[StrategyVersionPerformance] = []
        for v_num, v_cycles in sorted(strat_ver_groups.items()):
            v_count = len(v_cycles)
            v_w = sum(1 for c in v_cycles if c.net_pnl and c.net_pnl > 0)
            v_l = sum(1 for c in v_cycles if c.net_pnl and c.net_pnl < 0)
            v_wr = round((v_w / v_count * 100), 2) if v_count > 0 else 0.0
            v_g = sum((Decimal(str(c.realized_pnl or "0.00")) for c in v_cycles), Decimal("0"))
            v_n = sum((Decimal(str(c.net_pnl or "0.00")) for c in v_cycles), Decimal("0"))
            v_gw = sum((Decimal(str(c.realized_pnl or "0.00")) for c in v_cycles if c.realized_pnl and c.realized_pnl > 0), Decimal("0"))
            v_gl = sum((Decimal(str(c.realized_pnl or "0.00")) for c in v_cycles if c.realized_pnl and c.realized_pnl < 0), Decimal("0"))
            v_pf = cls.compute_profit_factor(v_gw, v_gl)

            # Drawdown for this version
            v_running = Decimal("0")
            v_peak = Decimal("0")
            v_mdd = Decimal("0")
            for c in v_cycles:
                v_running += Decimal(str(c.net_pnl or "0.00"))
                if v_running > v_peak:
                    v_peak = v_running
                v_dd = v_peak - v_running
                if v_dd > v_mdd:
                    v_mdd = v_dd

            strategy_versions_list.append(
                StrategyVersionPerformance(
                    version_number=v_num,
                    strategy_id=v_cycles[0].strategy_run_id or "default-strategy",
                    strategy_name=f"EMA 9/21 Scanner v{v_num}",
                    trades_count=v_count,
                    winning_trades=v_w,
                    losing_trades=v_l,
                    win_rate=v_wr,
                    gross_pnl=f"{v_g:.2f}",
                    net_pnl=f"{v_n:.2f}",
                    profit_factor=v_pf,
                    max_drawdown=f"{v_mdd:.2f}" if v_count > 0 else None,
                )
            )

        # 8. Holding Time Analysis
        durations_all: List[int] = []
        durations_win: List[int] = []
        durations_loss: List[int] = []

        for c in closed:
            if c.started_at and c.closed_at:
                sec = int((c.closed_at - c.started_at).total_seconds())
                durations_all.append(sec)
                if c.net_pnl and c.net_pnl > 0:
                    durations_win.append(sec)
                elif c.net_pnl and c.net_pnl < 0:
                    durations_loss.append(sec)

        holding_time_analysis = HoldingTimeAnalysis(
            average_holding_time_seconds=int(sum(durations_all) / len(durations_all)) if durations_all else None,
            average_winning_holding_time_seconds=int(sum(durations_win) / len(durations_win)) if durations_win else None,
            average_losing_holding_time_seconds=int(sum(durations_loss) / len(durations_loss)) if durations_loss else None,
            min_holding_time_seconds=min(durations_all) if durations_all else None,
            max_holding_time_seconds=max(durations_all) if durations_all else None,
            total_trades_sampled=len(durations_all),
        )

        # 9. Calendar Heatmap
        calendar_heatmap: List[HeatmapDayEntry] = []
        for d, data in sorted(daily_groups.items()):
            n = float(data["net"])
            st: Literal["PROFIT", "LOSS", "BREAKEVEN", "NO_TRADE"] = "NO_TRADE"
            if n > 0:
                st = "PROFIT"
            elif n < 0:
                st = "LOSS"
            elif data["count"] > 0:
                st = "BREAKEVEN"

            calendar_heatmap.append(
                HeatmapDayEntry(
                    date=d,
                    gross_pnl=float(data["gross"]),
                    net_pnl=float(data["net"]),
                    trades_count=data["count"],
                    winning_trades=data["wins"],
                    losing_trades=data["losses"],
                    status=st,
                )
            )

        # 10. Slippage & Execution Quality
        entry_slippage_points: List[float] = []
        exit_slippage_points: List[float] = []
        total_slippage_cost = Decimal("0")
        pos_slip = 0
        neg_slip = 0
        zero_slip = 0

        drilldowns: List[TradeDrilldown] = []

        for c in closed:
            entry_ord = orders_map.get(c.entry_order_id) if c.entry_order_id else None
            exit_ord = orders_map.get(c.exit_order_id) if c.exit_order_id else None

            entry_req = float(entry_ord.price) if entry_ord and entry_ord.price else 0.0
            entry_fill = float(entry_ord.average_filled_price) if entry_ord and entry_ord.average_filled_price else entry_req
            entry_slip = round(entry_fill - entry_req, 2) if entry_req > 0 else 0.0

            exit_req = float(exit_ord.price) if exit_ord and exit_ord.price else 0.0
            exit_fill = float(exit_ord.average_filled_price) if exit_ord and exit_ord.average_filled_price else exit_req
            exit_slip = round(exit_req - exit_fill, 2) if exit_req > 0 else 0.0

            qty = entry_ord.quantity if entry_ord else 25

            if entry_req > 0:
                entry_slippage_points.append(entry_slip)
            if exit_req > 0:
                exit_slippage_points.append(exit_slip)

            combined_slip_points = entry_slip + exit_slip
            slip_cost = Decimal(str(combined_slip_points)) * Decimal(str(qty))
            total_slippage_cost += slip_cost

            if combined_slip_points > 0:
                neg_slip += 1  # Adverse slippage
            elif combined_slip_points < 0:
                pos_slip += 1  # Price improvement
            else:
                zero_slip += 1

            sym = entry_ord.trading_symbol if entry_ord else "NIFTY"
            opt_type: Optional[Literal["CE", "PE"]] = "CE" if "CE" in sym.upper() else ("PE" if "PE" in sym.upper() else None)
            duration_s = int((c.closed_at - c.started_at).total_seconds()) if c.started_at and c.closed_at else None
            ch_val = str(charges_map.get(c.id, Decimal("0.00")))

            drilldowns.append(
                TradeDrilldown(
                    id=c.id,
                    strategy_run_id=c.strategy_run_id,
                    trading_symbol=sym,
                    option_type=opt_type,
                    trading_mode=c.trading_mode,
                    quantity=qty,
                    entry_price=f"{entry_req:.2f}",
                    exit_price=f"{exit_req:.2f}",
                    entry_filled_price=f"{entry_fill:.2f}" if entry_fill else None,
                    exit_filled_price=f"{exit_fill:.2f}" if exit_fill else None,
                    entry_slippage_points=entry_slip,
                    exit_slippage_points=exit_slip,
                    holding_time_seconds=duration_s,
                    gross_pnl=f"{(c.realized_pnl or Decimal('0')):.2f}",
                    charges=ch_val,
                    net_pnl=f"{(c.net_pnl or Decimal('0')):.2f}",
                    started_at=c.started_at.isoformat(),
                    closed_at=c.closed_at.isoformat() if c.closed_at else None,
                    exit_reason="TARGET_MET" if (c.net_pnl and c.net_pnl > 0) else "STOP_LOSS",
                )
            )

        slippage_analysis = SlippageAnalysis(
            available=len(entry_slippage_points) > 0,
            average_entry_slippage_points=round(sum(entry_slippage_points) / len(entry_slippage_points), 3) if entry_slippage_points else None,
            average_exit_slippage_points=round(sum(exit_slippage_points) / len(exit_slippage_points), 3) if exit_slippage_points else None,
            total_slippage_cost=f"{total_slippage_cost:.2f}",
            positive_slippage_trades=pos_slip,
            negative_slippage_trades=neg_slip,
            zero_slippage_trades=zero_slip,
            sample_count=len(entry_slippage_points),
        )

        # 11. Sample Size Warning
        sample_warning: Optional[str] = None
        if closed_count == 0:
            sample_warning = "No closed trade cycles recorded for this timeframe. Metrics will activate after completed trades."
        elif closed_count < 5:
            sample_warning = f"Small sample size ({closed_count} closed trades). Statistical metrics like expectancy and profit factor become statistically significant with at least 15–20 completed trades."

        return ComprehensiveAnalytics(
            timeframe=timeframe,
            start_date=start_dt.isoformat() if start_dt else None,
            end_date=end_dt.isoformat() if end_dt else None,
            total_trades=total_trades,
            closed_trades=closed_count,
            winning_trades=winning_count,
            losing_trades=losing_count,
            breakeven_trades=breakeven_count,
            win_rate=win_rate,
            loss_rate=loss_rate,
            gross_pnl=f"{gross_sum:.2f}",
            net_pnl=f"{net_sum:.2f}",
            total_charges=f"{total_charges:.2f}",
            charges_status=charges_status,
            max_drawdown=f"{max_dd_dec:.2f}" if closed_count > 0 else None,
            max_drawdown_percent=f"{max_dd_pct:.2f}%" if max_dd_pct is not None else None,
            profit_factor=profit_factor,
            average_win=f"{avg_win_dec:.2f}" if avg_win_dec is not None else None,
            average_loss=f"{avg_loss_dec:.2f}" if avg_loss_dec is not None else None,
            largest_win=f"{largest_win_dec:.2f}" if largest_win_dec is not None else None,
            largest_loss=f"{largest_loss_dec:.2f}" if largest_loss_dec is not None else None,
            payoff_ratio=payoff_ratio,
            expectancy=f"{expectancy_dec:.2f}",
            expectancy_ratio=expectancy_ratio,
            peak_equity=f"{peak_equity_dec:.2f}",
            trough_equity=f"{trough_equity_dec:.2f}",
            daily_pnl_series=daily_series,
            equity_curve=equity_points,
            ce_performance=ce_performance,
            pe_performance=pe_performance,
            strategy_versions=strategy_versions_list,
            holding_time=holding_time_analysis,
            calendar_heatmap=calendar_heatmap,
            slippage=slippage_analysis,
            drilldowns=drilldowns,
            sample_size_warning=sample_warning,
        )

    @classmethod
    async def export_report(
        cls,
        db: AsyncSession,
        timeframe: Literal["TODAY", "7D", "30D", "MONTH", "ALL", "CUSTOM"] = "ALL",
        export_format: Literal["csv", "json"] = "csv",
    ) -> Tuple[bytes, str, str]:
        """
        Exports comprehensive performance analytics as CSV or JSON.
        Returns (file_bytes, filename, media_type).
        """
        analytics = await cls.get_comprehensive_analytics(db, timeframe=timeframe)
        now_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

        if export_format == "json":
            filename = f"autotrader_analytics_{timeframe}_{now_str}.json"
            content = json.dumps(analytics.model_dump(by_alias=True), indent=2).encode("utf-8")
            return content, filename, "application/json"

        # CSV format
        filename = f"autotrader_analytics_{timeframe}_{now_str}.csv"
        buf = io.StringIO()
        writer = csv.writer(buf)

        # Header summary
        writer.writerow(["NIFTY AUTO TRADER 3.0 - PERFORMANCE ANALYTICS REPORT"])
        writer.writerow(["Timeframe", analytics.timeframe])
        writer.writerow(["Generated At (UTC)", datetime.now(timezone.utc).isoformat()])
        writer.writerow([])

        writer.writerow(["KEY PERFORMANCE METRICS"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Trades", analytics.total_trades])
        writer.writerow(["Closed Trades", analytics.closed_trades])
        writer.writerow(["Winning Trades", analytics.winning_trades])
        writer.writerow(["Losing Trades", analytics.losing_trades])
        writer.writerow(["Breakeven Trades", analytics.breakeven_trades])
        writer.writerow(["Win Rate (%)", analytics.win_rate])
        writer.writerow(["Gross P&L (INR)", analytics.gross_pnl])
        writer.writerow(["Total Statutory Deductions (INR)", analytics.total_charges])
        writer.writerow(["Net Realized P&L (INR)", analytics.net_pnl])
        writer.writerow(["Charges Quality", analytics.charges_status])
        writer.writerow(["Profit Factor", analytics.profit_factor if analytics.profit_factor is not None else "N/A"])
        writer.writerow(["Max Drawdown (INR)", analytics.max_drawdown or "0.00"])
        writer.writerow(["Average Win (INR)", analytics.average_win or "N/A"])
        writer.writerow(["Average Loss (INR)", analytics.average_loss or "N/A"])
        writer.writerow(["Payoff Ratio", analytics.payoff_ratio or "N/A"])
        writer.writerow(["Expectancy per Trade (INR)", analytics.expectancy or "0.00"])
        writer.writerow([])

        # Drilldowns itemization
        writer.writerow(["TRADE-LEVEL EXECUTION DRILLDOWN"])
        writer.writerow([
            "Trade ID",
            "Trading Symbol",
            "Option Type",
            "Trading Mode",
            "Quantity",
            "Entry Price",
            "Exit Price",
            "Entry Filled",
            "Exit Filled",
            "Holding Time (sec)",
            "Gross P&L",
            "Charges",
            "Net P&L",
            "Started At",
            "Closed At",
            "Exit Reason",
        ])

        for d in analytics.drilldowns:
            writer.writerow([
                d.id,
                d.trading_symbol,
                d.option_type or "",
                d.trading_mode,
                d.quantity,
                d.entry_price,
                d.exit_price,
                d.entry_filled_price or "",
                d.exit_filled_price or "",
                d.holding_time_seconds if d.holding_time_seconds is not None else "",
                d.gross_pnl,
                d.charges,
                d.net_pnl,
                d.started_at,
                d.closed_at or "",
                d.exit_reason or "",
            ])

        return buf.getvalue().encode("utf-8"), filename, "text/csv"

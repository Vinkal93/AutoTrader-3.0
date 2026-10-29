"""API routers aggregate export."""

from app.routers.account import router as account_router
from app.routers.admin import router as admin_router
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.broker import router as broker_router
from app.routers.dashboard import router as dashboard_router
from app.routers.health import router as health_router
from app.routers.market import router as market_router
from app.routers.orders import router as orders_router
from app.routers.positions import router as positions_router
from app.routers.strategies import router as strategies_router
from app.routers.system import router as system_router
from app.routers.trade_cycles import router as trade_cycles_router
from app.routers.trades import router as trades_router
from app.routers.user import router as user_router
from app.routers.watchdog import router as watchdog_router

all_routers = [
    health_router,
    auth_router,
    user_router,
    system_router,
    watchdog_router,
    broker_router,
    account_router,
    positions_router,
    orders_router,
    trades_router,
    trade_cycles_router,
    market_router,
    strategies_router,
    dashboard_router,
    analytics_router,
]

__all__ = ["all_routers"]

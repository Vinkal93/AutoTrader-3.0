"""API routers aggregate export."""

from app.routers.account import router as account_router
from app.routers.broker import router as broker_router
from app.routers.dashboard import router as dashboard_router
from app.routers.health import router as health_router
from app.routers.market import router as market_router
from app.routers.orders import router as orders_router
from app.routers.positions import router as positions_router
from app.routers.strategies import router as strategies_router
from app.routers.system import router as system_router
from app.routers.trades import router as trades_router

all_routers = [
    health_router,
    system_router,
    broker_router,
    account_router,
    positions_router,
    orders_router,
    trades_router,
    market_router,
    strategies_router,
    dashboard_router,
]

__all__ = ["all_routers"]

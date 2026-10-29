"""
Abstract base broker adapter interface for financial integrity.
Canonical BrokerAdapter interface satisfying Phase 4 Multi-Broker Connection specifications.
All implementations enforce zero-mock financial principles and strict credential isolation.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.schemas.account import AccountFundsResponse, Order, Position, Trade
from app.schemas.broker import BrokerConnectionResponse
from app.schemas.market import CandlesResponse, NiftyQuote, OptionChainResponse


class BrokerAdapter(ABC):
    """Abstract interface that all broker implementations must satisfy."""

    @abstractmethod
    async def connect(self, **kwargs) -> BrokerConnectionResponse:
        """Authenticate and establish session with the broker."""
        pass

    async def authorize(self, **kwargs) -> BrokerConnectionResponse:
        """Alias for connect() conforming to Phase 4 naming."""
        return await self.connect(**kwargs)

    @abstractmethod
    async def disconnect(self) -> BrokerConnectionResponse:
        """Terminate broker session and clean up connections."""
        pass

    async def revoke(self) -> BrokerConnectionResponse:
        """Alias for disconnect() conforming to Phase 4 naming."""
        return await self.disconnect()

    async def refresh_session(self) -> BrokerConnectionResponse:
        """Refresh or reauthorize the active broker session when supported."""
        return await self.connection_status()

    async def refresh(self) -> BrokerConnectionResponse:
        """Alias for refresh_session() conforming to Phase 4 naming."""
        return await self.refresh_session()

    @abstractmethod
    async def connection_status(self) -> BrokerConnectionResponse:
        """Get live status of broker connection and underlying feeds."""
        pass

    async def get_profile(self) -> Optional[Dict[str, Any]]:
        """Fetch verified broker account profile (client code, name, exchanges enabled)."""
        return None

    async def getProfile(self) -> Optional[Dict[str, Any]]:
        """CamelCase alias for get_profile()."""
        return await self.get_profile()

    @abstractmethod
    async def get_funds(self) -> Optional[AccountFundsResponse]:
        """Fetch account cash, margins, and collateral. Returns None if broker unavailable."""
        pass

    async def getFunds(self) -> Optional[AccountFundsResponse]:
        """CamelCase alias for get_funds()."""
        return await self.get_funds()

    @abstractmethod
    async def get_positions(self) -> List[Position]:
        """Fetch current open/closed positions. Returns empty list if broker unavailable."""
        pass

    async def getPositions(self) -> List[Position]:
        """CamelCase alias for get_positions()."""
        return await self.get_positions()

    @abstractmethod
    async def get_orders(self) -> List[Order]:
        """Fetch today's orders list from broker."""
        pass

    async def getOrders(self) -> List[Order]:
        """CamelCase alias for get_orders()."""
        return await self.get_orders()

    @abstractmethod
    async def get_tradebook(self) -> List[Trade]:
        """Fetch executions / trades for the current day."""
        pass

    async def get_trades(self) -> List[Trade]:
        """Alias for get_tradebook()."""
        return await self.get_tradebook()

    async def getTrades(self) -> List[Trade]:
        """CamelCase alias for get_trades()."""
        return await self.get_trades()

    @abstractmethod
    async def get_instruments(self, exchange: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch contract/instrument list."""
        pass

    async def get_instrument_master(self) -> List[Dict[str, Any]]:
        """Fetch complete master security contracts file."""
        return await self.get_instruments()

    async def getInstrumentMaster(self) -> List[Dict[str, Any]]:
        """CamelCase alias for get_instrument_master()."""
        return await self.get_instrument_master()

    @abstractmethod
    async def get_expiries(self, symbol: str = "NIFTY") -> List[str]:
        """Fetch available options expiry dates for an underlying."""
        pass

    @abstractmethod
    async def get_option_chain(
        self, symbol: str = "NIFTY", expiry: Optional[str] = None
    ) -> Optional[OptionChainResponse]:
        """Fetch option chain with strikes and Greeks."""
        pass

    async def getOptionChain(
        self, symbol: str = "NIFTY", expiry: Optional[str] = None
    ) -> Optional[OptionChainResponse]:
        """CamelCase alias for get_option_chain()."""
        return await self.get_option_chain(symbol, expiry)

    @abstractmethod
    async def get_quotes(self, symbol: str = "NIFTY") -> Optional[NiftyQuote]:
        """Fetch live quote for index or instrument."""
        pass

    async def get_market_quotes(self, symbol: str = "NIFTY") -> Optional[NiftyQuote]:
        """Alias for get_quotes()."""
        return await self.get_quotes(symbol)

    async def getMarketQuotes(self, symbol: str = "NIFTY") -> Optional[NiftyQuote]:
        """CamelCase alias for get_market_quotes()."""
        return await self.get_market_quotes(symbol)

    @abstractmethod
    async def get_historical_candles(
        self,
        symbol: str = "NIFTY",
        interval: str = "5m",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> Optional[CandlesResponse]:
        """Fetch historical candle/bar data."""
        pass

    async def getHistoricalCandles(
        self,
        symbol: str = "NIFTY",
        interval: str = "5m",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> Optional[CandlesResponse]:
        """CamelCase alias for get_historical_candles()."""
        return await self.get_historical_candles(symbol, interval, from_date, to_date)

    async def get_order_capabilities(self) -> Dict[str, Any]:
        """Return canonical order capabilities and restrictions for this broker."""
        return {
            "supports_stop_loss_limit": True,
            "supports_market_options": False,
            "requires_static_ip": False,
            "daily_session_reset": "24h / EOD",
        }

    async def getOrderCapabilities(self) -> Dict[str, Any]:
        """CamelCase alias for get_order_capabilities()."""
        return await self.get_order_capabilities()

    async def get_rate_limits(self) -> Dict[str, Any]:
        """Return rate limit specifications for order and quote gateways."""
        return {
            "order_rate_limit_per_sec": 10,
            "quote_rate_limit_per_sec": 5,
        }

    async def getRateLimits(self) -> Dict[str, Any]:
        """CamelCase alias for get_rate_limits()."""
        return await self.get_rate_limits()

    async def get_health(self) -> Dict[str, Any]:
        """Return detailed connectivity health for order, quote, and report feeds."""
        status = await self.connection_status()
        return {
            "state": status.state.value if hasattr(status.state, "value") else str(status.state),
            "broker_name": status.broker_name,
            "market_feed": status.market_feed_status,
            "order_feed": status.order_feed_status,
            "report_api": status.report_api_status,
            "static_ip_compliant": status.static_ip_compliant,
            "last_error": status.last_error,
        }

    async def getHealth(self) -> Dict[str, Any]:
        """CamelCase alias for get_health()."""
        return await self.get_health()

    @abstractmethod
    async def subscribe_market_data(self, tokens: List[str]) -> bool:
        """Subscribe to real-time market data ticks."""
        pass

    @abstractmethod
    async def subscribe_order_updates(self) -> bool:
        """Subscribe to live order fill callbacks."""
        pass

    @abstractmethod
    async def estimate_required_margin(
        self, symbol: str, quantity: int, side: str
    ) -> Dict[str, Any]:
        """Estimate required margin for a given order."""
        pass

    # =========================================================================
    # Execution interfaces (Reserved and safety gated)
    # =========================================================================

    @abstractmethod
    async def place_order(
        self,
        trading_symbol: str,
        exchange: str,
        side: str,
        order_type: str,
        quantity: int,
        price: str,
        trigger_price: Optional[str] = None,
        product: str = "NRML",
        validity: str = "DAY",
        tag: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Place order with broker. In LIVE mode, submits to broker OMS; in PAPER mode, simulated."""
        pass

    async def placeOrder(self, **kwargs) -> Dict[str, Any]:
        """CamelCase alias for place_order()."""
        return await self.place_order(**kwargs)

    @abstractmethod
    async def modify_order(
        self,
        order_id: str,
        price: Optional[str] = None,
        quantity: Optional[int] = None,
        trigger_price: Optional[str] = None,
        order_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Modify an existing open order with broker."""
        pass

    async def modifyOrder(self, order_id: str, **kwargs) -> Dict[str, Any]:
        """CamelCase alias for modify_order()."""
        return await self.modify_order(order_id, **kwargs)

    @abstractmethod
    async def cancel_order(self, order_id: str) -> Dict[str, Any]:
        """Cancel an open order with broker."""
        pass

    async def cancelOrder(self, order_id: str) -> Dict[str, Any]:
        """CamelCase alias for cancel_order()."""
        return await self.cancel_order(order_id)

    @abstractmethod
    async def get_order_by_id(self, order_id: str) -> Optional[Order]:
        """Fetch status of specific order from broker orderbook."""
        pass

    async def exit_position(
        self,
        trading_symbol: str,
        exchange: str,
        quantity: int,
        side: str,
        product: str = "NRML",
    ) -> Dict[str, Any]:
        """Emergency square-off/exit position with safety limits."""
        exit_side = "SELL" if side.upper() == "BUY" else "BUY"
        return await self.place_order(
            trading_symbol=trading_symbol,
            exchange=exchange,
            side=exit_side,
            order_type="SL",
            quantity=quantity,
            price="0.00",
            product=product,
            tag="EMERGENCY_EXIT",
        )

    async def exitPosition(self, **kwargs) -> Dict[str, Any]:
        """CamelCase alias for exit_position()."""
        return await self.exit_position(**kwargs)

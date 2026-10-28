"""Abstract base broker adapter interface for financial integrity."""

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

    @abstractmethod
    async def disconnect(self) -> BrokerConnectionResponse:
        """Terminate broker session and clean up connections."""
        pass

    @abstractmethod
    async def connection_status(self) -> BrokerConnectionResponse:
        """Get live status of broker connection and underlying feeds."""
        pass

    @abstractmethod
    async def get_funds(self) -> Optional[AccountFundsResponse]:
        """Fetch account cash, margins, and collateral. Returns None if broker unavailable."""
        pass

    @abstractmethod
    async def get_positions(self) -> List[Position]:
        """Fetch current open/closed positions. Returns empty list if broker unavailable."""
        pass

    @abstractmethod
    async def get_orders(self) -> List[Order]:
        """Fetch today's orders list from broker."""
        pass

    @abstractmethod
    async def get_tradebook(self) -> List[Trade]:
        """Fetch executions / trades for the current day."""
        pass

    @abstractmethod
    async def get_instruments(self, exchange: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch master contract/instrument list."""
        pass

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

    @abstractmethod
    async def get_quotes(self, symbol: str = "NIFTY") -> Optional[NiftyQuote]:
        """Fetch live quote for index or instrument."""
        pass

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

    @abstractmethod
    async def cancel_order(self, order_id: str) -> Dict[str, Any]:
        """Cancel an open order with broker."""
        pass

    @abstractmethod
    async def get_order_by_id(self, order_id: str) -> Optional[Order]:
        """Fetch status of specific order from broker orderbook."""
        pass

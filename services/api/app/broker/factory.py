"""Broker factory providing singleton access to the active broker adapter."""

from typing import Optional
from app.broker.base import BrokerAdapter
from app.broker.kotak_neo import KotakNeoAdapter

_adapter_instance: Optional[BrokerAdapter] = None


def get_broker_adapter() -> BrokerAdapter:
    """Singleton getter for active BrokerAdapter."""
    global _adapter_instance
    if _adapter_instance is None:
        _adapter_instance = KotakNeoAdapter()
    return _adapter_instance


def reset_broker_adapter(adapter: Optional[BrokerAdapter] = None) -> None:
    """Reset the adapter instance (useful for unit tests)."""
    global _adapter_instance
    _adapter_instance = adapter

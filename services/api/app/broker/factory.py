"""
Broker factory providing singleton access and multi-broker adapter resolution.
Supports Kotak Neo, Dhan, Upstox, FYERS, Zerodha, and Angel One.
Adheres strictly to tenant isolation (Rule 10) and credential security (Rule 18).
"""

from typing import Any, Dict, Optional
from app.broker.angel_one import AngelOneAdapter
from app.broker.base import BrokerAdapter
from app.broker.dhan import DhanAdapter
from app.broker.fyers import FyersAdapter
from app.broker.kotak_neo import KotakNeoAdapter
from app.broker.upstox import UpstoxAdapter
from app.broker.zerodha import ZerodhaAdapter
from app.services.crypto_service import CryptoService

_adapter_instance: Optional[BrokerAdapter] = None
_connection_adapters: Dict[str, BrokerAdapter] = {}


def get_broker_adapter_for_provider(
    provider_id: str,
    credentials: Optional[Dict[str, Any]] = None,
) -> BrokerAdapter:
    """Instantiate a BrokerAdapter for a specified broker provider."""
    pid = provider_id.upper()
    creds = credentials or {}

    if pid == "KOTAK_NEO":
        return KotakNeoAdapter(
            consumer_key=creds.get("consumer_key") or creds.get("apiKey"),
            consumer_secret=creds.get("consumer_secret") or creds.get("apiSecret"),
            mobile_number=creds.get("mobile_number") or creds.get("mobileNumber"),
            password=creds.get("password"),
        )
    elif pid == "DHAN":
        return DhanAdapter(
            client_id=creds.get("client_id") or creds.get("clientId"),
            access_token=creds.get("access_token") or creds.get("accessToken"),
        )
    elif pid == "UPSTOX":
        return UpstoxAdapter(
            api_key=creds.get("api_key") or creds.get("apiKey"),
            api_secret=creds.get("api_secret") or creds.get("apiSecret"),
            access_token=creds.get("access_token") or creds.get("accessToken"),
        )
    elif pid == "FYERS":
        return FyersAdapter(
            app_id=creds.get("app_id") or creds.get("appId") or creds.get("apiKey"),
            secret_key=creds.get("secret_key") or creds.get("apiSecret"),
            access_token=creds.get("access_token") or creds.get("accessToken"),
        )
    elif pid in ("ZERODHA", "ZERODHA_KITE"):
        return ZerodhaAdapter(
            api_key=creds.get("api_key") or creds.get("apiKey"),
            api_secret=creds.get("api_secret") or creds.get("apiSecret"),
            access_token=creds.get("access_token") or creds.get("accessToken"),
        )
    elif pid == "ANGEL_ONE":
        return AngelOneAdapter(
            api_key=creds.get("api_key") or creds.get("apiKey"),
            client_code=creds.get("client_code") or creds.get("clientId"),
            jwt_token=creds.get("jwt_token") or creds.get("accessToken"),
        )
    else:
        # Fallback to Kotak Neo
        return KotakNeoAdapter()


def get_broker_adapter_for_connection(connection: Any) -> BrokerAdapter:
    """Retrieve or instantiate a BrokerAdapter bound to a specific user's BrokerConnection entity."""
    conn_id = getattr(connection, "id", None)
    if conn_id and conn_id in _connection_adapters:
        return _connection_adapters[conn_id]

    provider_id = getattr(connection, "provider_id", "KOTAK_NEO")
    encrypted_creds = getattr(connection, "credentials_encrypted", None)
    creds = CryptoService.decrypt_json(encrypted_creds) if encrypted_creds else {}

    adapter = get_broker_adapter_for_provider(provider_id, creds)
    if conn_id:
        _connection_adapters[conn_id] = adapter
    return adapter


def get_broker_adapter(provider_id: Optional[str] = None) -> BrokerAdapter:
    """Singleton getter for active BrokerAdapter (backward compatible)."""
    global _adapter_instance
    if provider_id:
        return get_broker_adapter_for_provider(provider_id)
    if _adapter_instance is None:
        _adapter_instance = KotakNeoAdapter()
    return _adapter_instance


def reset_broker_adapter(adapter: Optional[BrokerAdapter] = None) -> None:
    """Reset the adapter instance (useful for unit tests)."""
    global _adapter_instance, _connection_adapters
    _adapter_instance = adapter
    _connection_adapters.clear()

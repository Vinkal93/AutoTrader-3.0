"""Broker connection request and response schemas."""

from typing import Literal, Optional
from app.models.enums import BrokerConnectionState
from app.schemas.base import CamelModel


class BrokerConnectionResponse(CamelModel):
    state: BrokerConnectionState
    broker_name: str
    connected_at: Optional[str] = None
    session_expires_at: Optional[str] = None
    market_feed_status: Literal["CONNECTED", "DISCONNECTED", "ERROR"]
    order_feed_status: Literal["CONNECTED", "DISCONNECTED", "ERROR"]
    report_api_status: Literal["CONNECTED", "DISCONNECTED", "ERROR"]
    static_ip_compliant: Optional[bool] = None
    last_error: Optional[str] = None


class BrokerConnectRequest(CamelModel):
    totp: Optional[str] = None
    mpin: Optional[str] = None
    consumer_key: Optional[str] = None
    consumer_secret: Optional[str] = None
    mobile_number: Optional[str] = None
    password: Optional[str] = None

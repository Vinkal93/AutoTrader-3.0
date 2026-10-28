"""Common API response envelopes and metadata schemas."""

from typing import Any, Dict, Generic, List, Literal, Optional, TypeVar
from pydantic import Field
from app.models.enums import DataFreshness
from app.schemas.base import CamelModel

T = TypeVar("T")


class ApiError(CamelModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ResponseMeta(CamelModel):
    request_id: str
    timestamp: str  # ISO 8601 UTC
    as_of: Optional[str] = None
    last_synced_at: Optional[str] = None
    data_source: Optional[Literal["BROKER", "CACHE", "DATABASE"]] = None
    freshness: Optional[DataFreshness] = None


class ApiResponse(CamelModel, Generic[T]):
    success: bool = True
    data: T
    error: Optional[ApiError] = None
    meta: ResponseMeta


class PaginationMeta(CamelModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class PaginatedResponse(ApiResponse[List[T]], Generic[T]):
    pagination: PaginationMeta

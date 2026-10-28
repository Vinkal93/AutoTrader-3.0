"""Router dependencies and response builder utilities."""

import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional, TypeVar
from fastapi import Request
from app.models.enums import DataFreshness
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta, ResponseMeta

T = TypeVar("T")


def build_meta(
    request: Optional[Request] = None,
    data_source: Optional[str] = "DATABASE",
    freshness: Optional[DataFreshness] = None,
    as_of: Optional[str] = None,
) -> ResponseMeta:
    """Build standard ResponseMeta envelope."""
    request_id = getattr(request.state, "request_id", None) if request else None
    if not request_id:
        request_id = f"req_{uuid.uuid4().hex[:12]}"

    now_iso = datetime.now(timezone.utc).isoformat()
    return ResponseMeta(
        request_id=request_id,
        timestamp=now_iso,
        as_of=as_of or now_iso,
        last_synced_at=now_iso,
        data_source=data_source,  # type: ignore
        freshness=freshness or DataFreshness.LIVE,
    )


def success_response(
    data: T,
    request: Optional[Request] = None,
    data_source: Optional[str] = "DATABASE",
    freshness: Optional[DataFreshness] = None,
    as_of: Optional[str] = None,
) -> ApiResponse[T]:
    """Wrap data in standard ApiResponse envelope."""
    meta = build_meta(
        request=request,
        data_source=data_source,
        freshness=freshness,
        as_of=as_of,
    )
    return ApiResponse[T](
        success=True,
        data=data,
        error=None,
        meta=meta,
    )


def paginated_response(
    items: List[T],
    total_items: int,
    page: int = 1,
    page_size: int = 50,
    request: Optional[Request] = None,
    data_source: Optional[str] = "DATABASE",
    freshness: Optional[DataFreshness] = None,
) -> PaginatedResponse[T]:
    """Wrap list in standard PaginatedResponse envelope."""
    meta = build_meta(
        request=request,
        data_source=data_source,
        freshness=freshness,
    )
    total_pages = (total_items + page_size - 1) // page_size if page_size > 0 else 1
    return PaginatedResponse[T](
        success=True,
        data=items,
        error=None,
        meta=meta,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
        ),
    )

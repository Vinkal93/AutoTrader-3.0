"""Super Admin & SaaS Management Router (Codex Phase 8)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.deps import success_response
from app.schemas.admin import (
    AdminAuditLog,
    AdminBrokerConfig,
    AdminBrokerUpdateRequest,
    AdminDashboardMetrics,
    AdminInvoice,
    AdminPlan,
    AdminPlanCreateUpdate,
    AdminUserDetail,
    AdminUserListItem,
    AdminUserStatusUpdate,
    PaymentWebhookPayload,
    PaymentWebhookResult,
    PlatformEmergencyControlRequest,
    PlatformEmergencyControlResponse,
)
from app.schemas.common import ApiResponse
from app.services.auth_service import CurrentUser, require_super_admin
from app.services.admin_service import AdminService

router = APIRouter(prefix="/api/v1/admin", tags=["Super Admin"])


@router.get("/dashboard", response_model=ApiResponse[AdminDashboardMetrics])
async def get_admin_dashboard(
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdminDashboardMetrics]:
    """Retrieve platform-wide operational KPIs and system health metrics (Task 2)."""
    metrics = await AdminService.get_dashboard_metrics(db=db)
    return success_response(metrics, request=request, data_source="DATABASE")


@router.get("/users", response_model=ApiResponse[List[AdminUserListItem]])
async def list_admin_users(
    request: Request,
    search: Optional[str] = Query(None, description="Search by email or name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[AdminUserListItem]]:
    """List registered users with subscription and connected broker accounts (Task 3)."""
    users = await AdminService.get_users_list(search=search, limit=limit, offset=offset, db=db)
    return success_response(users, request=request, data_source="DATABASE")


@router.get("/users/{user_id}", response_model=ApiResponse[AdminUserDetail])
async def get_admin_user_detail(
    user_id: str,
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdminUserDetail]:
    """Retrieve detailed user state, masked KYC, and audit history (Task 3)."""
    user_detail = await AdminService.get_user_detail(user_id=user_id, db=db)
    if not user_detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {user_id} not found")
    return success_response(user_detail, request=request, data_source="DATABASE")


@router.post("/users/{user_id}/status", response_model=ApiResponse[AdminUserDetail])
async def update_admin_user_status(
    user_id: str,
    payload: AdminUserStatusUpdate,
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdminUserDetail]:
    """Suspend or reactivate user account with mandatory reason and audit trail (Task 3)."""
    try:
        updated = await AdminService.update_user_status(
            user_id=user_id,
            payload=payload,
            admin_email=admin.email,
            db=db,
        )
        return success_response(updated, request=request, data_source="DATABASE")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/brokers", response_model=ApiResponse[List[AdminBrokerConfig]])
async def list_admin_brokers(
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[AdminBrokerConfig]]:
    """List canonical brokers, rate limits, partner approval, and maintenance status (Task 4)."""
    brokers = await AdminService.get_brokers(db=db)
    return success_response(brokers, request=request, data_source="CONFIGURATION")


@router.put("/brokers/{broker_id}", response_model=ApiResponse[AdminBrokerConfig])
async def update_admin_broker_config(
    broker_id: str,
    payload: AdminBrokerUpdateRequest,
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdminBrokerConfig]:
    """Configure broker maintenance mode, partner approval, or rate limits (Task 4)."""
    try:
        updated = await AdminService.update_broker_config(
            broker_id=broker_id,
            payload=payload,
            admin_email=admin.email,
            db=db,
        )
        return success_response(updated, request=request, data_source="CONFIGURATION")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/plans", response_model=ApiResponse[List[AdminPlan]])
async def list_admin_plans(
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[AdminPlan]]:
    """Fetch database-driven subscription plans and feature quotas (Task 5)."""
    plans = await AdminService.get_plans(db=db)
    return success_response(plans, request=request, data_source="DATABASE")


@router.post("/plans/{plan_id}", response_model=ApiResponse[AdminPlan])
async def save_admin_plan(
    plan_id: str,
    payload: AdminPlanCreateUpdate,
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdminPlan]:
    """Create or update database-driven plan definition (Task 5)."""
    plan = await AdminService.create_or_update_plan(
        plan_id=plan_id,
        payload=payload,
        admin_email=admin.email,
        db=db,
    )
    return success_response(plan, request=request, data_source="DATABASE")


@router.get("/invoices", response_model=ApiResponse[List[AdminInvoice]])
async def list_admin_invoices(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[AdminInvoice]]:
    """Fetch confirmed invoices and payments (Task 6)."""
    invoices = await AdminService.get_invoices(limit=limit, db=db)
    return success_response(invoices, request=request, data_source="DATABASE")


@router.post("/billing/webhook", response_model=ApiResponse[PaymentWebhookResult])
async def process_billing_webhook(
    payload: PaymentWebhookPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PaymentWebhookResult]:
    """Server-side verified payment webhook endpoint with HMAC validation and idempotency (Task 6)."""
    try:
        result = await AdminService.process_billing_webhook(payload=payload, db=db)
        return success_response(result, request=request, data_source="PAYMENT_GATEWAY")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/audit-logs", response_model=ApiResponse[List[AdminAuditLog]])
async def list_admin_audit_logs(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[AdminAuditLog]]:
    """Fetch immutable administrator operations audit ledger (Task 7)."""
    logs = await AdminService.get_audit_logs(limit=limit, db=db)
    return success_response(logs, request=request, data_source="DATABASE")


@router.post("/operations/emergency-control", response_model=ApiResponse[PlatformEmergencyControlResponse])
async def execute_platform_emergency_control(
    payload: PlatformEmergencyControlRequest,
    request: Request,
    admin: CurrentUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PlatformEmergencyControlResponse]:
    """Platform-wide trading kill-switch / entry disable control with audited semantics (Task 7)."""
    result = await AdminService.emergency_platform_control(
        payload=payload,
        admin_email=admin.email,
        db=db,
    )
    return success_response(result, request=request, data_source="OPERATIONS")

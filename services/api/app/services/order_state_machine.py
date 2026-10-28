"""Deterministic 13-State Order Lifecycle State Machine adhering to ORDER_LIFECYCLE.md."""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Set
from app.models.enums import OrderLifecycleState, OrderStatus

logger = logging.getLogger("app.order_state_machine")


class InvalidStateTransitionError(ValueError):
    """Raised when an illegal order lifecycle transition is attempted."""
    pass


class OrderStateMachine:
    """
    Deterministic finite state machine governing the 13 order lifecycle states.
    Prevents blind retries, duplicate orders, and untracked fills.
    """

    # Allowed state transition matrix
    VALID_TRANSITIONS: Dict[OrderLifecycleState, Set[OrderLifecycleState]] = {
        OrderLifecycleState.CREATED: {
            OrderLifecycleState.VALIDATING,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.VALIDATING: {
            OrderLifecycleState.AWAITING_SUBMISSION,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.AWAITING_SUBMISSION: {
            OrderLifecycleState.SUBMITTING,
            OrderLifecycleState.CANCELLED,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.SUBMITTING: {
            OrderLifecycleState.ACKNOWLEDGED,
            OrderLifecycleState.OPEN,
            OrderLifecycleState.FILLED,
            OrderLifecycleState.REJECTED,
            OrderLifecycleState.UNKNOWN,
        },
        OrderLifecycleState.ACKNOWLEDGED: {
            OrderLifecycleState.OPEN,
            OrderLifecycleState.PARTIALLY_FILLED,
            OrderLifecycleState.FILLED,
            OrderLifecycleState.CANCEL_PENDING,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.OPEN: {
            OrderLifecycleState.PARTIALLY_FILLED,
            OrderLifecycleState.FILLED,
            OrderLifecycleState.CANCEL_PENDING,
            OrderLifecycleState.CANCELLED,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.PARTIALLY_FILLED: {
            OrderLifecycleState.FILLED,
            OrderLifecycleState.CANCEL_PENDING,
            OrderLifecycleState.CANCELLED,
        },
        OrderLifecycleState.CANCEL_PENDING: {
            # Cancel confirmed, fill race won by fill, or cancel rejected
            OrderLifecycleState.CANCELLED,
            OrderLifecycleState.FILLED,
            OrderLifecycleState.OPEN,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.UNKNOWN: {
            OrderLifecycleState.RECONCILING,
            OrderLifecycleState.REJECTED,
        },
        OrderLifecycleState.RECONCILING: {
            OrderLifecycleState.ACKNOWLEDGED,
            OrderLifecycleState.OPEN,
            OrderLifecycleState.PARTIALLY_FILLED,
            OrderLifecycleState.FILLED,
            OrderLifecycleState.CANCELLED,
            OrderLifecycleState.REJECTED,
        },
        # Terminal states
        OrderLifecycleState.FILLED: set(),
        OrderLifecycleState.CANCELLED: set(),
        OrderLifecycleState.REJECTED: set(),
    }

    # Lifecycle state to high-level OrderStatus mapping
    LIFECYCLE_TO_STATUS_MAP: Dict[OrderLifecycleState, OrderStatus] = {
        OrderLifecycleState.CREATED: OrderStatus.PENDING,
        OrderLifecycleState.VALIDATING: OrderStatus.PENDING,
        OrderLifecycleState.AWAITING_SUBMISSION: OrderStatus.PENDING,
        OrderLifecycleState.SUBMITTING: OrderStatus.PENDING,
        OrderLifecycleState.ACKNOWLEDGED: OrderStatus.OPEN,
        OrderLifecycleState.OPEN: OrderStatus.OPEN,
        OrderLifecycleState.PARTIALLY_FILLED: OrderStatus.PARTIALLY_FILLED,
        OrderLifecycleState.FILLED: OrderStatus.FILLED,
        OrderLifecycleState.CANCEL_PENDING: OrderStatus.OPEN,
        OrderLifecycleState.CANCELLED: OrderStatus.CANCELLED,
        OrderLifecycleState.REJECTED: OrderStatus.REJECTED,
        OrderLifecycleState.UNKNOWN: OrderStatus.ERROR,
        OrderLifecycleState.RECONCILING: OrderStatus.PENDING,
    }

    @classmethod
    def is_valid_transition(
        cls, current_state: OrderLifecycleState, target_state: OrderLifecycleState
    ) -> bool:
        """Check if transition from current_state to target_state is permitted."""
        allowed = cls.VALID_TRANSITIONS.get(current_state, set())
        return target_state in allowed

    @classmethod
    def is_terminal(cls, state: OrderLifecycleState) -> bool:
        """Returns True if the state is terminal (cannot transition further)."""
        return state in {
            OrderLifecycleState.FILLED,
            OrderLifecycleState.CANCELLED,
            OrderLifecycleState.REJECTED,
        }

    @classmethod
    def to_order_status(cls, lifecycle_state: OrderLifecycleState) -> OrderStatus:
        """Derive standard OrderStatus enum from fine-grained OrderLifecycleState."""
        return cls.LIFECYCLE_TO_STATUS_MAP.get(lifecycle_state, OrderStatus.PENDING)

    @classmethod
    def validate_transition(
        cls,
        order_id: str,
        current_state: OrderLifecycleState,
        target_state: OrderLifecycleState,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates transition and returns audit event payload.
        Raises InvalidStateTransitionError if invalid.
        """
        if not cls.is_valid_transition(current_state, target_state):
            msg = (
                f"Illegal order lifecycle transition for order {order_id}: "
                f"{current_state.value} -> {target_state.value}. "
                f"Allowed from {current_state.value}: {[s.value for s in cls.VALID_TRANSITIONS.get(current_state, set())]}"
            )
            logger.error(msg)
            raise InvalidStateTransitionError(msg)

        now_utc = datetime.now(timezone.utc).isoformat()
        audit_event = {
            "orderId": order_id,
            "previousState": current_state.value,
            "newState": target_state.value,
            "orderStatus": cls.to_order_status(target_state).value,
            "reason": reason or "State transition executed",
            "timestamp": now_utc,
            "isTerminal": cls.is_terminal(target_state),
        }

        logger.info(
            f"Order {order_id} transitioned: {current_state.value} -> {target_state.value} "
            f"({reason or 'No reason provided'})"
        )
        return audit_event

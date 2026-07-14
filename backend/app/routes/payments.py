from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.payment import PaymentOrderCreate, PaymentOrderResponse
from app.middleware.auth import get_current_user
from app.services import payment_service
from app.config.constants import COD_PROCESSING_FEE, RUNNER_DEDUCTION_PERCENT

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(
    payload: PaymentOrderCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Creates a Razorpay Order. Calculates fees on the server to prevent tampering.
    """
    reward = payload.reward_offered
    order_type = payload.order_type
    cod = payload.cod_amount if order_type == "COD" else 0.0

    # COD processing fee: ₹10 for COD orders, ₹0 for prepaid
    cod_fee = COD_PROCESSING_FEE if order_type == "COD" else 0.0
    
    # Runner deduction (10%) — not charged to owner, deducted from runner's payout
    runner_deduction = round(reward * RUNNER_DEDUCTION_PERCENT, 2)
    runner_payout = round(reward - runner_deduction, 2)

    # Owner pays: reward + COD fee + COD amount
    total_amount = round(reward + cod_fee + cod, 2)

    try:
        order = payment_service.create_razorpay_order(total_amount)
        return {
            "razorpay_order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "platform_fee": cod_fee,
            "runner_payout": runner_payout,
            "total_amount": total_amount
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

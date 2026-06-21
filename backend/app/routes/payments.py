from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.payment import PaymentOrderCreate, PaymentOrderResponse
from app.middleware.auth import get_current_user
from app.services import payment_service
from app.config.constants import PLATFORM_FEE_PERCENT, COD_ADDITIONAL_FEE

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

    # Calculate platform fees
    platform_fee = round(reward * PLATFORM_FEE_PERCENT, 2)
    if order_type == "COD":
        platform_fee = round(platform_fee + COD_ADDITIONAL_FEE, 2)

    total_amount = round(reward + platform_fee + cod, 2)

    try:
        order = payment_service.create_razorpay_order(total_amount)
        return {
            "razorpay_order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "platform_fee": platform_fee,
            "total_amount": total_amount
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

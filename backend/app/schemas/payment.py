from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PaymentOrderCreate(BaseModel):
    reward_offered: float = Field(..., ge=20.0, le=100.0)
    order_type: str = Field(..., pattern="^(PREPAID|COD)$")
    cod_amount: Optional[float] = 0.0

class PaymentOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int  # in paise
    currency: str
    platform_fee: float
    total_amount: float

class PaymentResponse(BaseModel):
    id: int
    request_id: int
    amount: float
    platform_fee: float
    cod_amount: float
    payment_id: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

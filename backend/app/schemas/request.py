from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import PublicUserResponse

class RequestCreate(BaseModel):
    courier_company: str = Field(..., min_length=1, max_length=100)
    tracking_number: Optional[str] = Field(None, max_length=100)
    tracking_image_url: Optional[str] = None
    pickup_location: str = Field(..., min_length=1, max_length=100)
    hostel: str = Field(..., min_length=1, max_length=50)
    room_number: str = Field(..., min_length=1, max_length=20)
    order_type: str = Field(..., pattern="^(PREPAID|COD)$")
    cod_amount: Optional[float] = 0.0
    reward_offered: float = Field(..., ge=20.0, le=100.0)
    notes: Optional[str] = None
    
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class RequestStatusUpdate(BaseModel):
    status: str

class RequestVerifyOTP(BaseModel):
    otp_code: str

class RequestResponse(BaseModel):
    id: int
    owner_id: int
    runner_id: Optional[int] = None
    courier_company: str
    tracking_number: Optional[str] = None
    tracking_image_url: Optional[str] = None
    pickup_location: str
    hostel: str
    room_number: str
    order_type: str
    cod_amount: float
    reward_offered: float
    platform_fee: float
    total_amount: float
    notes: Optional[str] = None
    status: str
    created_at: datetime
    
    # Expand nested objects
    owner: Optional[PublicUserResponse] = None
    runner: Optional[PublicUserResponse] = None
    
    # Plain text OTP code returned ONLY on creation response
    otp_code: Optional[str] = None

    model_config = {
        "from_attributes": True
    }
    
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        if hasattr(obj, "temp_otp_code"):
            instance.otp_code = obj.temp_otp_code
        return instance

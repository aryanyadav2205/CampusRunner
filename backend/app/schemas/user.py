from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone_number: str
    email: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    registration_number: str = Field(..., min_length=1, max_length=50)
    hostel: str = Field(..., min_length=1, max_length=50)
    room_number: str = Field(..., min_length=1, max_length=20)
    profile_photo: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    phone_number: str
    email: str
    full_name: Optional[str] = None
    registration_number: Optional[str] = None
    hostel: Optional[str] = None
    room_number: Optional[str] = None
    profile_photo: Optional[str] = None
    is_verified: bool
    is_suspended: bool
    is_admin: bool
    rating_owner: float
    rating_runner: float
    success_rate_owner: float
    success_rate_runner: float
    completed_deliveries: int
    completed_receipts: int
    wallet_balance: float
    created_at: datetime
    
    # Computed property
    is_profile_complete: bool = False

    model_config = {
        "from_attributes": True
    }

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        # Check completeness
        instance.is_profile_complete = bool(
            obj.full_name and 
            obj.registration_number and 
            obj.hostel and 
            obj.room_number
        )
        return instance

class PublicUserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    rating_owner: float
    rating_runner: float
    success_rate_owner: float
    success_rate_runner: float
    completed_deliveries: int
    is_verified: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    request_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    request_id: int
    reviewer_id: int
    reviewee_id: int
    role: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

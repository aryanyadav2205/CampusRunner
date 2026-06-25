from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class MessageResponse(BaseModel):
    id: int
    request_id: int
    sender_id: int
    text: str
    created_at: datetime
    
    # Optional fields for frontend display
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None  # "owner", "runner", "admin"

    model_config = {
        "from_attributes": True
    }

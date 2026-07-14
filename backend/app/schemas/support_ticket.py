from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SupportTicketCreate(BaseModel):
    subject: str
    message: str

class SupportTicketUpdate(BaseModel):
    status: str

class SupportTicketReply(BaseModel):
    reply_message: str

class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    admin_reply: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

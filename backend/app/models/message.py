from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from datetime import datetime
from app.database.base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # We could add an is_admin flag if admin sends a message, or check sender role
    # For now, relying on sender_id is enough (we can check if user is admin).

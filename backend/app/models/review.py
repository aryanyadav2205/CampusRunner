from sqlalchemy import Column, Integer, ForeignKey, Text, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    role = Column(String(10), nullable=False)  # "OWNER" or "RUNNER" (role of reviewee)
    rating = Column(Integer, nullable=False)   # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", backref="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], backref="reviews_received")

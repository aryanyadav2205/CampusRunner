from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False)
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    cod_amount = Column(Float, default=0.0)
    
    payment_id = Column(String(100), nullable=True)  # Razorpay ID
    status = Column(String(20), default="PENDING")   # PENDING, PAID, REFUNDED
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", backref="payments")

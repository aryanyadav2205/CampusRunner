from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    runner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    courier_company = Column(String(100), nullable=False)
    tracking_number = Column(String(100), nullable=True)
    tracking_image_url = Column(String(255), nullable=True)
    pickup_location = Column(String(100), nullable=False)
    hostel = Column(String(50), nullable=False)
    room_number = Column(String(20), nullable=False)
    
    order_type = Column(String(10), nullable=False)  # "PREPAID" or "COD"
    cod_amount = Column(Float, default=0.0)
    reward_offered = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="OPEN")  # OPEN, ACCEPTED, PICKED_UP, OUT_FOR_DELIVERY, OTP_VERIFICATION, COMPLETED, CANCELLED
    otp_hash = Column(String(64), nullable=False)
    otp_code = Column(String(10), nullable=True) # Plain code for owner visibility
    
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", foreign_keys=[owner_id], backref="owned_requests")
    runner = relationship("User", foreign_keys=[runner_id], backref="accepted_runs")

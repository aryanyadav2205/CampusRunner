from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from datetime import datetime
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    registration_number = Column(String(50), unique=True, nullable=True)
    hostel = Column(String(50), nullable=True)
    room_number = Column(String(20), nullable=True)
    profile_photo = Column(String(255), nullable=True)
    
    is_verified = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Reputation metrics
    rating_owner = Column(Float, default=5.0)
    rating_runner = Column(Float, default=5.0)
    success_rate_owner = Column(Float, default=100.0)
    success_rate_runner = Column(Float, default=100.0)
    
    completed_deliveries = Column(Integer, default=0)
    completed_receipts = Column(Integer, default=0)
    
    wallet_balance = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

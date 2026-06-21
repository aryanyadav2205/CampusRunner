from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services import otp_service
from app.utils.jwt import create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class OTPSendRequest(BaseModel):
    email: str
    phone_number: str

class OTPVerifyRequest(BaseModel):
    email: str
    otp_code: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

@router.post("/otp/send", status_code=status.HTTP_200_OK)
def send_otp(payload: OTPSendRequest, db: Session = Depends(get_db)):
    """
    Triggers 4-digit OTP code generation and sends it to the user's email address.
    """
    email = payload.email.strip().lower()
    phone = payload.phone_number.strip()
    
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required.")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required.")
        
    try:
        otp_service.send_otp(db, email, phone)
        return {
            "message": "OTP sent successfully. Please check your email inbox.",
            "email": email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies the OTP code sent to email. Auto-creates a new user record if the email is logging in for the first time.
    Returns the JWT token and profile details.
    """
    email = payload.email.strip().lower()
    code = payload.otp_code.strip()
    
    # Verify OTP
    if not otp_service.verify_otp(db, email, code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")
    
    # Retrieve the phone number from the most recent OTP log for this email
    from app.models.admin import OTPLog
    latest_otp = db.query(OTPLog).filter(
        OTPLog.email == email,
        OTPLog.is_verified == True
    ).order_by(OTPLog.created_at.desc()).first()
    
    phone_number = latest_otp.phone_number if latest_otp else ""
        
    # Check if user exists by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Also check if phone number already belongs to another user
        existing_phone_user = db.query(User).filter(User.phone_number == phone_number).first() if phone_number else None
        if existing_phone_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This phone number is already registered with a different email."
            )
        
        # Auto-register new user
        is_first_user = db.query(User).count() == 0
        user = User(
            email=email,
            phone_number=phone_number,
            is_admin=is_first_user
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Generate JWT — use email as the subject
    token = create_access_token(data={"sub": user.email})
    
    return {
        "token": token,
        "user": UserResponse.model_validate(user)
    }

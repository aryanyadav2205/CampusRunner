from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.request import Request
from app.models.payment import Payment
from app.models.admin import AdminLog
from app.schemas.user import UserResponse
from app.schemas.request import RequestResponse
from app.middleware.auth import get_current_admin
from pydantic import BaseModel
from app.config.constants import RequestStatus, PaymentStatus

router = APIRouter(prefix="/admin", tags=["admin"])

class UserSuspendPayload(BaseModel):
    suspend: bool
    reason: str

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Administrator view to inspect all registered student profiles.
    """
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]

@router.post("/users/{user_id}/suspend")
def toggle_user_suspension(
    user_id: int,
    payload: UserSuspendPayload,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Administratively suspends or restores a student's access. Logs the action.
    """
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot suspend your own admin account.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.is_suspended = payload.suspend
    
    # Log the action
    action_type = "USER_SUSPENSION" if payload.suspend else "USER_RESTORE"
    log = AdminLog(
        admin_id=admin.id,
        action=action_type,
        details=f"Target User ID: {user_id}. Reason: {payload.reason}"
    )
    db.add(log)
    db.commit()
    
    status_str = "suspended" if payload.suspend else "restored"
    return {"message": f"User successfully {status_str}."}

@router.get("/requests", response_model=List[RequestResponse])
def get_all_requests(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Administrator audit view to inspect all system delivery requests.
    """
    requests = db.query(Request).all()
    return [RequestResponse.model_validate(r) for r in requests]

@router.get("/revenue")
def get_platform_revenue(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Aggregates financial and volume statistics across the platform.
    """
    # Sum platform fees from paid payments
    total_platform_fees = db.query(func.sum(Payment.platform_fee)).filter(
        Payment.status == PaymentStatus.PAID
    ).scalar() or 0.0

    # COD funds handled
    total_cod_handled = db.query(func.sum(Payment.cod_amount)).filter(
        Payment.status == PaymentStatus.PAID
    ).scalar() or 0.0

    # Request breakdown by status
    status_counts = db.query(
        Request.status, func.count(Request.id)
    ).group_by(Request.status).all()

    counts_dict = {status_name: 0 for status_name in [
        RequestStatus.OPEN, RequestStatus.ACCEPTED, RequestStatus.PICKED_UP,
        RequestStatus.OUT_FOR_DELIVERY, RequestStatus.OTP_VERIFICATION,
        RequestStatus.COMPLETED, RequestStatus.CANCELLED
    ]}
    
    for status_name, count in status_counts:
        counts_dict[status_name] = count

    return {
        "total_platform_fees": round(float(total_platform_fees), 2),
        "total_cod_handled": round(float(total_cod_handled), 2),
        "request_volume": counts_dict
    }

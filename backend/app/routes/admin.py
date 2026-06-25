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
from app.schemas.wallet import WithdrawalRequestResponse
from app.models.wallet import WithdrawalRequest, WithdrawalStatus, WalletTransaction, TransactionType
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

    # Total System Liability (Wallet Balances)
    total_liability = db.query(func.sum(User.wallet_balance)).scalar() or 0.0
    
    # User counts
    total_users = db.query(User).count()
    active_runners = db.query(User).filter(User.completed_deliveries > 0).count()

    return {
        "total_platform_fees": round(float(total_platform_fees), 2),
        "total_cod_handled": round(float(total_cod_handled), 2),
        "system_liability": round(float(total_liability), 2),
        "total_users": total_users,
        "active_runners": active_runners,
        "request_volume": counts_dict
    }

class ProcessWithdrawalPayload(BaseModel):
    action: str  # "APPROVE" or "REJECT"
    notes: Optional[str] = None

@router.get("/withdrawals", response_model=List[WithdrawalRequestResponse])
def get_all_withdrawals(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Administrator view to inspect all withdrawal requests (pending and processed).
    """
    withdrawals = db.query(WithdrawalRequest).order_by(WithdrawalRequest.created_at.desc()).all()
    return [WithdrawalRequestResponse.model_validate(w) for w in withdrawals]

@router.post("/withdrawals/{withdrawal_id}/process")
def process_withdrawal(
    withdrawal_id: int,
    payload: ProcessWithdrawalPayload,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin processes a pending withdrawal.
    """
    withdrawal = db.query(WithdrawalRequest).filter(WithdrawalRequest.id == withdrawal_id).first()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal request not found.")
        
    if withdrawal.status != WithdrawalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Request is already {withdrawal.status.value}.")
        
    from datetime import datetime
    
    user = db.query(User).filter(User.id == withdrawal.user_id).first()
    
    if payload.action == "APPROVE":
        withdrawal.status = WithdrawalStatus.COMPLETED
        # The money was already deducted from the user's wallet when they requested.
    elif payload.action == "REJECT":
        withdrawal.status = WithdrawalStatus.REJECTED
        # Refund the money back to the user's wallet
        if user:
            user.wallet_balance += withdrawal.amount
            
            # Log the refund transaction
            refund_tx = WalletTransaction(
                user_id=user.id,
                amount=withdrawal.amount,
                transaction_type=TransactionType.CREDIT,
                description=f"Refund: Withdrawal Rejected - {payload.notes or 'No reason provided'}",
                reference_id=f"WD_REFUND_{withdrawal.id}"
            )
            db.add(refund_tx)
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REJECT.")
        
    withdrawal.admin_notes = payload.notes
    withdrawal.processed_at = datetime.utcnow()
    
    # Log the admin action
    log = AdminLog(
        admin_id=admin.id,
        action=f"WITHDRAWAL_{payload.action}",
        details=f"Withdrawal ID: {withdrawal_id}, Amount: {withdrawal.amount}, User ID: {withdrawal.user_id}"
    )
    db.add(log)
    
    db.commit()
    return {"message": f"Withdrawal successfully {payload.action.lower()}ed."}

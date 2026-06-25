from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.user import User
from app.models.wallet import WalletTransaction, WithdrawalRequest, TransactionType, WithdrawalStatus
from app.schemas.wallet import WalletBalanceResponse, WithdrawalRequestCreate, WithdrawalRequestResponse, WalletTransactionResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("/balance", response_model=WalletBalanceResponse)
def get_wallet_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current wallet balance, recent transactions, and recent withdrawal requests.
    """
    # Fetch transactions
    transactions = db.query(WalletTransaction).filter(
        WalletTransaction.user_id == current_user.id
    ).order_by(WalletTransaction.created_at.desc()).limit(20).all()
    
    # Fetch withdrawals
    withdrawals = db.query(WithdrawalRequest).filter(
        WithdrawalRequest.user_id == current_user.id
    ).order_by(WithdrawalRequest.created_at.desc()).limit(10).all()
    
    return {
        "balance": current_user.wallet_balance or 0.0,
        "transactions": transactions,
        "recent_withdrawals": withdrawals
    }

@router.post("/withdraw", response_model=WithdrawalRequestResponse, status_code=status.HTTP_201_CREATED)
def request_withdrawal(
    payload: WithdrawalRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request a withdrawal of funds to a UPI ID.
    """
    amount = round(payload.amount, 2)
    
    if amount < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum withdrawal amount is ₹50."
        )
        
    if current_user.wallet_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance."
        )
        
    # Deduct from wallet
    current_user.wallet_balance -= amount
    
    # Create withdrawal request
    withdrawal = WithdrawalRequest(
        user_id=current_user.id,
        amount=amount,
        upi_id=payload.upi_id,
        status=WithdrawalStatus.PENDING
    )
    db.add(withdrawal)
    db.flush() # flush to get withdrawal.id
    
    # Create transaction log
    transaction = WalletTransaction(
        user_id=current_user.id,
        amount=amount,
        transaction_type=TransactionType.DEBIT,
        description=f"Withdrawal to {payload.upi_id}",
        reference_id=f"WD_{withdrawal.id}"
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(withdrawal)
    
    return withdrawal

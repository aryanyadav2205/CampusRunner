from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.wallet import TransactionType, WithdrawalStatus

class WalletTransactionResponse(BaseModel):
    id: int
    amount: float
    transaction_type: TransactionType
    description: Optional[str]
    reference_id: Optional[str]
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class WithdrawalRequestCreate(BaseModel):
    amount: float = Field(..., gt=0)
    upi_id: str = Field(..., min_length=5, max_length=100)

class WithdrawalRequestResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    upi_id: str
    status: WithdrawalStatus
    admin_notes: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class WalletBalanceResponse(BaseModel):
    balance: float
    transactions: List[WalletTransactionResponse]
    recent_withdrawals: List[WithdrawalRequestResponse]

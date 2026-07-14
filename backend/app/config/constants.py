# Fees configuration
COD_PROCESSING_FEE = 10.0        # Fixed ₹10 fee for COD orders (charged to owner)
RUNNER_DEDUCTION_PERCENT = 0.10  # 10% deducted from runner's reward as platform fee

# Reward limits
MIN_REWARD = 20.0
MAX_REWARD = 100.0

# Request statuses
class RequestStatus:
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    PICKED_UP = "PICKED_UP"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    OTP_VERIFICATION = "OTP_VERIFICATION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# Payment statuses
class PaymentStatus:
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"

# Review roles
class ReviewRole:
    OWNER = "OWNER"
    RUNNER = "RUNNER"

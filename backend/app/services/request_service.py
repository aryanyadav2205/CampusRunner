from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.request import Request
from app.models.payment import Payment
from app.models.user import User
from app.config.constants import RequestStatus, PaymentStatus, PLATFORM_FEE_PERCENT, COD_ADDITIONAL_FEE
from app.utils.helpers import generate_numeric_otp
from app.utils.security import hash_otp, verify_otp_hash
from app.services.payment_service import verify_payment_signature
from app.services.reputation_service import update_user_reputation

def create_request(
    db: Session,
    owner_id: int,
    courier_company: str,
    tracking_number: str,
    pickup_location: str,
    hostel: str,
    room_number: str,
    order_type: str,
    reward_offered: float,
    notes: str = None,
    cod_amount: float = 0.0,
    razorpay_order_id: str = None,
    razorpay_payment_id: str = None,
    razorpay_signature: str = None
) -> Request:
    """
    Handles request creation, fee calculations, payment verification, and OTP generation.
    """
    # 1. Validate reward bounds
    if reward_offered < 20.0 or reward_offered > 100.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward offered must be between ₹20 and ₹100."
        )

    # 2. Calculate platform fees
    platform_fee = round(reward_offered * PLATFORM_FEE_PERCENT, 2)
    if order_type == "COD":
        platform_fee = round(platform_fee + COD_ADDITIONAL_FEE, 2)
    else:
        cod_amount = 0.0  # Prepaid has no COD amount

    total_amount = round(reward_offered + platform_fee + cod_amount, 2)

    # 3. Verify Payment Signature
    if not verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay payment verification failed."
        )

    # 4. Generate 4-digit OTP for verification
    otp_code = generate_numeric_otp(4)
    otp_hash_val = hash_otp(otp_code)

    # Print to console for development visibility
    print("\n" + "=" * 50)
    print(f"CAMPUS RUNNER DELIVERY OTP CREATION")
    print(f"OTP CODE   : {otp_code}")
    print("=" * 50 + "\n")

    # 5. Save Request
    db_request = Request(
        owner_id=owner_id,
        courier_company=courier_company,
        tracking_number=tracking_number,
        pickup_location=pickup_location,
        hostel=hostel,
        room_number=room_number,
        order_type=order_type,
        cod_amount=cod_amount,
        reward_offered=reward_offered,
        platform_fee=platform_fee,
        total_amount=total_amount,
        notes=notes,
        status=RequestStatus.OPEN,
        otp_hash=otp_hash_val,
        otp_code=otp_code
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # 6. Save Payment log
    db_payment = Payment(
        request_id=db_request.id,
        amount=total_amount,
        platform_fee=platform_fee,
        cod_amount=cod_amount,
        payment_id=razorpay_payment_id,
        status=PaymentStatus.PAID
    )
    
    db.add(db_payment)
    db.commit()

    # Pass the plain OTP code as a temporary property (not saved to database) 
    # so the API response can return it to the owner upon creation.
    db_request.temp_otp_code = otp_code
    return db_request

def accept_request(db: Session, request_id: int, runner_id: int) -> Request:
    """
    Allows a student user to accept an open request for delivery.
    """
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
        
    if request.status != RequestStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is already accepted or cancelled.")
        
    if request.owner_id == runner_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot accept your own delivery request.")

    # Check suspension
    runner = db.query(User).filter(User.id == runner_id).first()
    if runner and runner.is_suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is suspended. You cannot accept runs.")

    request.runner_id = runner_id
    request.status = RequestStatus.ACCEPTED
    db.commit()
    db.refresh(request)
    
    return request

def update_request_status(db: Session, request_id: int, new_status: str, runner_id: int) -> Request:
    """
    Steps through runner status changes: ACCEPTED -> PICKED_UP -> OUT_FOR_DELIVERY -> OTP_VERIFICATION.
    """
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
        
    if request.runner_id != runner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized as the runner for this request.")

    current = request.status
    is_valid = False
    
    if current == RequestStatus.ACCEPTED and new_status == RequestStatus.PICKED_UP:
        is_valid = True
    elif current == RequestStatus.PICKED_UP and new_status == RequestStatus.OUT_FOR_DELIVERY:
        is_valid = True
    elif current == RequestStatus.OUT_FOR_DELIVERY and new_status == RequestStatus.OTP_VERIFICATION:
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid status transition from {current} to {new_status}."
        )

    request.status = new_status
    db.commit()
    db.refresh(request)
    return request

def verify_delivery_otp(db: Session, request_id: int, otp_code: str, runner_id: int) -> Request:
    """
    Validates owner's OTP and completes delivery.
    """
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
        
    if request.runner_id != runner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not the runner assigned to this request.")
        
    if request.status != RequestStatus.OTP_VERIFICATION:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is not ready for OTP verification.")

    if not verify_otp_hash(otp_code, request.otp_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect OTP. Verification failed.")

    request.status = RequestStatus.COMPLETED
    db.commit()

    # Refresh owner and runner reputation metrics
    update_user_reputation(db, request.owner_id)
    update_user_reputation(db, request.runner_id)

    db.refresh(request)
    return request

def cancel_request(db: Session, request_id: int, owner_id: int) -> Request:
    """
    Allows the owner to cancel a request. Only valid while status is OPEN.
    """
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
        
    if request.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the request owner can cancel this request.")
        
    if request.status != RequestStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel request after a runner has accepted it.")

    request.status = RequestStatus.CANCELLED
    
    # Mark payment log as refunded
    payment = db.query(Payment).filter(Payment.request_id == request_id).first()
    if payment:
        payment.status = PaymentStatus.REFUNDED
        
    db.commit()
    db.refresh(request)
    return request

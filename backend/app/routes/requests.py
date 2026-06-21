from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.request import Request
from app.schemas.request import RequestCreate, RequestResponse, RequestStatusUpdate, RequestVerifyOTP
from app.middleware.auth import get_current_user
from app.services import request_service
from app.config.constants import RequestStatus

router = APIRouter(prefix="/requests", tags=["requests"])

def serialize_request(request: Request, current_user_id: int) -> RequestResponse:
    """
    Validates and maps Request model to schema, clearing the OTP code if the requester is not the owner.
    """
    res = RequestResponse.model_validate(request)
    if request.owner_id != current_user_id:
        res.otp_code = None
    return res

@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_delivery_request(
    payload: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new delivery request. Verifies payment signature and generates an OTP hash.
    """
    # Enforce profile completion
    if not (current_user.full_name and current_user.registration_number and current_user.hostel and current_user.room_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete your profile (name, reg number, hostel, room) before creating delivery requests."
        )
        
    db_request = request_service.create_request(
        db=db,
        owner_id=current_user.id,
        courier_company=payload.courier_company,
        tracking_number=payload.tracking_number,
        pickup_location=payload.pickup_location,
        hostel=payload.hostel,
        room_number=payload.room_number,
        order_type=payload.order_type,
        reward_offered=payload.reward_offered,
        notes=payload.notes,
        cod_amount=payload.cod_amount,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )
    return serialize_request(db_request, current_user.id)

@router.get("", response_model=List[RequestResponse])
def list_open_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all available OPEN requests created by other students.
    """
    requests = db.query(Request).filter(
        Request.status == RequestStatus.OPEN,
        Request.owner_id != current_user.id
    ).all()
    return [serialize_request(r, current_user.id) for r in requests]

@router.get("/my", response_model=List[RequestResponse])
def list_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all requests created by the current user (as Owner).
    """
    requests = db.query(Request).filter(Request.owner_id == current_user.id).all()
    return [serialize_request(r, current_user.id) for r in requests]

@router.get("/runs", response_model=List[RequestResponse])
def list_my_runs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all requests accepted by the current user (as Runner).
    """
    requests = db.query(Request).filter(Request.runner_id == current_user.id).all()
    return [serialize_request(r, current_user.id) for r in requests]

@router.get("/{id}", response_model=RequestResponse)
def get_request_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full details of a specific request.
    """
    request = db.query(Request).filter(Request.id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found.")
    return serialize_request(request, current_user.id)

@router.post("/{id}/accept", response_model=RequestResponse)
def accept_request(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept an open request as a runner.
    """
    # Enforce profile completion
    if not (current_user.full_name and current_user.registration_number and current_user.hostel and current_user.room_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete your profile before accepting runs."
        )
        
    db_request = request_service.accept_request(db, id, current_user.id)
    return serialize_request(db_request, current_user.id)

@router.put("/{id}/status", response_model=RequestResponse)
def update_status(
    id: int,
    payload: RequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows runner to transition states: ACCEPTED -> PICKED_UP -> OUT_FOR_DELIVERY -> OTP_VERIFICATION.
    """
    db_request = request_service.update_request_status(db, id, payload.status, current_user.id)
    return serialize_request(db_request, current_user.id)

@router.post("/{id}/verify", response_model=RequestResponse)
def verify_otp_complete(
    id: int,
    payload: RequestVerifyOTP,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enables runner to submit the owner's OTP to complete the request.
    """
    db_request = request_service.verify_delivery_otp(db, id, payload.otp_code, current_user.id)
    return serialize_request(db_request, current_user.id)

@router.post("/{id}/cancel", response_model=RequestResponse)
def cancel_request(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows owner to cancel a request. Only valid in OPEN status.
    """
    db_request = request_service.cancel_request(db, id, current_user.id)
    return serialize_request(db_request, current_user.id)

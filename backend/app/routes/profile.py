from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PublicUserResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch the profile of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)

@router.put("", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details. Required on first-time login to make the profile active.
    """
    # Check registration number uniqueness if it is changing
    if payload.registration_number != current_user.registration_number:
        exists = db.query(User).filter(
            User.registration_number == payload.registration_number,
            User.id != current_user.id
        ).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration number is already registered by another student."
            )
            
    # Apply updates
    current_user.full_name = payload.full_name.strip()
    current_user.registration_number = payload.registration_number.strip()
    current_user.hostel = payload.hostel.strip()
    current_user.room_number = payload.room_number.strip()
    if payload.profile_photo:
        current_user.profile_photo = payload.profile_photo
        
    # Auto-verify on completion for developer simplicity
    current_user.is_verified = True
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)

@router.get("/{user_id}", response_model=PublicUserResponse)
def get_public_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch public metrics of another student to check their reputation before accepting runs.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    return PublicUserResponse.model_validate(user)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.middleware.auth import get_current_user
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_delivery_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a review for a completed request. Recalculates user ratings and success rates.
    """
    review = review_service.submit_review(
        db=db,
        request_id=payload.request_id,
        reviewer_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment
    )
    return ReviewResponse.model_validate(review)

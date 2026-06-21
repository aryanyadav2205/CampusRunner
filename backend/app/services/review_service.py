from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.review import Review
from app.models.request import Request
from app.config.constants import RequestStatus, ReviewRole
from app.services.reputation_service import update_user_reputation

def submit_review(db: Session, request_id: int, reviewer_id: int, rating: int, comment: str = None) -> Review:
    """
    Submits a review from either the owner rating the runner or the runner rating the owner.
    """
    # 1. Validate rating limits
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be an integer between 1 and 5."
        )

    # 2. Fetch Request
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    if request.status != RequestStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be submitted for completed deliveries."
        )

    # 3. Determine who is reviewer and who is reviewee
    if reviewer_id == request.owner_id:
        reviewee_id = request.runner_id
        role = ReviewRole.RUNNER  # Owner is rating the Runner
    elif reviewer_id == request.runner_id:
        reviewee_id = request.owner_id
        role = ReviewRole.OWNER   # Runner is rating the Owner
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to review this request."
        )

    # 4. Prevent duplicate reviews
    existing_review = db.query(Review).filter(
        Review.request_id == request_id,
        Review.reviewer_id == reviewer_id
    ).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this transaction."
        )

    # 5. Insert review
    db_review = Review(
        request_id=request_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id,
        role=role,
        rating=rating,
        comment=comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # 6. Recalculate and update reputation metrics for the rated user
    update_user_reputation(db, reviewee_id)

    return db_review

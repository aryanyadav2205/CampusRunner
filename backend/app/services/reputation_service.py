from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.request import Request
from app.models.review import Review
from app.config.constants import RequestStatus, ReviewRole

def update_user_reputation(db: Session, user_id: int):
    """
    Recalculates and updates the reputation stats for a user:
    - average rating as owner
    - average rating as runner
    - success rate as owner
    - success rate as runner
    - total completed deliveries
    - total completed receipts
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    # 1. Total Completed deliveries (runner) and receipts (owner)
    completed_runs = db.query(Request).filter(
        Request.runner_id == user_id,
        Request.status == RequestStatus.COMPLETED
    ).count()

    completed_receipts = db.query(Request).filter(
        Request.owner_id == user_id,
        Request.status == RequestStatus.COMPLETED
    ).count()

    user.completed_deliveries = completed_runs
    user.completed_receipts = completed_receipts

    # 2. Average Ratings
    # Rating as a Runner (reviews given by owners to this user as runner)
    avg_runner_rating = db.query(func.avg(Review.rating)).filter(
        Review.reviewee_id == user_id,
        Review.role == ReviewRole.RUNNER
    ).scalar()
    
    # Rating as an Owner (reviews given by runners to this user as owner)
    avg_owner_rating = db.query(func.avg(Review.rating)).filter(
        Review.reviewee_id == user_id,
        Review.role == ReviewRole.OWNER
    ).scalar()

    user.rating_runner = round(float(avg_runner_rating), 2) if avg_runner_rating is not None else 5.0
    user.rating_owner = round(float(avg_owner_rating), 2) if avg_owner_rating is not None else 5.0

    # 3. Success Rates
    # Runner Success Rate = Completed Runs / (Completed Runs + Cancelled Runs where runner accepted)
    cancelled_runs = db.query(Request).filter(
        Request.runner_id == user_id,
        Request.status == RequestStatus.CANCELLED
    ).count()
    
    total_runner_finalized = completed_runs + cancelled_runs
    if total_runner_finalized > 0:
        user.success_rate_runner = round((completed_runs / total_runner_finalized) * 100.0, 2)
    else:
        user.success_rate_runner = 100.0

    # Owner Success Rate = Completed Receipts / (Completed Receipts + Cancelled Requests where a runner was assigned)
    cancelled_receipts_with_runner = db.query(Request).filter(
        Request.owner_id == user_id,
        Request.runner_id.isnot(None),
        Request.status == RequestStatus.CANCELLED
    ).count()
    
    total_owner_finalized = completed_receipts + cancelled_receipts_with_runner
    if total_owner_finalized > 0:
        user.success_rate_owner = round((completed_receipts / total_owner_finalized) * 100.0, 2)
    else:
        user.success_rate_owner = 100.0

    db.commit()

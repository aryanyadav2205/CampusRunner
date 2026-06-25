from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.user import User
from app.models.request import Request
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse
from app.middleware.auth import get_current_user

router = APIRouter(tags=["Messages"])

def check_access(request: Request, user: User):
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.owner_id != user.id and request.runner_id != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")

@router.get("/requests/{request_id}/messages", response_model=List[MessageResponse])
def get_messages(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(Request).filter(Request.id == request_id).first()
    check_access(request, current_user)
    
    messages = db.query(Message).filter(Message.request_id == request_id).order_by(Message.created_at.asc()).all()
    
    # Attach sender info
    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        role = "admin" if sender.is_admin else ("owner" if sender.id == request.owner_id else "runner")
        
        msg_dict = msg.__dict__.copy()
        msg_dict["sender_name"] = sender.full_name if sender else "Unknown"
        msg_dict["sender_role"] = role
        result.append(msg_dict)
        
    return result

@router.post("/requests/{request_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    request_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(Request).filter(Request.id == request_id).first()
    check_access(request, current_user)
    
    # Determine role
    role = "admin" if current_user.is_admin else ("owner" if current_user.id == request.owner_id else "runner")
    
    new_message = Message(
        request_id=request_id,
        sender_id=current_user.id,
        text=payload.text
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    msg_dict = new_message.__dict__.copy()
    msg_dict["sender_name"] = current_user.full_name
    msg_dict["sender_role"] = role
    
    return msg_dict

@router.get("/messages/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all requests where the user is involved and has messages or is active."""
    # Find requests where user is owner or runner
    requests = db.query(Request).filter(
        ((Request.owner_id == current_user.id) | (Request.runner_id == current_user.id))
        & (Request.status != "CANCELLED")
    ).order_by(Request.created_at.desc()).all()
    
    conversations = []
    for req in requests:
        # Get last message
        last_msg = db.query(Message).filter(Message.request_id == req.id).order_by(Message.created_at.desc()).first()
        
        other_user = req.runner if req.owner_id == current_user.id else req.owner
        
        conversations.append({
            "request_id": req.id,
            "title": f"Parcel #{req.id} - {req.courier_company}",
            "other_person": other_user.full_name if other_user else "Waiting for runner...",
            "last_message": last_msg.text if last_msg else "No messages yet",
            "time": last_msg.created_at if last_msg else req.created_at,
            "status": req.status,
            "is_runner": req.runner_id == current_user.id
        })
        
    return conversations

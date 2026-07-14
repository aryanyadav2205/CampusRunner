from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.database.connection import get_db
from app.models.user import User
from app.models.support_ticket import SupportTicket
from app.schemas.support_ticket import SupportTicketCreate, SupportTicketResponse, SupportTicketUpdate, SupportTicketReply
from app.middleware.auth import get_current_user
from app.config.settings import settings

router = APIRouter(prefix="/support", tags=["Support"])

@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    payload: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a support ticket, saves it to the DB, and sends an email to the admin.
    """
    # 1. Save to Database
    new_ticket = SupportTicket(
        user_id=current_user.id,
        subject=payload.subject,
        message=payload.message,
        status="OPEN"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # 2. Send Email
    admin_email = os.getenv("ADMIN_EMAIL", "campusrunner4@gmail.com")
    sender = settings.EMAIL_SENDER
    password = settings.EMAIL_APP_PASSWORD

    if not sender or not password:
        print("\n" + "=" * 50)
        print(f"⚠ SUPPORT TICKET #{new_ticket.id}: {payload.subject}")
        print(f"FROM        : {current_user.email} ({current_user.full_name})")
        print(f"MESSAGE     : {payload.message}")
        print("=" * 50 + "\n")
    else:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Support Ticket #{new_ticket.id}: {payload.subject}"
        msg["From"] = f"Campus Runner Support <{sender}>"
        msg["To"] = admin_email
        msg["Reply-To"] = current_user.email

        text_body = f"""
New Support Ticket #{new_ticket.id} from Campus Runner

From: {current_user.full_name} ({current_user.email})
Phone: {current_user.phone_number}

Subject: {payload.subject}

Message:
{payload.message}
"""
        msg.attach(MIMEText(text_body, "plain"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(sender, password)
                server.sendmail(sender, admin_email, msg.as_string())
        except Exception as e:
            print(f"Failed to send email for ticket #{new_ticket.id}: {str(e)}")

    return new_ticket

@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all support tickets for the current user.
    """
    tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).all()
    
    return tickets

@router.patch("/tickets/{ticket_id}", response_model=SupportTicketResponse)
def update_ticket_status(
    ticket_id: int,
    payload: SupportTicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the status of a ticket (e.g. mark as CLOSED).
    """
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to modify this ticket")
        
    if not current_user.is_admin:
        if payload.status == "CLOSED":
            raise HTTPException(status_code=403, detail="Users cannot resolve tickets. They can only withdraw them.")
        if payload.status != "WITHDRAWN":
            raise HTTPException(status_code=400, detail="Invalid status update for user.")
        
    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    
    return ticket

@router.patch("/tickets/{ticket_id}/reply", response_model=SupportTicketResponse)
def admin_reply_ticket(
    ticket_id: int,
    payload: SupportTicketReply,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows an admin to reply to a ticket.
    Updates the admin_reply field and closes the ticket.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can reply to tickets.")
        
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket.admin_reply = payload.reply_message
    ticket.status = "CLOSED"
    db.commit()
    db.refresh(ticket)
    
    # Send email notification to user
    user = ticket.user
    if user and user.email:
        sender = settings.EMAIL_SENDER
        password = settings.EMAIL_APP_PASSWORD
        
        if sender and password:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Re: Support Ticket #{ticket.id} - {ticket.subject}"
            msg["From"] = f"Campus Runner Support <{sender}>"
            msg["To"] = user.email
            
            text_body = f"""
Your support ticket #{ticket.id} has been answered by our team.

Your Issue:
{ticket.message}

Admin Reply:
{payload.reply_message}

Thank you for using Campus Runner!
"""
            msg.attach(MIMEText(text_body, "plain"))
            try:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(sender, password)
                    server.sendmail(sender, user.email, msg.as_string())
            except Exception as e:
                print(f"Failed to send reply email for ticket #{ticket.id}: {str(e)}")
                
    return ticket

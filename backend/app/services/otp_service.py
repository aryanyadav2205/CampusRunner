from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.models.admin import OTPLog
from app.utils.helpers import generate_numeric_otp
from app.config.settings import settings


def _send_email(to_email: str, otp_code: str):
    """
    Send the OTP code to the user's email via Gmail SMTP.
    """
    sender = settings.EMAIL_SENDER
    password = settings.EMAIL_APP_PASSWORD

    if not sender or not password:
        # Fallback: print to console if email is not configured
        print("\n" + "=" * 50)
        print(f"⚠ EMAIL NOT CONFIGURED — Printing OTP to console")
        print(f"EMAIL       : {to_email}")
        print(f"OTP CODE    : {otp_code}")
        print("=" * 50 + "\n")
        return

    # Build email message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Campus Runner — Your OTP Code: {otp_code}"
    msg["From"] = f"Campus Runner <{sender}>"
    msg["To"] = to_email

    # Plain text fallback
    text_body = f"""
Campus Runner — OTP Verification

Your one-time verification code is: {otp_code}

This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
Do not share this code with anyone.

— Campus Runner Team
"""

    # Styled HTML email
    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                🏃 Campus Runner
            </h1>
            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                OTP Verification Code
            </p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
                Use the code below to verify your identity:
            </p>
            <div style="background: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; display: inline-block; min-width: 160px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #e2e8f0; font-family: 'Courier New', monospace;">
                    {otp_code}
                </span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 24px 0 0 0;">
                This code expires in <strong style="color: #f59e0b;">{settings.OTP_EXPIRE_MINUTES} minutes</strong>.
            </p>
            <p style="color: #475569; font-size: 12px; margin: 16px 0 0 0;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>
        <div style="background: #0b1120; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="margin: 0; color: #475569; font-size: 11px;">
                Campus Runner — Peer-to-Peer Campus Delivery
            </p>
        </div>
    </div>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    # Send via Gmail SMTP (with timeout to prevent thread hanging)
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, to_email, msg.as_string())

    print(f"[OTP] Email sent to {to_email}")


def send_otp(db: Session, email: str, phone_number: str) -> str:
    """
    Generate OTP, send it to the user's email, and log it to the database.
    """
    otp_code = generate_numeric_otp(4)

    # Send OTP via email
    _send_email(email, otp_code)

    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    otp_log = OTPLog(
        email=email,
        phone_number=phone_number,
        otp_code=otp_code,
        is_verified=False,
        expires_at=expires_at
    )

    db.add(otp_log)
    db.commit()
    db.refresh(otp_log)

    return otp_code


def verify_otp(db: Session, email: str, otp_code: str) -> bool:
    """
    Verify the submitted OTP code by email. Returns True if valid, else False.
    """
    now = datetime.utcnow()
    log = db.query(OTPLog).filter(
        OTPLog.email == email,
        OTPLog.otp_code == otp_code,
        OTPLog.is_verified == False,
        OTPLog.expires_at > now
    ).order_by(OTPLog.created_at.desc()).first()

    if log:
        log.is_verified = True
        db.commit()
        return True

    return False

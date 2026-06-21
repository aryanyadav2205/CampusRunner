import os
from dotenv import load_dotenv

# Load env variables from .env if present
load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campus_runner.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretjwtsecretkeychangeinproduction")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Razorpay configurations (Defaults to test mock keys)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mockkeyid")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mocksecretkeyvalue")
    
    OTP_EXPIRE_MINUTES: int = 5
    
    # Email SMTP configuration (Gmail)
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "")
    EMAIL_APP_PASSWORD: str = os.getenv("EMAIL_APP_PASSWORD", "")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))

settings = Settings()

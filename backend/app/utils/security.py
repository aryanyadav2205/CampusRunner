import hashlib

def hash_otp(otp_code: str) -> str:
    """
    Hash a 4-digit OTP code using SHA-256.
    """
    return hashlib.sha256(otp_code.encode()).hexdigest()

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """
    Verify if a plain OTP matches the stored SHA-256 hash.
    """
    return hash_otp(plain_otp) == hashed_otp

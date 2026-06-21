import random
import string

def generate_numeric_otp(length: int = 4) -> str:
    """
    Generate a random numeric string of specified length.
    """
    return "".join(random.choices(string.digits, k=length))

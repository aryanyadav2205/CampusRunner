import time
from fastapi import Request, HTTPException, status

class RateLimiter:
    """
    A simple in-memory IP-based rate limiter dependency.
    """
    def __init__(self, limit: int = 100, window_seconds: int = 60):
        self.limit = limit
        self.window = window_seconds
        self.history = {}  # Map client IP -> list of timestamps

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Initialize IP history if not present
        if client_ip not in self.history:
            self.history[client_ip] = []

        # Filter out timestamps older than the sliding window
        self.history[client_ip] = [t for t in self.history[client_ip] if now - t < self.window]

        # Check threshold
        if len(self.history[client_ip]) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )

        # Record this request timestamp
        self.history[client_ip].append(now)

# Instantiate a default rate limiter (e.g. 100 requests per minute)
default_rate_limiter = RateLimiter(limit=120, window_seconds=60)

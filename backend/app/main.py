from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them for metadata creation
from app.models.user import User
from app.models.request import Request
from app.models.payment import Payment
from app.models.review import Review
from app.models.admin import AdminLog, OTPLog

# Import routers
from app.routes import auth, profile, requests, payments, reviews, admin
from app.middleware.rate_limit import default_rate_limiter

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus Runner API",
    description="Backend API for Campus Runner peer-to-peer delivery platform",
    version="1.0"
)

# Apply CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Apply rate limiter globally to all endpoints
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.middleware("http")
async def rate_limiting_middleware(request, call_next):
    try:
        default_rate_limiter(request)
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception:
        # Let other unhandled exceptions pass through to FastAPI's standard handler
        pass
    return await call_next(request)

# Include Routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(requests.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Campus Runner API. Visit /docs for documentation."}

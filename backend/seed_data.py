from app.database.connection import SessionLocal
from app.models.user import User
from app.models.request import Request
from passlib.context import CryptContext

# Create a database session
db = SessionLocal()

try:
    print("Seeding database...")
    
    # Check if a demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@example.com").first()
    
    if not demo_user:
        # Create a new Demo User
        demo_user = User(
            phone_number="+1234567890",
            email="demo@example.com",
            full_name="Demo User",
            registration_number="DEMO123",
            hostel="Block A",
            room_number="101",
            is_verified=True,
            wallet_balance=500.0
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created Demo User with ID: {demo_user.id}")
    else:
        print(f"Demo User already exists with ID: {demo_user.id}")

    # Check if a demo request already exists
    demo_request = db.query(Request).filter(Request.owner_id == demo_user.id).first()
    
    if not demo_request:
        # Create a new Demo Request
        demo_request = Request(
            owner_id=demo_user.id,
            courier_company="Amazon",
            tracking_number="AMZ123456789",
            pickup_location="Main Gate",
            hostel="Block A",
            room_number="101",
            order_type="PREPAID",
            reward_offered=50.0,
            platform_fee=10.0,
            total_amount=60.0,
            notes="Please handle with care. Call when near the hostel.",
            otp_hash="dummy_hash_for_demo",
            otp_code="123456"
        )
        db.add(demo_request)
        db.commit()
        db.refresh(demo_request)
        print(f"Created Demo Request with ID: {demo_request.id}")
    else:
        print(f"Demo Request already exists with ID: {demo_request.id}")

    print("Database seeding completed successfully!")

except Exception as e:
    print(f"An error occurred: {e}")
    db.rollback()
finally:
    db.close()

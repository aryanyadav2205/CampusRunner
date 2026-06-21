import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_campus_runner.db"
os.environ["SECRET_KEY"] = "testsecretkeyfortestingpurposesonly"

from app.main import app
from app.database.connection import get_db
from app.database.base import Base
from app.models.user import User
from app.models.request import Request
from app.models.payment import Payment
from app.config.constants import RequestStatus

# Setup test database engine
TEST_DATABASE_URL = "sqlite:///./test_campus_runner.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables & delete test db file
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test_campus_runner.db"):
        os.remove("test_campus_runner.db")

client = TestClient(app)

def test_full_application_lifecycle():
    # 1. OTP Send
    response = client.post("/api/auth/otp/send", json={"phone_number": "+919876543210"})
    assert response.status_code == 200
    assert "OTP sent successfully" in response.json()["message"]

    # Since it logs OTP, let's query the database to find the generated OTP code for test verification
    db = TestingSessionLocal()
    from app.models.admin import OTPLog
    otp_log = db.query(OTPLog).filter(OTPLog.phone_number == "+919876543210").order_by(OTPLog.created_at.desc()).first()
    assert otp_log is not None
    otp_code = otp_log.otp_code

    # 2. OTP Verify (Logs in Owner)
    response = client.post("/api/auth/otp/verify", json={"phone_number": "+919876543210", "otp_code": otp_code})
    assert response.status_code == 200
    owner_token = response.json()["token"]
    owner_user = response.json()["user"]
    assert owner_token is not None
    assert owner_user["phone_number"] == "+919876543210"

    # Set up headers for Owner
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # 3. Update Profile for Owner
    response = client.put("/api/profile", json={
        "full_name": "Alice Owner",
        "registration_number": "REG-OWN-001",
        "hostel": "Raman Hostel",
        "room_number": "A-101"
    }, headers=owner_headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Alice Owner"
    assert response.json()["is_profile_complete"] is True

    # 4. Set up second user (Runner)
    client.post("/api/auth/otp/send", json={"phone_number": "+919876543211"})
    runner_otp_log = db.query(OTPLog).filter(OTPLog.phone_number == "+919876543211").order_by(OTPLog.created_at.desc()).first()
    response = client.post("/api/auth/otp/verify", json={"phone_number": "+919876543211", "otp_code": runner_otp_log.otp_code})
    runner_token = response.json()["token"]
    runner_headers = {"Authorization": f"Bearer {runner_token}"}

    # Complete Runner Profile
    response = client.put("/api/profile", json={
        "full_name": "Bob Runner",
        "registration_number": "REG-RUN-002",
        "hostel": "Bhabha Hostel",
        "room_number": "B-202"
    }, headers=runner_headers)
    assert response.status_code == 200

    # 5. Create Payment Order (Razorpay Order creation test)
    response = client.post("/api/payments/create-order", json={
        "reward_offered": 50.0,
        "order_type": "PREPAID"
      }, headers=owner_headers)
    assert response.status_code == 200
    pay_order = response.json()
    assert pay_order["razorpay_order_id"].startswith("order_mock_")
    assert pay_order["platform_fee"] == 5.0
    assert pay_order["total_amount"] == 55.0

    # 6. Create Request
    response = client.post("/api/requests", json={
        "courier_company": "DTDC",
        "tracking_number": "TRACK98231",
        "pickup_location": "Central Hub",
        "hostel": "Raman Hostel",
        "room_number": "A-101",
        "order_type": "PREPAID",
        "reward_offered": 50.0,
        "razorpay_order_id": pay_order["razorpay_order_id"],
        "razorpay_payment_id": "pay_mock_123",
        "razorpay_signature": "sig_mock_123"
    }, headers=owner_headers)
    assert response.status_code == 201
    request_data = response.json()
    request_id = request_data["id"]
    assert request_data["status"] == "OPEN"
    assert request_data["otp_code"] is not None  # Owner gets plain text code on creation

    # 7. Runner lists open requests
    response = client.get("/api/requests", headers=runner_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == request_id
    assert response.json()[0]["otp_code"] is None  # Runner CANNOT see OTP code!

    # 8. Runner accepts request
    response = client.post(f"/api/requests/{request_id}/accept", headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "ACCEPTED"
    assert response.json()["runner_id"] is not None

    # 9. Runner progresses status: ACCEPTED -> PICKED_UP -> OUT_FOR_DELIVERY -> OTP_VERIFICATION
    response = client.put(f"/api/requests/{request_id}/status", json={"status": "PICKED_UP"}, headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "PICKED_UP"

    response = client.put(f"/api/requests/{request_id}/status", json={"status": "OUT_FOR_DELIVERY"}, headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "OUT_FOR_DELIVERY"

    response = client.put(f"/api/requests/{request_id}/status", json={"status": "OTP_VERIFICATION"}, headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "OTP_VERIFICATION"

    # Get request details to retrieve plain OTP code as owner
    response = client.get(f"/api/requests/{request_id}", headers=owner_headers)
    assert response.status_code == 200
    owner_view_otp = response.json()["otp_code"]
    assert owner_view_otp is not None

    # Ensure runner details view hides OTP
    response = client.get(f"/api/requests/{request_id}", headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["otp_code"] is None

    # 10. Runner verifies OTP
    response = client.post(f"/api/requests/{request_id}/verify", json={"otp_code": owner_view_otp}, headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"

    # 11. Reviewing
    # Owner rates Runner
    response = client.post("/api/reviews", json={
        "request_id": request_id,
        "rating": 5,
        "comment": "Super quick delivery!"
    }, headers=owner_headers)
    assert response.status_code == 201

    # Check Runner reputation updated
    response = client.get("/api/profile", headers=runner_headers)
    assert response.status_code == 200
    assert response.json()["rating_runner"] == 5.0
    assert response.json()["completed_deliveries"] == 1

    db.close()

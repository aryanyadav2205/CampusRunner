# System Workflow - Campus Runner V1.0

This document maps out the system workflows, authentication sequences, delivery lifecycles, and rating loops.

---

## 1. Authentication Flow
```mermaid
sequenceDiagram
    actor Student
    participant Frontend
    participant Backend
    participant DB

    Student->>Frontend: Enter Mobile Number
    Frontend->>Backend: POST /auth/otp/send {phone_number}
    Backend->>DB: Log OTP and Expiration
    Backend-->>Frontend: Success (OTP printed in terminal console)
    Student->>Frontend: Enter Received OTP
    Frontend->>Backend: POST /auth/otp/verify {phone_number, otp_code}
    Backend->>DB: Validate OTP (active, not expired, correct)
    DB-->>Backend: Valid
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: Return JWT token + User Info
    alt Profile Incomplete
        Frontend->>Student: Show Profile Completion Screen
        Student->>Frontend: Enter Name, Registration Number, Hostel, Room Number
        Frontend->>Backend: PUT /profile {profile fields}
        Backend->>DB: Save User Data
        Backend-->>Frontend: Profile Completed
    end
    Frontend->>Student: Redirect to Dashboard
```

---

## 2. Request Lifecycle State Diagram
A delivery request moves through these states:
```mermaid
stateDiagram-v2
    [*] --> OPEN : Paid & Created
    OPEN --> ACCEPTED : Accepted by Runner
    OPEN --> CANCELLED : Cancelled by Owner (Refund triggers)
    ACCEPTED --> PICKED_UP : Runner picks up parcel
    PICKED_UP --> OUT_FOR_DELIVERY : Runner on the way
    OUT_FOR_DELIVERY --> OTP_VERIFICATION : Runner arrives, asks for OTP
    OTP_VERIFICATION --> COMPLETED : Correct OTP Entered (Payout triggers)
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## 3. Delivery Creation and Payment Flow
```mermaid
sequenceDiagram
    actor Owner
    participant Frontend
    participant Razorpay
    participant Backend
    participant DB

    Owner->>Frontend: Fill request form (prepaid/COD, reward)
    Frontend->>Backend: POST /payments/create-order {reward, cod_amount, order_type}
    Backend->>Backend: Calculate total (10% platform fee, COD cost)
    Backend-->>Frontend: Razorpay order details (total in paise)
    Frontend->>Razorpay: Open Razorpay checkout modal
    Owner->>Razorpay: Confirm Payment (Simulation)
    Razorpay-->>Frontend: payment_id, order_id, signature
    Frontend->>Backend: POST /requests {form details + payment verification}
    Backend->>Backend: Verify Razorpay signature
    Backend->>DB: Insert Request (status=OPEN, hashed_otp)
    Backend-->>Frontend: Success (returns plain OTP code for owner)
```

---

## 4. Completion and Reputation Updates
```mermaid
sequenceDiagram
    actor Runner
    actor Owner
    participant Frontend
    participant Backend
    participant DB

    Runner->>Frontend: Enter OTP code from Owner
    Frontend->>Backend: POST /requests/{id}/verify {otp_code}
    Backend->>DB: Check matches otp_hash
    DB-->>Backend: OTP matches
    Backend->>DB: Update status to COMPLETED
    Backend->>DB: Trigger Runner Payment Settlement
    Backend-->>Frontend: Complete Response

    par Owner rates Runner
        Owner->>Frontend: Submit review (1-5 stars, comment)
        Frontend->>Backend: POST /reviews {request_id, rating, comment}
        Backend->>DB: Save review
        Backend->>Backend: Recalculate runner average rating and success rate
        Backend->>DB: Update user stats
    and Runner rates Owner
        Runner->>Frontend: Submit review (1-5 stars, comment)
        Frontend->>Backend: POST /reviews {request_id, rating, comment}
        Backend->>DB: Save review
        Backend->>Backend: Recalculate owner average rating and success rate
        Backend->>DB: Update user stats
    end
```

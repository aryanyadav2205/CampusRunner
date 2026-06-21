# Product Requirements Document (PRD) - Campus Runner V1.0

## 1. Introduction & Background
Campus Runner is a peer-to-peer parcel delivery network for college campuses. Students frequently receive parcels at central delivery centers but face difficulty picking them up due to class schedules or distance. Meanwhile, other students visit these centers regularly. Campus Runner leverages this by allowing students to earn money by retrieving and delivering parcels for their peers.

---

## 2. Core Objectives
- **Convenience**: Allow busy students to delegate parcel retrieval.
- **Earning Potential**: Enable active students (runners) to earn income on their regular campus routes.
- **Trust & Security**: Implement OTP verification and reviews to establish a secure network.
- **COD & Prepaid Support**: Support both prepaid collections and cash-on-delivery (COD) parcels.
- **Fair Fees**: Charge transparent platform fees to sustain operations.

---

## 3. User Personas & Roles
There is only one unified account type: **Student User**.
A single user can act as:
1. **Parcel Owner**: Posts requests, pays delivery reward + platform fee (+ COD amount if COD), and receives the parcel.
2. **Runner**: Browses open requests, accepts requests, retrieves parcels, delivers them, and receives the delivery reward.

---

## 4. Feature Specifications

### 4.1 Authentication
- **Method**: Mobile Number + One-Time Password (OTP).
- **Flow**: User enters their mobile number -> Backend sends/logs OTP -> User enters OTP -> Successful verification creates session/JWT -> Redirect to dashboard.
- **Profile Completion**: Upon first-time login, users must complete their profile before using the platform (Full Name, Registration Number, Phone Number, Hostel, Room Number, and optional Profile Photo).

### 4.2 Request Creation & Platform Fees
Parcel Owners can create requests with the following fields:
- Courier Company (e.g., DTDC, BlueDart, Amazon)
- Tracking Number
- Pickup Location (Campus Hub, North Gate, etc.)
- Hostel & Room Number (Delivery destination)
- Order Type: Prepaid or COD
- COD Amount (Required if COD)
- Reward Offered (Min: ₹20, Max: ₹100)
- Notes (Optional)

**Fee Structures**:
- **Prepaid Requests**:
  - `Platform Fee = 10% of Reward`
  - *Example*: Reward = ₹50, Platform Fee = ₹5. Total Paid by Owner = ₹55.
- **COD Requests**:
  - `Platform Fee = 10% of Reward + ₹10`
  - *Example*: COD Amount = ₹700, Reward = ₹50. Platform Fee = ₹15 (₹5 + ₹10). Total Paid by Owner = ₹765 (COD ₹700 + Reward ₹50 + Platform Fee ₹15).

### 4.3 Payments
- **Integration**: Razorpay Sandbox.
- **Constraint**: Requests are created on the server and set to `OPEN` status only after a successful payment verification callback/signature check.

### 4.4 Request Lifecycle
The request progresses through the following states:
1. **OPEN**: Request created and paid, waiting for a runner.
2. **ACCEPTED**: A runner accepts the request.
3. **PICKED_UP**: Runner retrieves the parcel from the center and updates status.
4. **OUT_FOR_DELIVERY**: Runner is on the way to the owner's hostel.
5. **OTP_VERIFICATION**: Runner arrives; waiting for owner to share OTP.
6. **COMPLETED**: Runner enters the correct OTP, completing the delivery.
7. **CANCELLED**: Owner cancels the request (only valid if state is `OPEN`).

### 4.5 OTP Verification
- A secure 4-digit OTP is generated on request creation.
- The hash of the OTP is stored in the database.
- Upon arrival, the owner gives the OTP to the runner. The runner inputs it; a correct match completes the request and initiates runner payout.

### 4.6 Reputation & Rating System
- Upon completion of a request:
  - Owner rates Runner (1-5 Stars, comment).
  - Runner rates Owner (1-5 Stars, comment).
- Each user profile shows dynamic metrics:
  - **Owner Rating**: Average star rating received as an owner.
  - **Runner Rating**: Average star rating received as a runner.
  - **Owner Success Rate**: Percentage of created requests that were completed (not cancelled or disputed).
  - **Runner Success Rate**: Percentage of accepted requests that were successfully completed.
  - **Completed Deliveries**: Total count of completed deliveries as a runner.

### 4.7 Admin Dashboard
Administrators can:
- View all users and edit/suspend accounts.
- View all requests, transition statuses in disputes, and audit transactions.
- Monitor total revenue, platform fees, and pending settlements.

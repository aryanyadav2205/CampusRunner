# API Documentation - Campus Runner V1.0

This document describes the REST API endpoints provided by the Campus Runner backend. The default API prefix is `/api`.

---

## 1. Authentication Endpoints

### 1.1 Send OTP
Request a 4-digit OTP code to login/signup.
* **URL**: `/auth/otp/send`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "phone_number": "+919876543210"
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "OTP sent successfully. Check console logs.",
    "phone_number": "+919876543210"
  }
  ```

### 1.2 Verify OTP
Verify the OTP code and receive a JWT authentication token.
* **URL**: `/auth/otp/verify`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "phone_number": "+919876543210",
    "otp_code": "1234"
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone_number": "+919876543210",
      "full_name": null,
      "registration_number": null,
      "hostel": null,
      "room_number": null,
      "is_profile_complete": false
    }
  }
  ```

---

## 2. Profile Endpoints

### 2.1 Get Current User Profile
Fetch details of the currently logged-in user.
* **URL**: `/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  {
    "id": 1,
    "phone_number": "+919876543210",
    "full_name": "John Doe",
    "registration_number": "REG12345",
    "hostel": "Raman Hostel",
    "room_number": "A-101",
    "profile_photo": null,
    "is_verified": true,
    "rating_owner": 4.8,
    "rating_runner": 4.9,
    "success_rate_owner": 95.0,
    "success_rate_runner": 100.0,
    "completed_deliveries": 12,
    "completed_receipts": 8
  }
  ```

### 2.2 Update Profile
Update profile fields (Required on first login to activate account).
* **URL**: `/profile`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "full_name": "John Doe",
    "registration_number": "REG12345",
    "hostel": "Raman Hostel",
    "room_number": "A-101",
    "profile_photo": null
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "Profile updated successfully.",
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "registration_number": "REG12345",
      "hostel": "Raman Hostel",
      "room_number": "A-101",
      "is_profile_complete": true
    }
  }
  ```

### 2.3 Get Public Profile
Fetch public reputation details of another user.
* **URL**: `/profile/{user_id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  {
    "id": 2,
    "full_name": "Jane Smith",
    "rating_owner": 4.5,
    "rating_runner": 4.8,
    "success_rate_owner": 100.0,
    "success_rate_runner": 96.0,
    "completed_deliveries": 24,
    "is_verified": true,
    "created_at": "2026-01-10T12:00:00"
  }
  ```

---

## 3. Payment Endpoints

### 3.1 Create Razorpay Order
Generates a valid order ID from Razorpay to initiate front-end checkout.
* **URL**: `/payments/create-order`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "reward_offered": 50.0,
    "order_type": "COD",
    "cod_amount": 700.0
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "razorpay_order_id": "order_Hj981hKjhas9",
    "amount": 76500, 
    "currency": "INR",
    "platform_fee": 15.0,
    "total_amount": 765.0
  }
  ```

---

## 4. Request Endpoints

### 4.1 Create Request
Create a parcel delivery request. Must verify the Razorpay payment payment/order signatures.
* **URL**: `/requests`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "courier_company": "DTDC",
    "tracking_number": "TRACK89231",
    "pickup_location": "North Gate Hub",
    "hostel": "Raman Hostel",
    "room_number": "A-101",
    "order_type": "COD",
    "cod_amount": 700.0,
    "reward_offered": 50.0,
    "notes": "Fragile items, deliver before 6 PM",
    "razorpay_order_id": "order_Hj981hKjhas9",
    "razorpay_payment_id": "pay_Hj9aJs8218",
    "razorpay_signature": "signature_hash_value"
  }
  ```
* **Response (Success - 201 Created)**:
  ```json
  {
    "id": 42,
    "status": "OPEN",
    "otp_code": "4892", 
    "message": "Request created successfully."
  }
  ```

### 4.2 List Open Requests
Fetch all open requests created by other students that are ready to be accepted.
* **URL**: `/requests`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  [
    {
      "id": 42,
      "owner": {
        "id": 2,
        "full_name": "Jane Smith",
        "rating_owner": 4.9
      },
      "courier_company": "Amazon",
      "pickup_location": "North Gate Hub",
      "hostel": "Bhabha Hostel",
      "order_type": "PREPAID",
      "reward_offered": 30.0,
      "created_at": "2026-06-18T12:00:00"
    }
  ]
  ```

### 4.3 Get Request Details
* **URL**: `/requests/{id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  {
    "id": 42,
    "owner_id": 2,
    "runner_id": 1,
    "courier_company": "Amazon",
    "tracking_number": "AMZN12345",
    "pickup_location": "North Gate Hub",
    "hostel": "Bhabha Hostel",
    "room_number": "B-302",
    "order_type": "PREPAID",
    "reward_offered": 30.0,
    "platform_fee": 3.0,
    "total_amount": 33.0,
    "notes": null,
    "status": "ACCEPTED",
    "created_at": "2026-06-18T12:00:00"
  }
  ```

### 4.4 Accept Request
* **URL**: `/requests/{id}/accept`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "Request accepted successfully. Head to the pickup location.",
    "status": "ACCEPTED"
  }
  ```

### 4.5 Update Status (Lifecycle Steps)
Update request status as the Runner performs the delivery.
* **URL**: `/requests/{id}/status`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "status": "PICKED_UP" 
  }
  ```
  *(Allowed transitions by runner: `PICKED_UP`, `OUT_FOR_DELIVERY`, `OTP_VERIFICATION`)*
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "Status updated successfully.",
    "status": "PICKED_UP"
  }
  ```

### 4.6 Verify OTP & Complete Request
Submit OTP provided by the owner to complete the transaction.
* **URL**: `/requests/{id}/verify`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "otp_code": "4892"
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "OTP verified successfully. Delivery completed.",
    "status": "COMPLETED"
  }
  ```

### 4.7 Cancel Request
Cancel an open request before it has been accepted by a runner.
* **URL**: `/requests/{id}/cancel`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "Request cancelled successfully. Payment will be refunded.",
    "status": "CANCELLED"
  }
  ```

---

## 5. Review Endpoints

### 5.1 Submit Review
Submit rating and feedback. Allowed only for completed requests.
* **URL**: `/reviews`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "request_id": 42,
    "rating": 5,
    "comment": "Excellent and fast delivery!"
  }
  ```
* **Response (Success - 201 Created)**:
  ```json
  {
    "message": "Review submitted successfully. Reputation score recalculated."
  }
  ```

---

## 6. Admin Endpoints

### 6.1 List Users
* **URL**: `/admin/users`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Response (Success - 200 OK)**:
  ```json
  [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone_number": "+919876543210",
      "is_suspended": false,
      "is_admin": false
    }
  ]
  ```

### 6.2 Toggle Suspend User
* **URL**: `/admin/users/{id}/suspend`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Request Body**:
  ```json
  {
    "suspend": true,
    "reason": "Repeated failed deliveries."
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "message": "User suspended successfully."
  }
  ```

### 6.3 Admin List Requests
* **URL**: `/admin/requests`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Response (Success - 200 OK)**: List of all requests in the system.

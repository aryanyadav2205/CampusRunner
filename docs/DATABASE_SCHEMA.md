# Database Schema - Campus Runner V1.0

This document describes the database tables and columns used in the Campus Runner platform. We use SQLite for local development.

---

## 1. Table: `users`
Stores user profile information, authentication status, reputation scores, and roles.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each user |
| `phone_number` | VARCHAR(15) | UNIQUE, NOT NULL | User's mobile number used for login |
| `full_name` | VARCHAR(100) | NULLABLE | Full name |
| `registration_number` | VARCHAR(50) | UNIQUE, NULLABLE | Student ID / Reg Number |
| `hostel` | VARCHAR(50) | NULLABLE | Hostel/Residence hall name |
| `room_number` | VARCHAR(20) | NULLABLE | Room number in hostel |
| `profile_photo` | VARCHAR(255) | NULLABLE | Path or URL to the avatar |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Whether registration details are validated |
| `is_suspended` | BOOLEAN | DEFAULT FALSE | Suspension flag by administrator |
| `is_admin` | BOOLEAN | DEFAULT FALSE | Flag specifying admin access rights |
| `rating_owner` | FLOAT | DEFAULT 5.0 | Average rating received as a parcel owner |
| `rating_runner` | FLOAT | DEFAULT 5.0 | Average rating received as a runner |
| `success_rate_owner` | FLOAT | DEFAULT 100.0 | Success rate % for owner requests |
| `success_rate_runner` | FLOAT | DEFAULT 100.0 | Success rate % for accepted runs |
| `completed_deliveries` | INTEGER | DEFAULT 0 | Count of successful runs |
| `completed_receipts` | INTEGER | DEFAULT 0 | Count of successful received packages |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 2. Table: `requests`
Stores parcel retrieval and delivery requests, tracking details, rewards, and execution status.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique request ID |
| `owner_id` | INTEGER | FOREIGN KEY (`users.id`), NOT NULL | User requesting delivery |
| `runner_id` | INTEGER | FOREIGN KEY (`users.id`), NULLABLE | User delivering the package |
| `courier_company` | VARCHAR(100) | NOT NULL | Courier company name |
| `tracking_number` | VARCHAR(100) | NOT NULL | Parcel tracking number |
| `pickup_location` | VARCHAR(100) | NOT NULL | Parcel pickup location |
| `hostel` | VARCHAR(50) | NOT NULL | Destination hostel |
| `room_number` | VARCHAR(20) | NOT NULL | Destination room number |
| `order_type` | VARCHAR(10) | NOT NULL | `PREPAID` or `COD` |
| `cod_amount` | FLOAT | DEFAULT 0.0 | Amount to pay center for COD |
| `reward_offered` | FLOAT | NOT NULL | Money offered to runner (₹20 - ₹100) |
| `platform_fee` | FLOAT | NOT NULL | Platform service fee |
| `total_amount` | FLOAT | NOT NULL | Combined amount paid at request creation |
| `notes` | TEXT | NULLABLE | Additional instruction details |
| `status` | VARCHAR(30) | DEFAULT 'OPEN' | `OPEN`, `ACCEPTED`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `OTP_VERIFICATION`, `COMPLETED`, `CANCELLED` |
| `otp_hash` | VARCHAR(64) | NOT NULL | Hashed 4-digit verification code |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time |

---

## 3. Table: `payments`
Tracks transaction status for request creation payments and runner payouts.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique payment transaction ID |
| `request_id` | INTEGER | FOREIGN KEY (`requests.id`), NOT NULL | Request linked to payment |
| `amount` | FLOAT | NOT NULL | Total amount paid |
| `platform_fee` | FLOAT | NOT NULL | Part of amount going to platform |
| `cod_amount` | FLOAT | DEFAULT 0.0 | Part of amount going to COD collection |
| `payment_id` | VARCHAR(100) | NULLABLE | Razorpay Order/Payment ID |
| `status` | VARCHAR(20) | DEFAULT 'PENDING' | `PENDING`, `PAID`, `REFUNDED` |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |

---

## 4. Table: `reviews`
Stores rating and comments submitted by users after a completed delivery.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique review ID |
| `request_id` | INTEGER | FOREIGN KEY (`requests.id`), NOT NULL | Linked delivery request |
| `reviewer_id` | INTEGER | FOREIGN KEY (`users.id`), NOT NULL | User giving rating |
| `reviewee_id` | INTEGER | FOREIGN KEY (`users.id`), NOT NULL | User being rated |
| `role` | VARCHAR(10) | NOT NULL | Role of the reviewee (`OWNER` or `RUNNER`) |
| `rating` | INTEGER | NOT NULL (1-5) | Number of stars |
| `comment` | TEXT | NULLABLE | Feedback text |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Review submission time |

---

## 5. Table: `otp_logs`
Logs sent OTPs for verification.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Log entry ID |
| `phone_number` | VARCHAR(15) | NOT NULL | Recipient mobile number |
| `otp_code` | VARCHAR(6) | NOT NULL | Plain OTP code (for development) |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Whether verification completed |
| `expires_at` | DATETIME | NOT NULL | OTP expiration timestamp |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Generation timestamp |

---

## 6. Table: `admin_logs`
Audit log of all actions taken by administrators.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Admin log ID |
| `admin_id` | INTEGER | FOREIGN KEY (`users.id`), NOT NULL | ID of administrator |
| `action` | VARCHAR(100) | NOT NULL | Action name (e.g. `USER_SUSPENSION`) |
| `details` | TEXT | NOT NULL | Contextual information / rationale |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

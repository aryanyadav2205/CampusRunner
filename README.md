<div align="center">
  <img src="frontend/public/hero-illustration.png" alt="Campus Runner Logo" width="300"/>
  <h1>🏃‍♂️ Campus Runner</h1>
  <p><strong>The fastest, most trusted peer-to-peer parcel delivery network for college campuses.</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation--setup">Installation</a> •
    <a href="#admin-access">Admin Access</a> •
    <a href="#documentation">Documentation</a>
  </p>
</div>

---

## 🌟 What is Campus Runner?
Campus Runner bridges the gap between busy students and active peers. It allows students to delegate parcel retrieval from campus gates or mailrooms to other active students ("runners"). Runners earn real money by picking up and delivering parcels along their regular campus routes, creating a fast, community-driven micro-logistics network.

## ✨ Key Features
* 🔄 **Dual Roles**: Every student account can seamlessly switch between acting as a **Parcel Owner** (requesting a delivery) and a **Runner** (accepting a delivery run).
* 💰 **Prepaid & COD Support**: Comprehensive support for handling both pre-paid packages and Cash-on-Delivery (COD) handoffs.
* 🛡️ **Secure OTP Deliveries**: Six-digit OTP verification ensures that high-value parcels are only handed over to the correct recipient.
* 💳 **Integrated Digital Wallet**: Runners earn payouts directly into their built-in CampusRunner wallet, with a fully functioning ledger system.
* 🏦 **UPI Payouts System**: Runners can request wallet withdrawals directly to their UPI IDs (GPay, PhonePe, Paytm).
* 💬 **In-App Messaging**: Real-time communication portal allowing Owners and Runners to chat seamlessly regarding their active deliveries.
* 🎛️ **Admin Control Center**: A dedicated, secure dashboard for platform administrators to monitor revenue, audit parcel logs, manage user suspensions, and process runner payouts.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework**: React.js with Vite for lightning-fast HMR and building.
* **Styling**: Pure CSS with a highly dynamic, variable-driven UI (Includes both a Dark "Green" theme and Light "Blue" theme).
* **Icons**: Lucide React.
* **Routing**: React Router DOM v6.

### Backend Architecture
* **Framework**: FastAPI (Python) for ultra-fast, async RESTful API endpoints.
* **Database**: SQLite for development (Easily scalable to PostgreSQL via SQLAlchemy ORM).
* **Authentication**: Stateless JWT (JSON Web Tokens) with email OTP verification.
* **Payments**: Razorpay API integration for secure fee processing.

---

## 🚀 Installation & Setup (Local Development)

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.9.0 or higher)
- **Git**

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the root of the `backend` directory and configure the following variables:
```env
# Database
DATABASE_URL=sqlite:///./campus_runner.db

# Authentication
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=yourkeysecret
```

Start the FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
> **Note:** The backend API will be available at `http://localhost:8000`. You can view the automatic Swagger UI docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install the required NPM packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
> **Note:** The frontend application will be running at `http://localhost:5173`.

---

## 🔐 Admin Access

The platform includes a dedicated portal for administrative control, isolated from the standard student OTP flow.

1. Navigate to: `http://localhost:5173/admin/login`
2. **Admin Email**: `campusrunner4@gmail.com`
3. **Master Password**: `AryanRao@2205`

From the Admin Dashboard, you can monitor total platform liability, suspend malicious users, audit ongoing parcel deliveries, and process pending UPI withdrawal requests from your runners.

---

## 📚 Documentation
For deeper technical insights and deployment strategies, refer to the documentation files located in the `/docs` directory:
- 📄 [Product Requirements Document (PRD)](docs/PRD.md)
- 🔌 [API Documentation](docs/API_DOCUMENTATION.md)
- 🗄️ [Database Schema](docs/DATABASE_SCHEMA.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- 🔄 [System Workflow](docs/WORKFLOW.md)

---

## 📄 License
This project is licensed under the MIT License.

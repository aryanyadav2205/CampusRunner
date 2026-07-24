<div align="center">
  <img src="frontend/public/hero-illustration.png" alt="Campus Runner Logo" width="300"/>
  <h1>🏃‍♂️ Campus Runner</h1>
  <p><strong>The fastest, most trusted peer-to-peer parcel delivery network for college campuses.</strong></p>

  <p>
    <a href="https://github.com/aryanyadav2205/CampusRunner/stargazers"><img src="https://img.shields.io/github/stars/aryanyadav2205/CampusRunner?style=flat-square&color=blue" alt="Stars"></a>
    <a href="https://github.com/aryanyadav2205/CampusRunner/network/members"><img src="https://img.shields.io/github/forks/aryanyadav2205/CampusRunner?style=flat-square&color=blue" alt="Forks"></a>
    <img src="https://img.shields.io/badge/Python-3.9+-blue.svg?style=flat-square" alt="Python Version">
    <img src="https://img.shields.io/badge/React-18+-blue.svg?style=flat-square" alt="React Version">
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License"></a>
  </p>
  
  <p>
    <a href="#-what-is-campus-runner">About</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-key-features">Features</a> •
    <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
    <a href="#-installation--setup-local-development">Installation</a> •
    <a href="#-admin-access">Admin Access</a> •
    <a href="#-documentation">Documentation</a>
  </p>
</div>

---

## 🌟 What is Campus Runner?
**Campus Runner** bridges the gap between busy students and active peers. It allows students to delegate parcel retrieval from campus gates or mailrooms to other active students ("runners"). Runners earn real money by picking up and delivering parcels along their regular campus routes, creating a fast, community-driven micro-logistics network.

## 🚀 How It Works
1. **Create a Request:** A student (Owner) needs a parcel from the gate. They create a request specifying the delivery location and a reward amount.
2. **Accept the Run:** An active student (Runner) sees the open request on their dashboard and accepts it.
3. **Secure Hand-off:** The runner picks up the parcel. Upon delivery, the owner provides a secure 4-digit OTP to complete the hand-off.
4. **Get Paid:** The pre-agreed reward is instantly transferred to the runner's digital wallet, ready for withdrawal.

## ✨ Key Features
* 🔄 **Dual Roles**: Every student account can seamlessly switch between acting as a **Parcel Owner** (requesting a delivery) and a **Runner** (accepting a delivery run).
* 💰 **Prepaid & COD Support**: Comprehensive support for handling both pre-paid packages and Cash-on-Delivery (COD) handoffs.
* 🛡️ **Secure OTP Deliveries**: 4-digit OTP verification ensures that high-value parcels are only handed over to the correct recipient.
* 💳 **Integrated Digital Wallet**: Runners earn payouts directly into their built-in CampusRunner wallet, with a fully functioning ledger system.
* 🏦 **UPI Payouts System**: Runners can request wallet withdrawals directly to their UPI IDs (GPay, PhonePe, Paytm).
* 💬 **In-App Messaging**: Real-time communication portal allowing Owners and Runners to chat seamlessly regarding their active deliveries.
* 🎫 **Support Tickets System**: A built-in ticketing system to resolve user disputes, request assistance, and manage queries directly with admins.
* 🎛️ **Admin Control Center**: A dedicated, secure dashboard for platform administrators to monitor revenue, audit parcel logs, manage user suspensions, process runner payouts, and resolve support tickets.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework**: [React.js](https://reactjs.org/) with Vite for lightning-fast HMR and building.
* **Styling**: Pure CSS with a highly dynamic, variable-driven UI (Includes both a Dark "Green" theme and Light "Blue" theme).
* **Icons**: [Lucide React](https://lucide.dev/).
* **Routing**: [React Router DOM v6](https://reactrouter.com/).

### Backend Architecture
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python) for ultra-fast, async RESTful API endpoints.
* **Database**: SQLite for development / PostgreSQL for production (via SQLAlchemy ORM & `psycopg2-binary` with automatic URI normalization).
* **Authentication**: Stateless JWT (JSON Web Tokens) with email OTP verification.
* **Payments**: Razorpay API integration for secure fee processing.

---

## 💻 Installation & Setup (Local Development)

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
# Database (SQLite by default, or PostgreSQL string)
DATABASE_URL=sqlite:///./campus_runner.db

# Authentication
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=yourkeysecret
```

(Optional) Seed the database with demo users and requests:
```bash
python seed_data.py
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
2. Log in using the admin credentials configured in your backend environment variables.

From the Admin Dashboard, you can monitor total platform liability, suspend malicious users, audit ongoing parcel deliveries, process pending UPI withdrawal requests from your runners, and resolve support tickets.

---

## 📚 Documentation
For deeper technical insights and deployment strategies, refer to the documentation files located in the `/docs` directory:
- 📄 [Product Requirements Document (PRD)](docs/PRD.md)
- 🔌 [API Documentation](docs/API_DOCUMENTATION.md)
- 🗄️ [Database Schema](docs/DATABASE_SCHEMA.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- 🔄 [System Workflow](docs/WORKFLOW.md)

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aryanyadav2205/CampusRunner/issues).

## 📄 License
This project is licensed under the MIT License.

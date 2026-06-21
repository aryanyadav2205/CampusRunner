# Campus Runner

![Campus Runner](frontend/public/hero-illustration.png)

Campus Runner is a peer-to-peer parcel delivery network for college campuses. It allows busy students to delegate parcel retrieval to other active students ("runners") who earn money by picking up and delivering parcels on their regular campus routes. 

## Features
- **Dual Roles in One Account**: Every student can act as both a Parcel Owner (requester) and a Runner.
- **Prepaid & COD Support**: Full support for both prepaid parcels and Cash on Delivery items.
- **Secure Deliveries**: OTP-based verification ensures parcels reach the right person.
- **Reputation System**: Two-way rating system ensures a trustworthy community network.
- **Integrated Payments**: Powered by Razorpay for seamless reward processing and platform fees.

## Tech Stack
### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS (Vibrant colors, dark mode support, modern UI)
- **Routing**: React Router DOM

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (Development) / Production-ready via SQLAlchemy ORM
- **Authentication**: JWT based stateless auth & OTP flow
- **Payments**: Razorpay integration

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Git

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```env
DATABASE_URL=sqlite:///./campus_runner.db
SECRET_KEY=supersecretjwtsecretkeychangeinproduction
ACCESS_TOKEN_EXPIRE_MINUTES=1440
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=yourkeysecret
```

Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Documentation
Additional documentation can be found in the `docs/` folder:
- [Product Requirements Document (PRD)](docs/PRD.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [System Workflow](docs/WORKFLOW.md)

## License
MIT License

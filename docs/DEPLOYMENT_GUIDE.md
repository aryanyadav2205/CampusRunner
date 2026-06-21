# Deployment Guide - Campus Runner V1.0

This guide explains how to deploy the Campus Runner application locally or on a production server.

---

## 1. Directory Structure Setup
Ensure your files are structured according to the recommended hierarchy:
```
campus-runner/
├── frontend/
├── backend/
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
└── README.md
```

---

## 2. Environment Variables

### 2.1 Backend configuration (`backend/.env`)
Create a `.env` file in the root of the backend folder with the following variables:
```env
# Database
DATABASE_URL=sqlite:///./campus_runner.db

# Security
SECRET_KEY=supersecretjwtsecretkeychangeinproduction
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Razorpay Configuration (obtain from razorpay dashboard sandbox)
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=yourkeysecret
```

---

## 3. Local Installation & Development

### 3.1 Start Backend (FastAPI)
1. Navigate to the `backend` folder.
2. Initialize virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 3.2 Start Frontend (React + Vite)
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

---

## 4. Docker Deployment

We use Docker Compose to orchestrate frontend (React behind Nginx), backend (FastAPI), and SQLite database.

### 4.1 Running with Docker Compose
From the project root directory, run:
```bash
docker-compose -f deployment/docker-compose.yml up --build -d
```

This will launch:
- **Backend API** accessible at `http://localhost:8000`
- **Frontend App** accessible at `http://localhost:80` (mapped via Nginx)
- **Nginx Reverse Proxy** which handles static frontend files and proxies `/api/*` to the backend.

### 4.2 Nginx Proxy Rules
Nginx maps incoming requests:
- `/` -> serves React index.html and assets.
- `/api/` -> proxies to `http://backend:8000/api/`.

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
# Database (Neon PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/dbname?sslmode=require


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
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUse
   npm run dev
   ```

---

## 4. Docker Deployment

We use Docker Compose to orchestrate frontend (React behind Nginx) and backend (FastAPI) connected to Neon Database (PostgreSQL).

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

---

## 5. Render Cloud Deployment

Render (`render.com`) is a fully managed cloud platform suitable for hosting both the FastAPI backend and React frontend.

### Option A: Automatic 1-Click Deployment (Render Blueprint)

1. Push your repository code to GitHub or GitLab.
2. Log into your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your repository.
5. Render will automatically detect the `render.yaml` file in the root directory and set up two services:
   - `campusrunner-api`: FastAPI Web Service.
   - `campusrunner-web`: Vite Static Site.
6. Click **Apply**. Render will build and deploy both services automatically!

### Option B: Manual Setup via Render Web Dashboard

#### 1. Deploy Backend Web Service
1. On Render Dashboard, click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Name**: `campusrunner-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `python -m pip install --upgrade pip && pip install --prefer-binary -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `DATABASE_URL`: `sqlite:///./campus_runner.db` (or PostgreSQL URI from Render Postgres)
   - `SECRET_KEY`: (generate a secure random string)
5. Click **Create Web Service**. Note the deployed URL (e.g., `https://campusrunner-api.onrender.com`).

#### 2. Deploy Frontend Static Site
1. Click **New +** -> **Static Site**.
2. Connect your Git repository.
3. Configure settings:
   - **Name**: `campusrunner-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://campusrunner-api.onrender.com/api` (Replace with your actual backend URL + `/api`)
5. Under **Redirects / Rewrites**, add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

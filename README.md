# 🎯 Clarity Task Manager

<p align="center">
  <em>A modern, multi-tenant task management platform engineered to reduce cognitive overload and enforce priority-driven workflows.</em>
</p>

---

## 🚀 Overview

Clarity is a production-ready, full-stack web application built to solve the "messy to-do list" problem. Rather than acting as a standard dumping ground for infinite tasks, Clarity strictly enforces task urgency, automatically filters what matters "Today", and maintains a beautifully minimalist UI.

This project was built emphasizing **Enterprise-Grade Engineering Practices**, implementing robust backend security, relational data isolation, test-driven logic, and a scalable React architecture making it ideal for technical portfolio presentation.

## 💻 Tech Stack

### Frontend
- **React 18** (via Vite)
- **Tailwind CSS** (Custom Design System & responsive layouts)
- **React Router** (Protected DOM Routing)
- **Axios** (JWT-Intercepted API bindings)

### Backend
- **Node.js & Express.js**
- **JWT & bcrypt** (Stateless authentication & cryptographic password hashing)
- **Jest & Supertest** (Integration and Unit Testing)
- **Helmet-inspired headers & Rate Limiting** (Infrastructure Hardening)

### Database
- **MySQL 8+**
- **mysql2** (Promise-based connection pooling)

## ⭐ Key Engineering Features

- **Relational Multi-Tenancy:** The database strictly associates Tasks with Users dynamically via foreign keys, enforcing SQL query-level isolation constraints so users can never access each other's data.
- **Stateless Authentication:** Built natively using JSON Web Tokens. Axios automatically intercepts HTTP requests to seamlessly attach `Authorization: Bearer` headers across the app lifecycle.
- **Fail-Safe Circuit Breaker:** The Node.js application utilizes a health-check wrapper. If the database crashes, the API gracefully degrades with a HTTP `503 Service Unavailable`, preventing hanging TCP sockets.
- **Graceful Error Handling:** Centralized try-catch closures prevent Node server crashes, and rigorous input validations reject malformed POST payloads before they touch the database.

---

## 🛠️ Prerequisites

Before you begin, ensure you have installed:
- **Docker Engine** (or Docker Desktop)
- **Docker Compose v2** (`docker compose`)
- **Git**

## 📦 Local Setup (Docker - Recommended)

This project now runs fully with Docker Compose (database, backend API, frontend, and phpMyAdmin).

### 1. Build and Start All Services
From project root, run:
```bash
docker compose up --build -d
```

What this does automatically:
- Starts MySQL (`db`)
- Initializes tables from `backend/schema.sql` (first run only)
- Builds and runs backend API (`backend`)
- Builds and serves frontend via Nginx (`frontend`)
- Starts phpMyAdmin (`phpmyadmin`)

### 2. Access the App
- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend API: [http://localhost:5000](http://localhost:5000)
- phpMyAdmin: [http://localhost:8081](http://localhost:8081)

### 3. Useful Docker Commands
```bash
# Check running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Stop all services
docker compose down
```

### 4. Reset Database (if needed)
If you want a fresh database, remove containers and DB volume:
```bash
docker compose down -v
docker compose up --build -d
```
> ⚠️ This will permanently delete local MySQL data in Docker volume.

### 5. Optional: Run Without Docker (Legacy Manual Setup)
Manual Node.js + local MySQL setup is still possible, but Docker flow above is the recommended and maintained path.

## 🧪 Testing
The backend infrastructure features a suite of integration tests to confirm HTTP response boundaries and data processing logic.
```bash
docker compose exec backend npm test
```


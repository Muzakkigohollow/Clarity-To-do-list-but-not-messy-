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
- **Node.js** (v18+)
- **MySQL Server** (v8+)
- **Git**

## 📦 Local Setup Guide

### 1. Database Initialization
Clarity utilizes MySQL for permanent data storage. We need to create the internal tables.
```bash
# Navigate to the backend
cd backend

# Execute the schema script to generate the `clarity_db` database
mysql -u root -p < schema.sql
```

### 2. Backend Environment Setup
1. Inside the `/backend` folder, install the necessary dependencies:
   ```bash
   npm install
   ```
2. Create or verify the `/backend/.env` file with these default development variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=1998
   DB_NAME=clarity_db
   DB_CONNECTION_LIMIT=10
   JWT_SECRET=super_secret_dev_key_change_in_production
   CORS_ORIGIN=http://localhost:5173
   ```
3. Start up the backend server:
   ```bash
   npm run dev
   ```
   *(Your API will spin up synchronously with the MySQL connection pool at `http://localhost:5000`)*

### 3. Frontend Setup
1. Open a **second terminal** and navigate to `/frontend`.
2. Install the User Interface dependencies:
   ```bash
   npm install
   ```
3. Create or verify the `/frontend/.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Boot the React application:
   ```bash
   npm run dev
   ```
5. 🌐 **Open [http://localhost:5173](http://localhost:5173)** in your browser. Register a new user, and experience Clarity.

## 🧪 Testing
The backend infrastructure features a suite of integration tests to confirm HTTP response boundaries and data processing logic.
```bash
cd backend
npm run test
```


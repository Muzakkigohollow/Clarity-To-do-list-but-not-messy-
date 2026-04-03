# Clarity Task Manager

Clarity Task Manager is a time-relevance and priority-filtered task management system designed to reduce cognitive overload by emphasizing what matters now. 

It provides strict priority sorting, derivation of daily focuses, and enforces simplicity with binary states (PENDING/DONE).

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL (with an automatic mock DEMO mode fallback)

## Prerequisites
- Node.js (v18+ recommended)
- MySQL (Optional: backend will fall back to DEMO mode if a connection cannot be established)

---

## Guide to Run the Project

Follow these steps to set up and run both the frontend and backend locally.

### 1. Database Setup (Optional but Recommended)
The backend is configured to connect to a MySQL database named `clarity_db`.
By default it requires a working DB connection (`DB_MODE=real`). If you want demo behavior, set `DB_MODE=mock` explicitly.

If you want to use a real database:
1. Ensure MySQL is running on your machine.
2. Initialize the database using the provided schema:
   ```bash
   cd backend
   mysql -u root -p < schema.sql
   ```
3. (Optional) Create a `.env` file in the `backend` directory if your credentials differ from the defaults:
   ```env
API_KEY=your_api_key_here
DB_MODE=real
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=clarity_db
   ```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server should run on `http://localhost:5000` (or another port if configured).*

### 3. Frontend Setup
1. Open a **new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
VITE_API_KEY=your_api_key_here
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Vite will start the client, usually on `http://localhost:5173`. Open this URL in your web browser.*

## Key Features
- **Strict Priority Ordering**: HIGH -> MEDIUM -> LOW classification enforces attention on critical items.
- **State Model**: Simple binary states (PENDING or DONE).
- **Temporal Filtering**: Derived focus views emphasizing tasks whose deadline is "Today". 

## Project Structure
- `/frontend` - React application (Vite setup).
- `/backend` - Express API and database connection logic (`db.js`, routes, controllers).
- `findings.md` - Core project requirements, findings, and technical decisions.
- `task_plan.md` - Implementation phases and status tracker.

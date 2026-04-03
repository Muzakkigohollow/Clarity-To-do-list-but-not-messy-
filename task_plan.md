# Task Plan: Clarity Task Manager

## Goal
Build a time-relevance and priority-filtered task management system with a React frontend and Node.js/MySQL backend to reduce cognitive overload by emphasizing what matters now.

## Current Phase
Phase 6 (Production Hardening - in progress)

## Phases

### Phase 1: Project Initialization & Architecture Setup
- [x] Initialize Node.js/Express backend project structure (installed dependencies and added dev script)
- [x] Set up MySQL database schema for Tasks
- [x] Initialize React (Vite) frontend with Tailwind CSS (configured vite files and installed react/tailwind)
- [x] Set up HTTP configuration (Axios) (frontend/src/api.js is set up)
- **Status:** complete

### Phase 2: Backend API & Database
- [x] Create Task entity schema (id, title, priority, deadline, status, optional owner)
- [x] Implement CRUD endpoints for tasks (GET, POST, PUT, DELETE)
- [x] Implement status transition endpoint (PENDING <-> DONE)
- [x] Test API endpoints with mock data
- **Status:** complete

### Phase 3: Frontend Layout & Data Integration
- [x] Set up Tailwind configuration and strict visual hierarchy rules
- [x] Develop main dashboard layout (Header, Progress summary, Today Focus, Task list, Task creation)
- [x] Create API service layer using Axios
- [x] React state management for fetching tasks and mutating state
- **Status:** complete

### Phase 4: Core Logic & Derived Views
- [x] Implement Temporal Filtering logic (Today tasks vs Upcoming tasks based on current date)
- [x] Implement Priority Ordering (Strict HIGH -> MEDIUM -> LOW sorting)
- [x] Implement Progress Calculation (# DONE / Total)
- [x] Connect derived views to the UI sections
- **Status:** complete

### Phase 5: UI Polish & Final Verification
- [x] Apply visual distinctness to Priority (colors/labels)
- [x] Ensure non-dense lists and optimal whitespace
- [x] Verify core constraints (no complex scheduling, only 2 states, priority enforced)
- [x] End-to-end testing of user flows
- **Status:** complete

### Phase 6: Priority 0 Production Blockers (Security + Reliability)
- [x] Remove DEMO fallback in `backend/db.js`
  - Implement explicit `DB_MODE=real|mock` (default `real`)
  - If `real` fails: fail startup OR return `503` for DB-dependent routes (never fake success)
- [x] Add authentication + authorization (minimum viable)
  - Require auth middleware for all task mutations (`POST/PUT/PATCH/DELETE`)
  - Scope all queries by authenticated user (use `owner` as `owner_id` or enforce `owner` from token)
- [x] Add input validation + consistent error handling
  - Validate `title`, `priority`, `deadline`, `status`, and `id`
  - Return `400` for invalid input; return `404` for missing IDs; return generic `500` for server failures
  - Stop returning `err.message` to clients
 - [x] Harden API surface
  - Restrict CORS origins (no blanket `cors()` in production)
  - Add `helmet`, request size limit, and rate limiting (basic)
 - [x] Fix secrets handling
  - Do not commit real credentials
  - Add `backend/.env.example` and ensure your runtime uses environment injection
- **Status:** complete

### Phase 7: Backend Reliability + DB Robustness
- [ ] Await DB health check before serving requests (or gate routes)
- [ ] Add runtime circuit breaker / degraded mode behavior (if you still want mock)
- [ ] Add structured server logging for DB + request context (no sensitive fields)
- [ ] Improve API semantics
  - Make `PUT` and `PATCH` behavior unambiguous and validated
- **Status:** pending

### Phase 8: Database Design for Growth
- [ ] Add indexes that match access patterns
  - `status`, `deadline` (and composite indexes if you add filters later)
- [ ] Add pagination/filtering to `GET /api/tasks`
  - Even if you keep it simple, avoid “always return entire table”
- [ ] Prepare schema for real multi-user mode
  - Normalize ownership (add `users` table + FK, or strictly derive owner from auth)
- **Status:** pending

### Phase 9: Frontend Performance + Correctness
- [ ] Stop refetching the full list after every mutation
  - Update local `tasks` state from mutation responses (or optimistic updates)
- [ ] Memoize derived lists and computed progress (`useMemo`)
- [ ] Fix deadline handling for strict "Today" semantics
  - Prefer comparing `YYYY-MM-DD` strings (timezone-safe) vs `new Date(...).toISOString()`
- [ ] Add user-facing error states (not just `console.error`)
- **Status:** pending

### Phase 10: Testing & Release Readiness
- [ ] Expand test coverage
  - Backend tests for invalid payloads (400), invalid status transitions, and 404 cases
  - At least one integration test path that runs against a real MySQL container/local DB
- [ ] Add smoke test checklist
  - Start backend, migrate/init schema, run UI smoke flows, confirm DB failure returns 503 (not mock)
- **Status:** pending

## Key Questions
1. Should time zones be considered for determining "Today"?
2. Do we need user authentication (JWT) for the Minimum Viable Version, or should we skip it to meet constraints?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Tech Stack fixed | React (Vite), Tailwind, Axios, Node/Express, MySQL |
| Two states only | Simplifies logic: PENDING and DONE |
| Priority absolute ordering | Enforces user attention directly (HIGH -> MEDIUM -> LOW) |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions
- Priority must always be rendered in fixed order. Priority is absolute.
- Priority order for production work:
  1. Delete/disable silent mock fallback (fake success is a production incident waiting to happen)
  2. Add auth + query scoping (current app is fully open CRUD)
  3. Add validation + non-leaky error handling (400 vs 500, no `err.message` to clients)
  4. Harden CORS + security middleware + rate limiting
  5. Fix DB health check reliability (await init, deterministic behavior)
  6. Add indexes + pagination
  7. Frontend: avoid refetch, memoize, fix timezone semantics, improve UX

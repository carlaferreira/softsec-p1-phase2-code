# Expense Reimbursement Platform

**SoftSec 2025/2026 — Assignment 1, Phase 2 (vulnerable application)**

A REST API where employees submit expense reimbursement requests, managers approve within their department, and finance admins manage the platform globally. Built with Node.js, Express, SQLite (better-sqlite3), JWT, and bcryptjs.

---

## Frontend

A minimal web UI is available at `http://localhost:3000` after starting the server. It was generated to help understanding the application and its intended behaviour — it is not part of the assignment and does not need to be audited or modified.

---

## Technology Stack

| Component       | Technology            |
|-----------------|-----------------------|
| Runtime         | Node.js (ES modules)  |
| Framework       | Express.js            |
| Database        | SQLite3 (`better-sqlite3`) |
| Authentication  | JWT (`jsonwebtoken`)  |
| Password hashing| `bcryptjs`            |
| Configuration   | `dotenv`              |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

The default values are ready to use. No changes needed.

### 3. Seed the database

```bash
npm run seed
```

Creates `src/config/app.db` with six test users and sample expenses.

### 4. Run

```bash
npm start
```

Server listens on `http://localhost:3000`.

---

## Scenario

A company reimburses employee expenses under an approval policy.

### Roles

| Role            | Scope                  | Permissions                                                                 |
|-----------------|------------------------|-----------------------------------------------------------------------------|
| `employee`      | Own expenses           | Submit, list own, view own                                                  |
| `manager`       | Own department         | All of employee + approve/reject pending expenses in same department        |
| `finance_admin` | Global (all depts)     | All of manager + approve/reject anywhere, delete, manage users, view audit  |

### Approval policy

- Expenses ≤ `AUTO_APPROVE_THRESHOLD` (default €500): auto-approved on submission.
- Expenses > `FINANCE_REVIEW_THRESHOLD` (default €1000): require a `finance_admin` to approve. A manager cannot approve them even within their own department.
- Expenses in `[AUTO_APPROVE_THRESHOLD, FINANCE_REVIEW_THRESHOLD]`: can be approved by a manager in the same department or a finance_admin.

### Audit log

All authentication events, access denials, and expense creation / approval / rejection / deletion are written to `audit_log`. Only `finance_admin` can read it.

---

## Test Users

All passwords follow `<first_name>123`.

| Username      | Password    | Role            | Department   |
|---------------|-------------|-----------------|--------------|
| admin_alice   | alice123    | finance_admin   | finance      |
| mgr_bruno     | bruno123    | manager         | engineering  |
| mgr_clara     | clara123    | manager         | sales        |
| emp_diego     | diego123    | employee        | engineering  |
| emp_elena     | elena123    | employee        | engineering  |
| emp_felipe    | felipe123   | employee        | sales        |

---

## API Endpoints

All JSON bodies are `application/json`. Protected endpoints require `Authorization: Bearer <token>`.

### Authentication

```
POST /api/auth/register
  body: { username, password, full_name, department }
  → { id, username, role: "employee", department }

POST /api/auth/login
  body: { username, password }
  → { token, user }

POST /api/auth/logout    (auth)
```

### Users

```
GET    /api/users               (finance_admin)
GET    /api/users/me            (auth)
PATCH  /api/users/me            (auth)    body: { full_name }
PATCH  /api/users/me/preferences (auth)   body: { preferences: { ... } }
PATCH  /api/users/:id           (finance_admin)  body: { role?, department? }
```

### Expenses

```
GET    /api/expenses            (auth)     → role-filtered list
POST   /api/expenses            (auth)     body: { category, amount, currency?, description }
GET    /api/expenses/:id        (auth)
POST   /api/expenses/:id/approve (manager | finance_admin)
POST   /api/expenses/:id/reject  (manager | finance_admin)
DELETE /api/expenses/:id        (finance_admin)
```

### Audit

```
GET /api/audit?limit=100        (finance_admin)
```

---

## Example Requests

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"emp_diego","password":"diego123"}'

# Submit an expense (auto-approved because < 500)
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"category":"meals","amount":42.50,"description":"Team lunch"}'

# Update preferences
curl -X PATCH http://localhost:3000/api/users/me/preferences \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"notifications":{"email":true}}}'
```

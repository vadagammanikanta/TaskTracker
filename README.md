# TaskTracker — Full Stack MERN Task Management System

A production-ready Task Management System built with MongoDB, Express, React (Vite), and Node.js.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### 1. Clone & configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and a strong JWT_SECRET
npm install
npm run dev
```

### 2. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**, backend at **http://localhost:5000**.

---

## 🎨 UI & UX Highlights
- **Linear/Things-Inspired Aesthetics:** Clean, keyboard-friendly row layout with dark mode support.
- **Interactive Status Dropdown:** Easily change status directly from the task list (`Todo` ➔ `In Progress` ➔ `Done`) with instant visual feedback.
- **Segmented Filter Buttons:** One-click filter chips for Status and Priority with dedicated icons.
- **Analytics Dashboard:** SVG Radial completion progress ring, compact 4-stat metric bar, and responsive Donut chart with custom tooltips.
- **Focused Task Panel Modal:** Fast task creation/editing with autofocus and `Escape` key close support.

---

## 📁 Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # auth, errorHandler, validate
│   │   ├── models/         # Mongoose User & Task schemas
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # asyncHandler, ApiError
│   │   └── index.js        # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instances + API calls
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth & Theme context
│   │   ├── pages/          # Route-level pages
│   │   └── routes/         # ProtectedRoute wrapper
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoint Reference

All endpoints return `{ success: true, ... }` on success and `{ success: false, message: "..." }` on error.

### Authentication

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/api/auth/signup` | ❌ | `{ name, email, password }` | `{ success, user: { _id, name, email } }` + httpOnly cookie |
| `POST` | `/api/auth/login` | ❌ | `{ email, password }` | `{ success, user: { _id, name, email } }` + httpOnly cookie |
| `POST` | `/api/auth/logout` | ✅ | — | `{ success, message }` |
| `GET` | `/api/auth/me` | ✅ | — | `{ success, user }` |

### Tasks

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| `POST` | `/api/tasks` | ✅ | `{ title, description?, status?, priority?, dueDate? }` | `{ success, task }` |
| `GET` | `/api/tasks` | ✅ | Query: `status`, `priority`, `search`, `page`, `limit`, `sortBy`, `order` | `{ success, tasks, pagination }` |
| `GET` | `/api/tasks/:id` | ✅ | — | `{ success, task }` |
| `PUT` | `/api/tasks/:id` | ✅ | Any task fields | `{ success, task }` |
| `DELETE` | `/api/tasks/:id` | ✅ | — | `{ success, message }` |
| `PATCH` | `/api/tasks/:id/complete` | ✅ | — | `{ success, task }` (toggles Done ↔ Todo) |
| `GET` | `/api/tasks/analytics` | ✅ | — | `{ success, analytics: { total, completed, pending, inProgress, completionPercentage } }` |

#### Pagination response shape
```json
{
  "pagination": {
    "totalCount": 42,
    "totalPages": 5,
    "currentPage": 2,
    "limit": 9
  }
}
```

#### Query param details for `GET /api/tasks`
| Param | Type | Description |
|-------|------|-------------|
| `status` | `Todo \| In Progress \| Done` | Filter by status |
| `priority` | `Low \| Medium \| High` | Filter by priority |
| `search` | string | Case-insensitive title search (uses MongoDB text index) |
| `page` | number (default: 1) | Page number |
| `limit` | number (default: 9) | Items per page |
| `sortBy` | `dueDate \| priority` | Field to sort by |
| `order` | `asc \| desc` (default: `desc`) | Sort direction |

---

## 🏗️ Design Decisions

### 1. JWT Storage: httpOnly Cookies
**Decision:** JWT stored in an `httpOnly`, `SameSite=strict` cookie — not `localStorage`.

**Why:** `httpOnly` cookies are inaccessible to JavaScript, eliminating XSS-based token theft. `SameSite=strict` provides CSRF protection without needing a separate CSRF token for same-origin SPAs. The trade-off is slightly more complex cross-origin setup (`withCredentials: true` on Axios + `credentials: true` on CORS), but the security gain is worth it.

---

### 2. Priority Sort via Aggregation Pipeline
**Decision:** When `sortBy=priority`, the API uses a MongoDB `$addFields` aggregation stage to convert the enum string to a numeric weight (High=3, Medium=2, Low=1), then sorts by that weight.

**Why:** Alphabetical sort of "High/Medium/Low" doesn't produce the correct order. Mapping to numeric weights at the DB level avoids loading all tasks into JS to re-sort, and keeps the sort logic server-authoritative.

---

### 3. MongoDB Indexes
Three indexes are declared on the Task model:
- `{ userId: 1, status: 1 }` — compound index for the most common filter combination (all my tasks filtered by status)
- `{ userId: 1, dueDate: 1 }` — compound index for date-sorted task lists
- `{ title: 'text' }` — text index enabling MongoDB's `$text` search (case-insensitive, stemming support)

These mean the DB never does full collection scans for typical task queries.

---

### 4. Pagination: Server-Side with `$skip/$limit`
**Decision:** Pagination is done server-side with `?page=&limit=` params. The API returns `totalCount`, `totalPages`, `currentPage`, and `limit` in a `pagination` envelope.

**Why:** Cursor-based pagination is faster for huge datasets, but `skip/limit` is simpler, works with arbitrary sorting, and is perfectly adequate for user-scoped task lists (hundreds, not millions, of records). URL-reflected pagination means filters + page survive a browser refresh.

---

### 5. Analytics: MongoDB `$facet` Aggregation
**Decision:** The `/api/tasks/analytics` endpoint uses a single `$facet` aggregation query rather than multiple `countDocuments` calls or JS-side counting.

**Why:** `$facet` runs multiple sub-pipelines in a single DB round-trip, making it both faster and atomic. The result accurately reflects a consistent snapshot of task state.

---

### 6. Error Handling: Centralized Middleware
**Decision:** All async handlers are wrapped in `asyncHandler()` (a higher-order function that catches promise rejections and forwards them to `next()`). A single `errorHandler` Express middleware at the end of the middleware chain intercepts all errors and returns a consistent `{ success: false, message }` shape.

**Why:** Avoids repetitive `try/catch` in every route, guarantees no unhandled promise rejections, and ensures all error responses share the same JSON shape for easy frontend handling.

---

### 7. Frontend State: Context API (not Redux)
**Decision:** Auth state is managed via React Context API + `useReducer`-style state, not Redux Toolkit.

**Why:** The auth state is simple (user object + loading flag) and is only set in a handful of places. Redux adds boilerplate overhead that isn't justified here. For task list state, local component state is sufficient since each page owns its data.

---

### 8. Dark Mode: CSS Variables + `data-theme` Attribute
**Decision:** All colors use CSS custom properties; the `ThemeContext` sets `document.documentElement.setAttribute('data-theme', 'dark')` to switch themes. Preference is persisted in `localStorage`.

**Why:** No JS-in-CSS runtime needed. A single CSS selector (`[data-theme='dark']`) overrides all variables, giving instant theme switching with zero flash for returning users.

---

## 🔒 Security Notes
- Passwords hashed with bcrypt (12 salt rounds)
- Auth routes rate-limited to 15 requests / 15 minutes
- All task operations scoped to `req.userId` — cross-user data access is impossible
- Server-side input validation on every write endpoint via `express-validator`
- `NODE_ENV=production` enables `secure` flag on cookies (HTTPS only)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Axios, Recharts |
| State | Context API (Auth), URL search params (filters) |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Auth | JWT (1h expiry), bcryptjs |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |

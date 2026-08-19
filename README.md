# 🚀 TaskTracker — Full-Stack MERN Task Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://task-tracker-ten-rose.vercel.app/)
[![API Backend](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://tasktracker-api-jrna.onrender.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

A modern, keyboard-friendly **Task Management System** built with the **MERN** stack (MongoDB, Express.js, React 19 + Vite, Node.js). Designed with a **Linear/Things-inspired aesthetic**, dense row layouts, real-time analytics powered by MongoDB aggregation pipelines, and production-grade security.

---

## 🔗 Live Links

- 🌐 **Frontend Application (Live):** [https://task-tracker-ten-rose.vercel.app/](https://task-tracker-ten-rose.vercel.app/)
- ⚙️ **Backend REST API (Live):** [https://tasktracker-api-jrna.onrender.com/](https://tasktracker-api-jrna.onrender.com/)
- 📁 **GitHub Repository:** [https://github.com/vadagammanikanta/TaskTracker](https://github.com/vadagammanikanta/TaskTracker)

---

## ✨ Features & Highlights

### 🎨 Linear-Inspired UI & Design System
- **Dense Row Layout:** Clean task list with circular completion triggers, priority color dots, and hover-revealed actions.
- **Interactive Status Selector Dropdown:** Change status directly from the list row (`Todo` ➔ `In Progress` ➔ `Done`) with instant visual feedback.
- **Segmented Filter Buttons:** Interactive button chips for Status and Priority filters with icons and active highlights.
- **Dark Mode Support:** Smooth theme toggling (Warm Neutral `#FAFAF9` ⇄ Deep Dark `#0E0E10`), persisted in `localStorage` with zero flash.
- **Focused Task Modal:** Keyboard-friendly creation/editing with autofocus and `Escape` key close support.
- **Feedback & States:** Skeleton shimmer loaders on async calls, button spinners, and global toast notifications.

### 🔐 Robust Authentication & Security
- **Dual-Layer JWT Auth:** `httpOnly` secure cookies with fallback `Authorization: Bearer <token>` support for seamless cross-domain operation.
- **Password Protection:** Hashed using `bcryptjs` (12 salt rounds) with complexity enforcement (8+ chars, uppercase, lowercase, number).
- **Strict User Scoping:** Every single query in MongoDB is scoped strictly to `req.userId` ensuring complete tenant data isolation.
- **Rate Limiting & Proxy Trust:** Configured with `express-rate-limit` and `trust proxy` for secure reverse-proxy deployments.

### 📊 Real-Time Analytics
- **MongoDB Aggregation Pipeline:** `GET /api/tasks/analytics` runs a `$facet` pipeline with `$group` to compute statistics on the database level in a single round-trip.
- **Hero Completion Metric:** Custom SVG Radial Progress Ring displaying overall completion percentage.
- **Compact Metric Row:** Instant totals for `Total`, `Done`, `In Progress`, and `Todo`.
- **Recharts Donut Breakdown:** Responsive status distribution chart with custom tooltips and status-keyed legend.

### 🔍 Dynamic Filtering, Sorting & Search
- **Full-Text Search:** Case-insensitive search powered by MongoDB `$text` title index.
- **Weighted Priority Sort:** Dynamic `$addFields` pipeline stage mapping `High (3) > Medium (2) > Low (1)`.
- **Due Date Sorting:** Earliest or latest due date ordering.
- **URL Synchronization:** All filter, sort, and pagination states sync with `useSearchParams` to survive page refreshes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Recharts |
| **State & Theming** | React Context API (`AuthContext`, `ThemeContext`, `ToastContext`), CSS Variables |
| **Backend** | Node.js, Express.js 4 |
| **Database** | MongoDB with Mongoose 8 (Indexes & Aggregations) |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| **Validation** | `express-validator` |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend Web Service) + MongoDB Atlas (Database) |

---

## 📁 Repository Structure

```
TaskTracker/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB Mongoose connection
│   │   ├── controllers/        # authController, taskController
│   │   ├── middleware/         # auth (JWT), errorHandler, validate
│   │   ├── models/             # User & Task Mongoose schemas + indexes
│   │   ├── routes/             # authRoutes, taskRoutes
│   │   ├── utils/              # asyncHandler, ApiError
│   │   └── index.js            # Express app entry & middleware setup
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # axiosConfig, authApi, taskApi
│   │   ├── components/
│   │   │   ├── analytics/      # AnalyticsChart (Donut), StatCard
│   │   │   ├── common/         # ConfirmModal, Pagination, Skeleton, Spinner, Toast
│   │   │   ├── layout/         # Navbar, Layout
│   │   │   └── tasks/          # TaskCard (Row layout), TaskFilters, TaskForm
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # DashboardPage, TasksPage, LoginPage, SignupPage
│   │   ├── routes/             # ProtectedRoute
│   │   ├── App.jsx
│   │   ├── index.css           # Design tokens, variables & responsive styling
│   │   └── main.jsx
│   ├── vercel.json             # SPA routing rewrite rules
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js** 18+ installed
- **MongoDB** running locally or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
```
Configure `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=1h
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
Install dependencies and run:
```bash
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 🔌 API Endpoint Reference

All endpoints return `{ success: true, ... }` on success and `{ success: false, message: "..." }` on error.

### Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Body / Payload | Description |
|---|---|:---:|---|---|
| `POST` | `/api/auth/signup` | ❌ | `{ name, email, password }` | Register new user, return JWT cookie + token |
| `POST` | `/api/auth/login` | ❌ | `{ email, password }` | Authenticate user, return JWT cookie + token |
| `POST` | `/api/auth/logout` | ✅ | — | Invalidate session & clear token |
| `GET` | `/api/auth/me` | ✅ | — | Get currently authenticated user profile |

### Tasks (`/api/tasks`)

| Method | Endpoint | Auth Required | Params / Body | Description |
|---|---|:---:|---|---|
| `GET` | `/api/tasks/analytics` | ✅ | — | MongoDB `$facet` aggregation statistics |
| `POST` | `/api/tasks` | ✅ | `{ title, description?, status?, priority?, dueDate? }` | Create a new task |
| `GET` | `/api/tasks` | ✅ | Query: `status`, `priority`, `search`, `page`, `limit`, `sortBy`, `order` | List paginated, filtered & sorted tasks |
| `GET` | `/api/tasks/:id` | ✅ | — | Fetch single task by ID |
| `PUT` | `/api/tasks/:id` | ✅ | Task fields to update | Update task details |
| `DELETE` | `/api/tasks/:id` | ✅ | — | Delete task permanently |
| `PATCH` | `/api/tasks/:id/complete` | ✅ | — | Quick toggle task status (`Done` ⇄ `Todo`) |

#### Query Parameters for `GET /api/tasks`
- `status`: `Todo` | `In Progress` | `Done`
- `priority`: `Low` | `Medium` | `High`
- `search`: Case-insensitive title search
- `sortBy`: `dueDate` | `priority`
- `order`: `asc` | `desc` (Default: `desc`)
- `page`: Page number (Default: `1`)
- `limit`: Items per page (Default: `12`)

---

## 🏗️ Design Decisions & Architecture

### 1. Dual Authentication: `httpOnly` Cookie + Bearer Token Fallback
- **Decision:** The API issues an `httpOnly`, `SameSite=None`, `Secure` cookie and simultaneously returns the `token` in the JSON payload for `Authorization: Bearer` storage.
- **Rationale:** While `httpOnly` cookies provide maximum security against XSS in same-origin environments, modern browsers (Safari, Chrome Incognito) frequently block third-party cookies across separate domains (e.g. `vercel.app` ➔ `onrender.com`). Supporting both guarantees 100% reliability across all browsers without sacrificing security.

### 2. Priority Sorting via MongoDB `$addFields` Pipeline
- **Decision:** When sorting by priority, the database pipeline maps string enums to numeric weights (`High: 3`, `Medium: 2`, `Low: 1`) using `$switch` before applying the sort.
- **Rationale:** Standard alphabetical sorting fails (`High` > `Low` > `Medium`). Converting to numerical weights at the database level keeps pagination and sorting server-authoritative without pulling the full collection into memory.

### 3. Compound & Text Indexing
- **Decision:** Declared 3 specialized indexes on the Task schema:
  - `{ userId: 1, status: 1 }` — speeds up the most common status-filtered queries.
  - `{ userId: 1, dueDate: 1 }` — speeds up calendar and date-ordered task retrieval.
  - `{ title: 'text' }` — enables full-text case-insensitive keyword searches.
- **Rationale:** Ensures zero full-collection scans as user task collections grow.

### 4. Real-Time Analytics with Single `$facet` Aggregation
- **Decision:** Computed in a single `$facet` stage combining `$group` status counts and total document counts.
- **Rationale:** Performs all aggregation logic in a single atomic database query rather than multiple `countDocuments` round-trips.

### 5. Context API over Redux Toolkit
- **Decision:** Auth and UI theme states are managed via React Context API (`AuthContext`, `ThemeContext`, `ToastContext`).
- **Rationale:** Auth and theme state is concise and global; Redux Toolkit introduces boilerplate without additional architectural benefit for this scale.

---

## 👤 Author

- **Name:** Manikanta Vadagam
- **GitHub:** [@vadagammanikanta](https://github.com/vadagammanikanta)
- **Repository:** [TaskTracker](https://github.com/vadagammanikanta/TaskTracker)

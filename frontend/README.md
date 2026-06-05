# HireAI — AI-Powered Job Portal Frontend

> A modern React 18 frontend for an AI-powered job portal with role-based access, JWT authentication, resume analysis, and intelligent job matching.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment & Proxy](#environment--proxy)
- [Authentication](#authentication)
- [Pages & Routes](#pages--routes)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Component Reference](#component-reference)
- [Styling System](#styling-system)
- [Role-Based Access Control](#role-based-access-control)
- [Scripts](#scripts)

---

## Overview

HireAI is a two-role job portal:

| Role | Capabilities |
|---|---|
| **SEEKER** | Browse & search jobs, apply, upload resume, track applications with AI match scores |
| **RECRUITER** | Post jobs, manage listings (open/close), review applicants ranked by AI match score, update application status |

The backend API runs at `http://localhost:8080`. All authenticated requests send a `Bearer` token via an Axios interceptor. The Vite dev server proxies all `/api` calls to the backend, so no CORS configuration is needed during development.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.1.0 | UI framework |
| `react-dom` | ^19.1.0 | DOM rendering |
| `react-router-dom` | ^7.6.1 | Client-side routing |
| `axios` | ^1.9.0 | HTTP client |
| `jwt-decode` | ^4.0.0 | Decode JWT payload client-side |
| `lucide-react` | ^0.511.0 | Icon library |
| `react-hot-toast` | ^2.5.2 | Toast notifications |
| `tailwindcss` | ^4.3.0 | Utility-first CSS (v4) |
| `@tailwindcss/vite` | ^4.3.0 | Tailwind v4 Vite plugin |
| `@vitejs/plugin-react` | ^6.0.2 | React fast refresh via Vite |
| `vite` | ^8.0.12 | Build tool & dev server |

---

## Project Structure

```
frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config (proxy + plugins)
├── package.json
│
└── src/
    ├── main.jsx                # React root — mounts <App> with BrowserRouter + AuthProvider
    ├── App.jsx                 # Route tree + Toaster
    ├── index.css               # Global styles, Tailwind v4 directives, animations
    │
    ├── context/
    │   └── AuthContext.jsx     # Auth state (token, user, role) + login/logout helpers
    │
    ├── api/
    │   ├── axiosInstance.js    # Axios base config, auth interceptor, 401 auto-logout
    │   ├── auth.js             # register(), login()
    │   ├── jobs.js             # getJobs(), searchJobs(), getJobById(), postJob(), updateJobStatus()
    │   ├── applications.js     # applyToJob(), getMyApplications(), getJobApplications(), updateApplicationStatus()
    │   └── resume.js           # uploadResume(), getMyResume()
    │
    ├── components/
    │   ├── Navbar.jsx          # Responsive nav with role-aware links
    │   ├── ProtectedRoute.jsx  # Auth + role gate for protected pages
    │   ├── JobCard.jsx         # Job listing card with AI match badge
    │   ├── StatusBadge.jsx     # Color-coded status pill
    │   ├── MatchScoreBar.jsx   # Animated AI match progress bar
    │   ├── Pagination.jsx      # Page navigation with ellipsis
    │   └── Feedback.jsx        # LoadingSpinner, ErrorMessage, EmptyState
    │
    └── pages/
        ├── LandingPage.jsx             # Public hero, search, featured jobs
        ├── LoginPage.jsx               # Email/password login
        ├── RegisterPage.jsx            # Registration with role toggle
        ├── JobFeedPage.jsx             # SEEKER — paginated job grid + search
        ├── JobDetailPage.jsx           # Public — full job details + apply
        ├── MyApplicationsPage.jsx      # SEEKER — application tracking
        ├── ResumeUploadPage.jsx        # SEEKER — drag-and-drop PDF upload
        ├── RecruiterDashboard.jsx      # RECRUITER — post jobs, manage listings
        └── ApplicationsManagerPage.jsx # RECRUITER — review applicants by job
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (v20 recommended)
- **npm** v9+
- Backend API running at `http://localhost:8080`

### Installation

```bash
# Clone / navigate to the frontend folder
cd frontend

# Install all dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Environment & Proxy

There are **no `.env` files** required for development. The Vite dev server is configured to proxy all `/api` requests to the backend:

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

This means a call like `axios.get('/api/jobs')` in the browser becomes `http://localhost:8080/api/jobs` — no CORS issues.

> **For production:** Set the `VITE_API_BASE_URL` or configure a reverse proxy (e.g. Nginx) to forward `/api` to your backend host. Update `axiosInstance.js` `baseURL` accordingly.

---

## Authentication

### Flow

1. User registers/logs in → backend returns `{ token, name, email, role }`
2. `AuthContext.loginWithData()` stores the token in `localStorage` and decodes the JWT for `name`/`role` fallback
3. Every subsequent Axios request automatically attaches `Authorization: Bearer <token>` via the request interceptor
4. On a `401` response, the interceptor clears `localStorage` and redirects to `/login`

### AuthContext API

```jsx
import { useAuth } from './context/AuthContext'

const {
  token,            // raw JWT string or null
  user,             // { name, email, role } or null
  isAuthenticated,  // boolean
  isSeeker,         // boolean — role === 'SEEKER'
  isRecruiter,      // boolean — role === 'RECRUITER'
  login,            // (tokenStr) => userData  — decodes token for user info
  loginWithData,    // (tokenStr, { name, email, role }) => userData
  logout,           // () => void — clears state + localStorage
} = useAuth()
```

### Token Storage

| Key | Value |
|---|---|
| `localStorage.token` | Raw JWT string |
| `localStorage.user` | JSON stringified `{ name, email, role }` |

---

## Pages & Routes

| Path | Component | Auth | Role |
|---|---|---|---|
| `/` | `LandingPage` | Public | — |
| `/login` | `LoginPage` | Redirects if logged in | — |
| `/register` | `RegisterPage` | Redirects if logged in | — |
| `/jobs` | `JobFeedPage` | Public | — |
| `/jobs/:id` | `JobDetailPage` | Public | — |
| `/my-applications` | `MyApplicationsPage` | ✅ Required | SEEKER |
| `/resume` | `ResumeUploadPage` | ✅ Required | SEEKER |
| `/dashboard` | `RecruiterDashboard` | ✅ Required | RECRUITER |
| `/applications-manager` | `ApplicationsManagerPage` | ✅ Required | RECRUITER |

**After login redirect:**
- `SEEKER` → `/jobs`
- `RECRUITER` → `/dashboard`

**Wrong role access:** Redirected to the default route for their own role.

---

## API Integration

All API functions live in `src/api/` and return Axios promises. Responses from the backend are expected in the shape:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

The pages read `res.data.data` for the payload. Paginated responses are expected as:

```json
{
  "data": {
    "content": [...],
    "totalPages": 5,
    "totalElements": 48
  }
}
```

> The API helpers defensively handle both `data` as an array directly or as `data.content` for paginated responses.

### API Modules

#### `src/api/auth.js`
```js
register({ name, email, password, role })  // POST /api/auth/register
login({ email, password })                 // POST /api/auth/login
```

#### `src/api/jobs.js`
```js
getJobs(page = 0, size = 10)               // GET /api/jobs?page=&size=
searchJobs(skill, location)                // GET /api/jobs/search?skill=&location=
getJobById(id)                             // GET /api/jobs/:id
postJob({ title, description, requiredSkills, location, salaryRange })  // POST /api/jobs
updateJobStatus(id, status)               // PATCH /api/jobs/:id/status?status=
```

#### `src/api/applications.js`
```js
applyToJob(jobId)                          // POST /api/applications/:jobId
getMyApplications()                        // GET /api/applications/my
getJobApplications(jobId)                  // GET /api/applications/job/:jobId
updateApplicationStatus(id, status)        // PATCH /api/applications/:id/status?status=
```

#### `src/api/resume.js`
```js
uploadResume(file)                         // POST /api/resume/upload  (multipart/form-data)
getMyResume()                              // GET /api/resume/my
```

---

## State Management

Only `AuthContext` is used for global state — no Redux or Zustand. All other state is local (`useState`) or fetched on mount (`useEffect`).

```
AuthContext (global)
  └── token, user (name, email, role)
      login / loginWithData / logout

Page-level state (local)
  └── jobs list, applications list, loading, error, pagination, form fields
```

---

## Component Reference

### `<ProtectedRoute allowedRoles={['SEEKER']}>`
Wraps a page component. Redirects unauthenticated users to `/login`. Redirects users with the wrong role to their default page.

### `<JobCard job={} onApply={fn} applying={bool} hasResume={bool} matchScore={number}>`
Displays a job listing card. Shows AI match badge only when `hasResume` is `true`. Calls `onApply(jobId)` when Apply button is clicked.

### `<StatusBadge status="APPLIED" />`
Renders a color-coded pill. Supported statuses: `APPLIED`, `REVIEWED`, `INTERVIEW`, `REJECTED`, `ACCEPTED`, `OPEN`, `CLOSED`.

### `<MatchScoreBar score={75} />`
Shows an animated progress bar. Color transitions: red (0–39) → amber (40–69) → green (70–100).

### `<Pagination page={0} totalPages={5} onPageChange={fn} />`
Renders page buttons with ellipsis for large page counts. Hidden when `totalPages <= 1`.

### `<LoadingSpinner size="md" text="Loading…" />`
Centered spinner with optional label. Sizes: `sm`, `md`, `lg`.

### `<ErrorMessage message="…" onRetry={fn} />`
Error display with optional retry button.

### `<EmptyState icon="📭" title="…" description="…" />`
Friendly empty state placeholder.

---

## Styling System

Uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin (no `tailwind.config.js` file needed).

Custom design tokens defined in `src/index.css` via `@theme`:

```css
--color-brand-50  → --color-brand-950   /* Blue palette */
--font-sans: 'Inter', sans-serif
```

### Custom CSS Utilities

| Class | Effect |
|---|---|
| `.animate-fade-in` | Fade + slide up on mount (0.4s) |
| `.animate-slide-up` | Stronger slide up (0.5s) |
| `.animate-pulse-slow` | Subtle opacity pulse |
| `.skeleton` | Shimmer loading placeholder |
| `.glass` | Frosted glass card effect |
| `.gradient-text` | Blue-to-cyan gradient text fill |

---

## Role-Based Access Control

```
              ┌─ Unauthenticated ─────► / (Landing), /jobs, /jobs/:id
              │                          /login, /register
User visits───┤
              │  SEEKER ──────────────► /jobs, /my-applications, /resume
              │
              └─ RECRUITER ───────────► /dashboard, /applications-manager
```

Attempting to access a wrong-role route redirects:
- A SEEKER hitting `/dashboard` → redirected to `/jobs`
- A RECRUITER hitting `/my-applications` → redirected to `/dashboard`

---

## Scripts

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build → ./dist/
npm run preview   # Serve the production build locally
```

---

## Known Assumptions & Notes

- The backend response shape is `{ success, message, data }`. If your backend returns a different shape, update the data access in page components (e.g. `res.data.data` → `res.data`).
- Job match scores (`matchScore`) and missing skills (`missingSkills`) are expected as fields on application objects returned by the backend.
- The `getJobs` endpoint is used by both seekers (job feed) and recruiters (dashboard). For a production app, consider a dedicated recruiter endpoint like `GET /api/jobs/my`.
- Resume upload uses `multipart/form-data` with field name `file` — this matches the backend spec.
- Tailwind CSS v4 does **not** use a `tailwind.config.js`. All customization is done in `index.css` via `@theme {}`.

# Voice AI Platform – Frontend Guide for Cursor

## 🧠 Objective
Build a modern, responsive frontend dashboard for the "Voice AI Platform" integrated with Frappe (ERPNext v15). This app includes user authentication, call log data display, and protected dashboard views.

---

## 🛠 Tech Stack
- Framework: Next.js App Router (React 18+)
- Styling: Tailwind CSS
- Backend: Frappe REST API
- Auth: Session-based (via cookies)
- SPA Setup: Managed via Doppio scaffolding

---

## 📦 Pages to Build

### 1. `/login`
- Form with `email` and `password`
- Submits to: `POST /api/method/login`
- On success: redirect to `/dashboard`
- Display error messages from Frappe on failed login

### 2. `/dashboard`
- Protected route
- Fetch from: `GET /api/resource/Voice Agent Call Log`
- Display: list of logs with
  - Caller Name
  - Phone Number
  - Intent
  - Timestamp
  - Status
- Optional: search & filter

---

## 🔐 Session Handling
- Use `fetch(..., { credentials: 'include' })` for all API calls
- Validate user via: `GET /api/method/frappe.auth.get_logged_user`
- Log out via: `POST /api/method/logout`
- Middleware should redirect to `/login` if not logged in

---

## 📁 Suggested File Structure
```
/app
  /login
    page.tsx
  /dashboard
    page.tsx
/lib
  frappeApi.ts
/components
  CallLogCard.tsx
  Navbar.tsx
  ProtectedRoute.tsx
/middleware.ts
```

---

## 🔄 Frappe API Reference

### Login
```http
POST /api/method/login
Content-Type: application/json

{
  "usr": "user@example.com",
  "pwd": "securepassword"
}
```

### Logged-in User
```http
GET /api/method/frappe.auth.get_logged_user
```

### Fetch Call Logs
```http
GET /api/resource/Voice Agent Call Log
```

### Logout
```http
POST /api/method/logout
```

---

## 🧠 Development Rules
- Use Tailwind utility classes only (no external CSS)
- Add error and loading states to all fetch calls
- Use `frappeApi.ts` as centralized API client
- Only show `/dashboard` if user is authenticated

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`/Backend`)
```bash
npm run dev       # start with nodemon (auto-reload)
node src/app.js   # start without nodemon
```

### Frontend (`/Frontend`)
```bash
npm run dev       # Vite dev server on port 3030
npm run build     # production build
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
npm run prettier  # Prettier format
```

## Architecture

This is a **dual-persona gym management app** — one backend, two separate frontends baked into the same React app.

### Backend (`/Backend/src`)
- **Entry:** `app.js` — mounts all routes, connects MongoDB, global error handler
- **Route prefixes:**
  - `/auth` — admin login, trainer/admin CRUD (Super Admin only)
  - `/member-auth` — member OTP login/register
  - `/member` — member CRUD + payments + PDF invoice generation (mix of admin + member-auth protected endpoints)
  - `/plan` — plan CRUD (admin only)
  - `/stat` — dashboard statistics (admin only)
- **Auth:** Two separate JWT middlewares — `authMiddleware.js` (admin, checks `role.includes('Admin')`) and `memberAuthMiddleware.js` (member, checks `role === 'member'` + `memberId`). Both read the raw token from `req.headers.authorization` (no `Bearer` prefix).
- **Email:** `sendEmail.js` wraps Brevo API. Every sent email is also persisted to the `Email` collection via `saveEmailRecord()`. Categories: `broadcast | otp | welcome | invoice | custom`.
- **PDF:** Invoice generation uses `jsPDF` (no headless Chrome).
- **Models:** `Admin`, `Member` (with embedded `payments[]` array), `Plan`, `Email`, `MemberOtp`, `Trainer`.

### Frontend (`/Frontend/src`)
- **Two route trees** under `sections.jsx`:
  - `/admin/*` — admin dashboard (DashboardLayout), requires admin JWT in `localStorage('token')`
  - `/member/*` — member portal (MemberPortalLayout), requires member JWT in `localStorage('memberToken')`
  - `/` — UnifiedLoginPage (entry, picks which persona)
- **Two Axios instances:**
  - `api/axios.js` — reads `token` from localStorage, redirects to `/` on 401
  - `api/memberAxios.js` — reads `memberToken` from localStorage, redirects to `/` on 401
- **Path alias:** `src/` is aliased, so imports use `src/components/...` not relative paths.
- **UI stack:** MUI v5 + Emotion, ApexCharts for graphs, Iconify for icons.

### Member Portal Rules (from Cursor rules)
- Members auth via **email + OTP only** (no passwords).
- Member JWT payload: `{ memberId, role: 'member' }`.
- `email`, `name`, `phone` are **immutable** from the member side — never allow members to edit these.
- Member-facing endpoints follow the pattern `/member/me`, `/member/me/payments` — never reuse admin list endpoints for members.
- Razorpay signature verification always happens **backend-only**.

## Environment Variables

Backend `.env` (see `.env.example`):
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — shared secret for both admin and member JWTs
- `BREVO_API_KEY` + `EMAIL_FROM` + `EMAIL_FROM_NAME` — Brevo email
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — member payments

Frontend `.env`:
- `VITE_BACKEND_URL` — backend base URL (no trailing slash), e.g. `http://localhost:3001`

## Key Conventions
- Admin roles are stored as a `String[]` on the Admin model. Super Admin gate: `roles.includes('Super Admin')`. Regular admin gate: `roles.includes('Admin')`.
- Member payments are an embedded array on `Member` — not a separate collection. `latestPaymentDate`, `latestPaymentAmount`, `latestPlanName` are denormalized top-level fields kept in sync on every payment.
- `Plan` documents are soft-deleted via `isActive: false`, never hard-deleted.
- CORS is currently open (`origin: true`) — lock this down before production.

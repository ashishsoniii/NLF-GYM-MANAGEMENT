---
title: Member Portal (Customer-Facing) PRD
description: OTP-based member login, self-registration, profile, and Razorpay payments
---

## 1. Goals

- **Separate member portal** from the existing admin dashboard.
- **Authentication**: members log in with **email + OTP** (no password).
- **Self-registration**: visitors can create their own member account.
- **Self-service**:
  - View profile + immutable core fields (name, email, phone, joining date, etc.).
  - View current plan and expiry.
  - View payment history.
  - Edit limited, non-critical fields (e.g. address, emergency contact, workout preferences).
- **Payments**:
  - Integrate **Razorpay** for plan purchase/renewal from the member portal.

## 2. User Types

- **Admin (existing)**:
  - Auth via `/auth/adminLogin`.
  - Uses existing dashboard, member management, analytics.

- **Member (new)**:
  - Identified by unique `email` in `Member` collection.
  - Authenticated via email + OTP → gets **member JWT** with `memberId` and `role: 'member'`.

## 3. Key Flows

### 3.1 Member Self-Registration

- Route: `/member/register`.
- Inputs:
  - Required: `name`, `email`, `phone`.
  - Optional: `gender`, `dateOfBirth`, `address`, `emergencyContact`, `workoutType`, etc.
  - Optional: initial plan selection (can be deferred to payment).
- Backend:
  - If `Member.email` already exists → return a clear error: _"You are already registered, please login"_.
  - Otherwise create a new `Member` document:
    - Set default status (e.g. active) and reasonable defaults for other required fields.
    - No initial payment required at registration; plan/payment can be added via Razorpay later.

### 3.2 OTP Login

- Route: `/member/login` (frontend).
- Step 1: Enter email and request OTP.
  - Frontend calls `POST /member-auth/send-otp` with `{ email }`.
  - Backend:
    - Looks up member by email; if not found, returns 404 with a helpful message.
    - Generates 6-digit OTP, stores **hashed OTP + expiry** (e.g. 10 minutes) either:
      - In a separate collection (e.g. `MemberOtp`), or
      - Embedded on the `Member` document.
    - Sends OTP via email using existing `sendEmail` helper.
- Step 2: Enter OTP and verify.
  - Frontend calls `POST /member-auth/verify-otp` with `{ email, otp }`.
  - Backend:
    - Verifies OTP against stored hash + expiry.
    - On success, clears OTP, issues **member JWT** with claims `{ memberId, role: 'member' }`.
  - Frontend:
    - Stores token in `localStorage` (can reuse `token` key but token content differs).
    - Redirects to `/member`.

### 3.3 Member Dashboard

- Route: `/member` (protected).
- Backend:
  - New `memberAuthMiddleware` to validate JWT and load the member by `memberId`.
- UI sections:
  - **Profile card**:
    - Shows name, email, phone (read-only).
    - Shows other profile fields (DOB, gender, address, emergency contact, workout type, etc.).
    - Clearly marks which fields are immutable.
  - ** Editable profile section**:
    - Uses PATCH `/member/me` to update a **whitelisted** subset of fields (e.g. address, emergencyContact, workoutType).
  - **Current plan**:
    - Shows plan name, expiry date, status (active/expired).
  - **Payment history**:
    - Table of payments with date, amount, plan, and maybe transaction/reference.

### 3.4 Razorpay Payments (Plan Purchase/Renewal)

- Member can initiate payment from the dashboard:
  - Select a plan (if none) or renewal for current plan.
  - Click **"Pay with Razorpay"**.
- API flow:
  - `POST /member/payment/create-order` (member-authenticated):
    - Body: `{ planId }`.
    - Backend:
      - Validates member and plan.
      - Creates Razorpay order using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
      - Responds with `{ orderId, amount, currency, razorpayKey }`.
  - Frontend:
    - Uses Razorpay Checkout JS with given order details.
    - On success, receives `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
    - Posts to `POST /member/payment/verify` with these details + `planId`.
  - Backend:
    - Verifies signature.
    - On success:
      - Creates a payment record for the member (reusing existing `payments` on Member).
      - Updates `expiryDate`, `latestPaymentAmount`, `latestPlanName`, etc.
      - Returns updated member summary.

## 4. Backend Requirements

1. **Member OTP Auth**
   - New routes under `/member-auth`:
     - `POST /member-auth/send-otp`
     - `POST /member-auth/verify-otp`
   - OTP storage (per-member, hashed + expiry).
   - Reuse existing `sendEmail` helper for OTP emails.

2. **Member Self-Registration**
   - `POST /member/self-register`:
     - Validates payload.
     - Ensures email uniqueness.
     - Creates a new `Member` record with sane defaults.

3. **Member Profile APIs**
   - `GET /member/me`:
     - Uses `memberAuthMiddleware` to resolve member from token.
   - `PATCH /member/me`:
     - Only updates a whitelist of mutable fields.
   - `GET /member/me/payments`:
     - Returns payment history from `Member.payments`.

4. **Razorpay Integration**
   - Add Razorpay client (e.g. `razorpay` npm package).
   - New env vars:
     - `RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
   - Implement:
     - `POST /member/payment/create-order`
     - `POST /member/payment/verify`

## 5. Frontend Requirements

1. **Routing & Auth**
   - New routes:
     - `/member/login` – OTP login.
     - `/member/register` – self-registration.
     - `/member` – member dashboard (protected).
   - New hook `useMemberAuth`:
     - Checks member token.
     - Redirects to `/member/login` when unauthenticated on member routes.

2. **Member Login (OTP) UI**
   - Stepper-style or two-panel login experience:
     - Step 1: Email input, **Send OTP** button.
     - Step 2: OTP input, **Verify & Login** button.
   - Clear error and success messages.

3. **Member Registration UI**
   - Simple, mobile-friendly form:
     - Basic personal details.
     - Validation and clear feedback.
   - On success, show confirmation and link to `/member/login`.

4. **Member Dashboard UI**
   - Modern, clean layout consistent with existing MUI design:
     - Profile card with read-only core fields.
     - Edit dialog for allowed fields.
     - Plan status card.
     - Payment history table.

5. **Razorpay UI**
   - Razorpay checkout integration:
     - Loads checkout script.
     - Handles success/cancel states.
   - Clear feedback after successful payment and auto-refresh of member data.

## 6. Implementation TODOs (High-Level)

### Backend

1. Implement member OTP auth (`/member-auth/*`) and `memberAuthMiddleware`.
2. Implement `POST /member/self-register`.
3. Implement member profile endpoints (`/member/me`, `/member/me/payments`).
4. Integrate Razorpay and implement `/member/payment/create-order` and `/member/payment/verify`.

### Frontend

5. Add member routes and `useMemberAuth`.
6. Build `MemberLoginView` (OTP).
7. Build `MemberRegisterView`.
8. Build `MemberDashboardPage` (profile, plan, payments).
9. Integrate Razorpay checkout from the member dashboard.


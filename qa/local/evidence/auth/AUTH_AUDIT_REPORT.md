# Auth & Access Control Audit Report

**Date**: 2026-02-22
**Auditor**: auth-agent
**Scope**: Authentication flows, RBAC, route protection, session management

---

## Executive Summary

The authentication system uses Neon Auth (managed Better Auth) with server-side middleware and client-side ProtectedRoute. API routes have proper server-side role checks (`requireAdmin`, `requireRole`). However, there are several issues at the frontend routing layer and with the sign-out flow.

**Critical Findings**: 2 | **High**: 2 | **Medium**: 2 | **Low**: 1

---

## Findings

### FINDING-AUTH-01: Coach can access admin-only pages via direct URL
- **Severity**: P1 (High)
- **Role**: Coach
- **URLs**: `/admin/settings/*`, `/admin/coaches`, `/admin/tryouts`
- **Expected**: Coach should see "Access Denied" or be redirected when accessing admin-only pages
- **Actual**: Coach can view admin-only page UI (Settings, Coaches, Tryouts) by navigating directly to the URL. The AdminNavbar correctly hides these links from coach users, but the page components themselves have no role check.
- **Root Cause**: `app/admin/layout.jsx` uses `ProtectedRoute allowedRoles={['admin', 'coach']}` which grants both roles access to ALL `/admin/*` routes. Individual admin-only pages (coaches, tryouts, settings/*) do not have additional `ProtectedRoute` wrappers with `allowedRoles={['admin']}`.
- **Mitigating Factor**: The API routes DO have proper `requireAdmin()` checks, so the coach can see the UI but cannot perform data operations (API calls return 403). This is a defense-in-depth gap, not a data exposure.
- **Screenshot**: `qa/local/evidence/auth/coach-login/02-coach-settings-access-VULN.png`
- **Fix**: Wrap admin-only page components with `<ProtectedRoute allowedRoles={['admin']}>` or create an admin-only layout group.

### FINDING-AUTH-02: Login page does not redirect already-authenticated users
- **Severity**: P2 (Medium)
- **Role**: All
- **URL**: `/login`
- **Expected**: An already-authenticated user visiting `/login` should be redirected to their dashboard
- **Actual**: The login form renders for authenticated users, showing an empty form. If browser autofill is enabled, credentials can auto-populate and potentially auto-submit.
- **Root Cause**: `LoginPage.jsx` does not check `useAuth()` session state on mount to redirect authenticated users away from the login page.
- **Screenshot**: `qa/local/evidence/auth/admin-login/01-login-page.png` (shows "A Admin" avatar in navbar while on login page)
- **Fix**: Add a `useEffect` in LoginPage that redirects authenticated users: if `user` exists, redirect admin/coach to `/admin` and parent to `/`.

### FINDING-AUTH-03: Sign-in button stuck in "Signing in..." state on 429 rate limit
- **Severity**: P2 (Medium)
- **Role**: All
- **URL**: `/login`
- **Expected**: If Neon Auth rate-limits the session check, the login form should show an error and re-enable the button
- **Actual**: The "Sign In" button remains disabled showing "Signing in..." indefinitely when the auth service returns 429 Too Many Requests. The user has no way to retry.
- **Root Cause**: In `AuthContext.jsx`, the `signIn` function fetches profile after sign-in success. When session endpoints return 429, the profile fetch hangs or fails silently. The `isSubmitting` state in LoginPage is never reset to false because the `signIn` promise doesn't resolve/reject cleanly in this edge case.
- **Console Errors**: `429 Too Many Requests` from `/api/auth/get-session`
- **Screenshot**: `qa/local/evidence/auth/admin-login/08-signin-button-stuck.png`
- **Fix**: Add timeout handling to the signIn flow. Ensure `setIsSubmitting(false)` is called in a `finally` block regardless of outcome.

### FINDING-AUTH-04: Sign-out flow has race condition with redirect
- **Severity**: P1 (High)
- **Role**: All
- **URL**: `/admin` -> Sign Out -> `/login`
- **Expected**: After sign-out, user is redirected to homepage and cannot access admin pages
- **Actual**: The sign-out calls `authClient.signOut()` then sets `window.location.href = '/'`. The redirect happens before the session is fully invalidated on the server. If the login page renders with browser-autofilled credentials, the form can auto-submit and create a new session immediately.
- **Root Cause**: In `AdminNavbar.jsx` `handleSignOut` (lines 218-231), `window.location.href = '/'` is called in a `setTimeout` of 100ms after `signOut()` resolves, but this doesn't guarantee the session cookie is cleared server-side. Additionally, `LoginPage.jsx` does not prevent auto-submission.
- **Screenshot**: `qa/local/evidence/auth/admin-login/03-admin-user-dropdown.png`
- **Fix**: Use `await signOut()` then `window.location.replace('/login')` (not just `/`). Also add `autocomplete="off"` to the login form or add a check for auto-fill on load.

### FINDING-AUTH-05: Middleware only checks authentication, not authorization
- **Severity**: P1 (High - Architectural)
- **Role**: Parent
- **URL**: `/admin/*`
- **Expected**: Middleware should reject non-admin/coach users at the edge before page rendering
- **Actual**: `middleware.ts` uses `neonAuthMiddleware` which only checks if a session exists (authentication), not the user's role (authorization). A parent user with a valid session passes through the middleware to `/admin/*` routes. The ProtectedRoute client component then shows "Access Denied".
- **Root Cause**: `neonAuthMiddleware` from `@neondatabase/auth` is auth-only. No custom role check is added in `middleware.ts`.
- **Mitigating Factor**: The client-side `ProtectedRoute` correctly blocks parent access with "Access Denied" message. The API routes also enforce role checks. The page content is never exposed.
- **Fix**: Consider adding role checking in middleware for a true server-side authorization layer. This would prevent unnecessary page renders and provide faster rejection.

### FINDING-AUTH-06: API endpoints properly enforce role-based access
- **Severity**: PASS (Positive Finding)
- **Role**: All
- **Details**: All API routes under `/api/admin/*` properly use auth middleware:
  - Admin-only endpoints (coaches, tryouts, settings, users, invites, seasons, venues, hotels, events, tournaments) use `requireAdmin()` - returns 403 for non-admin
  - Shared endpoints (teams GET, players GET, registrations GET, games GET, dashboard, practice-sessions GET) use `requireRole(['admin', 'coach'])` - allows both roles for read access
  - All write operations (POST/PUT/DELETE) use `requireAdmin()` exclusively
  - `requireAdmin()` properly checks `session.user.role !== 'admin'` and returns 403 Forbidden

### FINDING-AUTH-07: Invalid credentials error handling works correctly
- **Severity**: PASS (Positive Finding)
- **Role**: N/A
- **URL**: `/login`
- **Expected**: Error message shown, user stays on login page
- **Actual**: "Invalid email or password" error shown in red banner, user stays on `/login`, button re-enables
- **Screenshot**: `qa/local/evidence/auth/admin-login/06-invalid-credentials-error.png`
- **Additional**: Rate limiting / lockout after 5 failed attempts (30 second lockout) is implemented in `LoginPage.jsx`

---

## Navbar Visibility Audit

| Nav Link | Admin Sees | Coach Sees | Expected | Status |
|----------|-----------|-----------|----------|--------|
| Teams | Yes | Yes | Both | PASS |
| Players | Yes | Yes | Both | PASS |
| Coaches | Yes | No | Admin only | PASS |
| Tryouts | Yes | No | Admin only | PASS |
| Registrations | Yes | Yes | Both | PASS |
| Tournament Schedule | Yes | Yes | Both | PASS |
| Practices | Yes | Yes | Both | PASS |
| Settings (gear) | Yes | No | Admin only | PASS |

The AdminNavbar correctly hides admin-only links using the `isAdmin` check (line 214, 255-256, 280, 323, 334, 394).

---

## Route Protection Summary

| Route | Auth Required | Role Check (Client) | Role Check (API) | Status |
|-------|-------------|-------------------|-----------------|--------|
| `/admin/*` | Yes (middleware) | admin, coach (layout) | Varies | PARTIAL |
| `/admin/coaches` | Yes | admin, coach (layout) | requireAdmin | GAP - no page-level admin check |
| `/admin/tryouts` | Yes | admin, coach (layout) | requireAdmin | GAP - no page-level admin check |
| `/admin/settings/*` | Yes | admin, coach (layout) | requireAdmin | GAP - no page-level admin check |
| `/admin/teams` | Yes | admin, coach (layout) | requireRole(['admin','coach']) | PASS |
| `/admin/players` | Yes | admin, coach (layout) | requireRole(['admin','coach']) | PASS |
| `/profile/*` | Yes (middleware) | N/A | N/A | PASS |
| `/login` | No | N/A | N/A | PASS |

---

## Screenshots Index

| File | Description |
|------|-------------|
| `auth/admin-login/01-login-page.png` | Login page with admin already authenticated (navbar shows avatar) |
| `auth/admin-login/03-admin-user-dropdown.png` | Admin user dropdown showing name/email and sign-out |
| `auth/admin-login/04-clean-login-page.png` | Clean login page (unauthenticated) |
| `auth/admin-login/06-invalid-credentials-error.png` | Invalid credentials error message |
| `auth/admin-login/07-unauthenticated-redirect-to-login.png` | Unauthenticated /admin access redirects to /login |
| `auth/admin-login/08-signin-button-stuck.png` | Sign-in button stuck on 429 rate limit |
| `auth/admin-login/09-admin-logged-in-coaches-page.png` | Admin logged in - full navbar visible |
| `auth/coach-login/01-coach-dashboard.png` | Coach dashboard (loading state) |
| `auth/coach-login/02-coach-settings-access-VULN.png` | Coach accessing Settings/Seasons page (vulnerability) |
| `auth/coach-login/03-coach-settings-registration-VULN.png` | Coach accessing Settings/Registration + Venues (vulnerability) |
| `auth/parent-login/01-parent-access-denied.png` | Homepage redirect after session clear |

---

## Recommendations (Priority Order)

1. **Add admin-only ProtectedRoute to sensitive pages** (FINDING-AUTH-01)
   - Wrap `/admin/coaches`, `/admin/tryouts`, `/admin/settings/*` with `<ProtectedRoute allowedRoles={['admin']}>`
   - Or create a nested layout `app/admin/(admin-only)/layout.jsx` with the stricter check

2. **Fix sign-out flow race condition** (FINDING-AUTH-04)
   - Await signOut completion before redirect
   - Redirect to `/login` not `/` to avoid homepage auth confusion
   - Consider adding `autocomplete="off"` on login form

3. **Add authenticated-user redirect on login page** (FINDING-AUTH-02)
   - Check auth state on mount and redirect if already logged in

4. **Handle 429 rate limiting gracefully** (FINDING-AUTH-03)
   - Add error handling for rate-limited responses
   - Ensure button state resets in all code paths

5. **Consider server-side role checking in middleware** (FINDING-AUTH-05)
   - Enhance middleware to check roles for admin-only routes
   - This would be a defense-in-depth improvement

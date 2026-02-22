# TNE Admin Pages — QA Audit Report

**Date**: 2026-02-22
**Branch**: `audit/admin-pages`
**Environment**: localhost:3000 (Next.js dev server)
**Auditors**: auth-agent, crud-agent, uiux-agent

---

## Verdict: NOT READY

The admin dashboard has **critical blockers** that prevent normal operation of most CRUD workflows. A database schema migration gap causes cascading 500 errors across nearly all API endpoints. Additionally, there are access control gaps that allow coach-role users to view admin-only page UIs.

---

## Top 5 Blockers

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| 1 | **Schema migration gap** — `registration_open` and `registration_label` columns missing from `seasons` table in Neon DB | P0 | Cascading 500s on every API that touches `seasons` — blocks dashboard, team creation, settings, season management |
| 2 | **Coaches page infinite spinner** — `/api/admin/coaches` returns 500, page has no error fallback | P0 | Coaches management completely inaccessible |
| 3 | **Tryouts page infinite spinner** — page stuck on loading, no error fallback | P0 | Tryouts management completely inaccessible |
| 4 | **Coach role can view admin-only page UIs** — no page-level role check on `/admin/coaches`, `/admin/tryouts`, `/admin/settings/*` | P1 | Defense-in-depth gap (APIs do enforce roles, but UI is exposed) |
| 5 | **Dashboard API 500** — stat cards, toggles, and label editing all non-functional | P1 | Admin dashboard is effectively broken on load |

---

## Root Cause Analysis

**Primary root cause**: The Drizzle ORM schema (`lib/schema/seasons.ts`) defines two columns on the `seasons` table that do not exist in the actual Neon PostgreSQL database:

```
registrationOpen: boolean('registration_open').default(false)
registrationLabel: text('registration_label')
```

**Error from Neon**: `NeonDbError: column "registration_open" does not exist` (PostgreSQL error code `42703`)

**Why this cascades**: Every admin API endpoint that queries the `seasons` table (dashboard, seasons, public seasons, teams create, registration settings) fails with a 500. Since `SeasonContext` loads on every admin page via the admin layout, this failure propagates to the season selector dropdown, dashboard toggles, and team creation modal.

**Fix**: Run `npx drizzle-kit push` to sync the schema, or manually add the missing columns:
```sql
ALTER TABLE seasons ADD COLUMN registration_open BOOLEAN DEFAULT false;
ALTER TABLE seasons ADD COLUMN registration_label TEXT;
```

### Secondary Issues
- **Auth cookie `__Secure-` prefix**: Requires HTTPS but dev server runs HTTP. Causes session drops on hard navigation.
- **No error boundaries**: Pages like Coaches, Tryouts, and Settings/Users show infinite spinners instead of error messages when APIs fail.

---

## Findings by Severity

### P0 — Critical (3 findings)

#### P0-1: Schema Migration Gap Causes Cascading API 500 Errors
- **Role**: All
- **URLs**: `/api/admin/seasons`, `/api/public/seasons`, `/api/admin/dashboard`, and all endpoints querying `seasons`
- **Expected**: APIs return season data
- **Actual**: `NeonDbError: column "registration_open" does not exist` — 500 on all season-related queries
- **Impact**: Dashboard broken, team creation blocked (season is required field), registration settings empty, season selector has no options
- **Fix**: Run `npx drizzle-kit push` or add columns via SQL migration
- **Evidence**: Dev server console logs, `qa/local/evidence/admin/settings-seasons/settings-seasons-overview.png`

#### P0-2: Coaches Page Infinite Loading Spinner
- **Role**: Admin
- **URL**: `/admin/coaches`
- **Expected**: Coach management page with list/create/edit/delete
- **Actual**: Full-screen black spinner, never resolves. No error message, no timeout, no retry button.
- **Root Cause**: `/api/admin/coaches` returns 500 (likely also schema-related), and the page component has no error handling
- **Fix**: Add error boundary/fallback UI to coaches page component. Fix underlying API error.
- **Screenshot**: `qa/local/evidence/admin/coaches/coaches-overview.png`

#### P0-3: Tryouts Page Infinite Loading Spinner
- **Role**: Admin
- **URL**: `/admin/tryouts`
- **Expected**: Tryout signups list with filtering and status updates
- **Actual**: Same infinite spinner as coaches — no error fallback
- **Fix**: Same pattern as P0-2
- **Screenshot**: `qa/local/evidence/admin/tryouts/tryouts-overview.png`

---

### P1 — High (7 findings)

#### P1-1: Coach Role Can Access Admin-Only Page UIs
- **Role**: Coach
- **URLs**: `/admin/coaches`, `/admin/tryouts`, `/admin/settings/*`
- **Expected**: Coach sees "Access Denied" when navigating to admin-only pages
- **Actual**: Coach can view the page UI by navigating directly. The AdminNavbar correctly hides these links, but the page components have no role check.
- **Mitigating Factor**: API endpoints DO enforce `requireAdmin()` — coach can see UI but cannot perform data operations (403 on API calls)
- **Fix**: Add `<ProtectedRoute allowedRoles={['admin']}>` wrapper to admin-only page components, or create a nested admin-only layout group
- **Screenshot**: `qa/local/evidence/auth/coach-login/02-coach-settings-access-VULN.png`

#### P1-2: Dashboard Shows Error Banner, All Controls Disabled
- **Role**: Admin
- **URL**: `/admin`
- **Expected**: Dashboard with stat cards, toggle controls, recent activity
- **Actual**: Red error banner "Failed to load dashboard data: API Error: 500 Internal Server Error". Toggles disabled (no season), labels not editable.
- **Fix**: Resolve P0-1 (schema migration)
- **Screenshot**: `qa/local/evidence/admin/dashboard/dashboard-overview.png`

#### P1-3: Team Creation Blocked — Season Dropdown Empty
- **Role**: Admin
- **URL**: `/admin/teams` → Create Team modal
- **Expected**: Create team with name, grade, season, coach, etc.
- **Actual**: Modal opens correctly with all fields, but Season dropdown has no options. Browser validation prevents submission ("Please select an item in the list").
- **Fix**: Resolve P0-1 to populate seasons
- **Screenshot**: `qa/local/evidence/admin/teams/teams-create-result.png`

#### P1-4: Practices/Venues/Hotels APIs All Return 500
- **Role**: Admin
- **URLs**: `/admin/practices`, `/admin/venues`, `/admin/hotels`
- **Expected**: CRUD pages for practices, venues, hotels
- **Actual**: Error banner "Failed to load [X]: API Error: 500 Internal Server Error". Empty states render underneath.
- **Note**: These pages handle errors better than Coaches/Tryouts (show banner + empty state vs infinite spinner)
- **Fix**: Investigate each API — likely schema migration gaps similar to seasons
- **Screenshots**: `qa/local/evidence/admin/practices/practices-overview.png`, `venues/venues-overview.png`, `hotels/hotels-overview.png`

#### P1-5: Settings/Users Page Infinite Spinner
- **Role**: Admin
- **URL**: `/admin/settings/users`
- **Expected**: User management list with invite functionality
- **Actual**: Full-screen loading spinner. `/api/admin/users` and `/api/admin/invites` both return 500.
- **Fix**: Add error fallback, fix underlying APIs
- **Screenshot**: `qa/local/evidence/admin/settings-users/settings-users-overview.png`

#### P1-6: Sign-Out Race Condition with Redirect
- **Role**: All
- **URL**: Admin → Sign Out
- **Expected**: Session fully cleared, redirect to homepage, cannot re-access admin
- **Actual**: `window.location.href = '/'` fires 100ms after `signOut()` resolves, before server-side session is fully invalidated. Browser autofill can auto-submit login form creating a new session immediately.
- **Fix**: Use `await signOut()` then `window.location.replace('/login')`. Add `autocomplete="off"` to login form.
- **Source**: `components/AdminNavbar.jsx:218-231`

#### P1-7: Middleware Checks Authentication but Not Authorization
- **Role**: Parent
- **URL**: `/admin/*`
- **Expected**: Middleware rejects non-admin/coach users at the edge
- **Actual**: `neonAuthMiddleware` only checks session existence, not role. Parent passes through to admin pages where client-side ProtectedRoute shows "Access Denied".
- **Mitigating Factor**: Client-side ProtectedRoute and API-level role checks prevent data exposure
- **Fix**: Add role checking in `middleware.ts` for defense-in-depth
- **Source**: `middleware.ts:14-16`

---

### P2 — Moderate (4 findings)

#### P2-1: Login Page Does Not Redirect Authenticated Users
- **Role**: All
- **URL**: `/login`
- **Expected**: Authenticated user visiting /login is redirected to dashboard
- **Actual**: Login form renders with admin avatar visible in navbar. Browser autofill can populate credentials.
- **Fix**: Add `useEffect` in LoginPage to redirect if `user` exists
- **Screenshot**: `qa/local/evidence/auth/admin-login/01-login-page.png`

#### P2-2: Sign-In Button Stuck on 429 Rate Limit
- **Role**: All
- **URL**: `/login`
- **Expected**: Error message shown, button re-enabled on rate limit
- **Actual**: "Signing in..." button stays disabled indefinitely when auth service returns 429 Too Many Requests
- **Fix**: Add timeout handling, ensure `setIsSubmitting(false)` in `finally` block
- **Screenshot**: `qa/local/evidence/auth/admin-login/08-signin-button-stuck.png`

#### P2-3: Registration Settings Blocked by Missing Seasons
- **Role**: Admin
- **URL**: `/admin/settings/registration`
- **Expected**: Toggle registration open/closed, edit labels, save
- **Actual**: Page renders but shows "No seasons found. Create a season first." Save button grayed out.
- **Fix**: Resolve P0-1 to populate seasons
- **Screenshot**: `qa/local/evidence/admin/settings-registration/settings-registration-overview.png`

#### P2-4: Nav Inconsistency — Coaches/Tryouts Links Disappear
- **Role**: Admin
- **URL**: `/admin/venues`, `/admin/hotels`, `/admin/settings`
- **Expected**: All nav links visible on all admin pages
- **Actual**: Coaches and Tryouts nav links disappear on certain pages
- **Possible Cause**: `isAdmin` check in AdminNavbar may resolve differently during hydration on some routes
- **Fix**: Investigate AdminNavbar re-render behavior across routes

---

### P3 — Minor (2 findings)

#### P3-1: Registrations Page Has No Test Data
- **Role**: Admin
- **URL**: `/admin/registrations`
- **Expected**: Registration list with status workflow testing
- **Actual**: Page loads correctly with "0 of 0 registrations", filters work. Empty state is clean. No data available to test status/team assignment workflows.
- **Note**: Not a bug — just needs seed data for full testing

#### P3-2: Tournament Schedule Empty State
- **Role**: Admin
- **URL**: `/admin/games`
- **Expected**: Tournament list with CRUD
- **Actual**: "No tournaments yet" empty state with "+ Add Tournament" button. Page loads correctly. Create flow not fully tested.

---

### Positive Findings (PASS)

- **API role enforcement**: All `/api/admin/*` endpoints properly use `requireAdmin()` or `requireRole()`. Write operations (POST/PUT/DELETE) are admin-only. Coach can read shared endpoints but cannot modify data.
- **Invalid credentials handling**: Login shows "Invalid email or password" error, rate-limits after 5 failed attempts (30s lockout)
- **Navbar role visibility**: AdminNavbar correctly hides Coaches, Tryouts, Settings links for coach role (lines 255-256, 280, 323, 334, 394)
- **Parent access denied**: ProtectedRoute correctly blocks parent role from all admin pages with "Access Denied" message
- **Teams list view**: Works correctly, shows existing teams with search/filter UI
- **Players list view**: Works correctly, shows player data with search and CSV export

---

## Responsive Screenshot Coverage

All 14 admin routes captured at both viewports:

| Route | Desktop (1440x900) | Mobile (390x844) |
|-------|-------------------|------------------|
| /admin | admin-dashboard.png | admin-dashboard.png |
| /admin/teams | admin-teams.png | admin-teams.png |
| /admin/players | admin-players.png | admin-players.png |
| /admin/coaches | admin-coaches.png | admin-coaches.png |
| /admin/tryouts | admin-tryouts.png | admin-tryouts.png |
| /admin/registrations | admin-registrations.png | admin-registrations.png |
| /admin/games | admin-games.png | admin-games.png |
| /admin/practices | admin-practices.png | admin-practices.png |
| /admin/venues | admin-venues.png | admin-venues.png |
| /admin/hotels | admin-hotels.png | admin-hotels.png |
| /admin/settings | admin-settings.png | — |
| /admin/settings/users | admin-settings-users.png | admin-settings-users.png |
| /admin/settings/registration | admin-settings-registration.png | admin-settings-registration.png |
| /admin/settings/seasons | admin-settings-seasons.png | admin-settings-seasons.png |

Screenshots in: `qa/local/evidence/uiux/desktop/` and `qa/local/evidence/uiux/mobile/`

---

## Recommendations (Priority Order)

### Immediate (Fix before next deploy)
1. **Run schema migration** — `npx drizzle-kit push` to add `registration_open` and `registration_label` columns to `seasons` table. This fixes P0-1 and unblocks ~80% of admin functionality.
2. **Add error boundaries** to Coaches, Tryouts, and Settings/Users pages — replace infinite spinners with error + retry UI (P0-2, P0-3, P1-5)
3. **Add page-level admin role checks** — wrap admin-only pages with `<ProtectedRoute allowedRoles={['admin']}>` (P1-1)

### Short-term (Before MVP launch)
4. **Fix sign-out race condition** — await session invalidation before redirect (P1-6)
5. **Redirect authenticated users from /login** (P2-1)
6. **Handle 429 rate limit in login flow** — reset button state in finally block (P2-2)
7. **Investigate remaining API 500s** on practices, venues, hotels, users endpoints — may be additional missing columns/tables
8. **Seed test data** — create a default season, sample registrations, tournaments for full CRUD testing

### Medium-term
9. **Add role checking to middleware.ts** for server-side authorization (P1-7)
10. **Fix nav link inconsistency** — ensure Coaches/Tryouts appear on all admin pages (P2-4)
11. **Consider HTTPS for local dev** — resolves `__Secure-` cookie prefix issues

---

## Quality Gates Assessment

| Gate | Status | Details |
|------|--------|---------|
| No P0/P1 in core flows | FAIL | 3x P0, 7x P1 |
| Create-team flow works | FAIL | Blocked by empty season dropdown |
| Add-player flow works | PARTIAL | Page loads, but not fully tested |
| Role access control secure | FAIL | Coach can view admin-only page UIs (P1-1) |
| No broken-link clusters | PASS | No dead-end pages found |

**Verdict: NOT READY** — Fix P0-1 (schema migration) first, then re-audit.

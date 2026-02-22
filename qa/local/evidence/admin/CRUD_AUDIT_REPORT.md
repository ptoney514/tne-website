# Admin CRUD Workflows Audit Report

**Date**: 2026-02-22
**Auditor**: crud-agent
**Environment**: localhost:3000 (dev server)
**Login**: admin@tnebasketball.com / TestAdmin123!

---

## Executive Summary

The admin dashboard is severely impacted by two systemic issues:
1. **Multiple API endpoints returning 500 Internal Server Error** -- affects dashboard stats, seasons, practices, venues, hotels, users, invites, and coaches APIs
2. **Fragile session management** -- hard page refreshes/navigations frequently lose the auth session; auth API rate-limits (429) under moderate use

These blockers prevent thorough CRUD testing on most pages. Where pages did load, I tested create/edit/delete flows.

---

## Findings by Page

### 1. Dashboard (/admin)
**Status**: Partially functional
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/dashboard/dashboard-overview.png`

- **Bug**: Red error banner: "Failed to load dashboard data: API Error: 500 Internal Server Error"
- API `/api/admin/dashboard` returns 500 consistently
- API `/api/public/seasons` and `/api/admin/seasons` both return 500
- **Control Panel toggles (Tryouts/Registration)**: Disabled because no season is selected, and season selector has no options due to API 500
- **Label editing**: Edit buttons are disabled (same root cause)
- **Overview stat cards**: Render but show 0 for all counts (may be correct or may be due to failed fetch)
- **Quick Actions (Upload/Download)**: Buttons render, not tested
- **Recent Activity / Upcoming Events**: Show "No recent activity" / "No upcoming events"

### 2. Teams (/admin/teams)
**Status**: Partially functional
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/teams/teams-list.png`, `teams-create-result.png`

- **List view**: Works -- shows 3 existing teams (6th Grade Girls, 7th Grade Elite, 8th Grade Select)
- **Search/filter bar**: Renders with Grade, Gender, Program Tier, Tags filters
- **Create Team**: Opens modal correctly with all fields (name, grade, gender, season, coach, practice schedule, fees)
  - **BLOCKED**: Season dropdown has no selectable options (only "Select Season" placeholder) due to `/api/admin/seasons` returning 500
  - Browser validation fires: "Please select an item in the list" on the Season field
  - **Result**: Cannot create any team until Seasons API is fixed
- **Edit Team**: Not testable (row click navigation was inconsistent)
- **Delete Team**: Row action button exists (icon visible in last column) but not tested due to session instability

### 3. Players (/admin/players)
**Status**: Functional (with caveats)
**Severity**: P2
**Screenshot**: `qa/local/evidence/admin/players/players-overview.png` (captured Registrations page due to nav mismatch)

- Page loaded when reached via client-side nav, showed 1 player (Michael Smith)
- Has "Add Player" button, search, team filter dropdown, CSV export icon
- Player table has: Name, Grade, Team, Parent/Guardian, Phone, Payment columns
- **Issue**: Quick filters and bulk actions not fully tested due to session instability
- **Note**: From earlier snapshot, player row is clickable (navigated to detail view)

### 4. Coaches (/admin/coaches)
**Status**: BROKEN
**Severity**: P0
**Screenshot**: `qa/local/evidence/admin/coaches/coaches-overview.png`

- **Page stuck on "Loading..." spinner indefinitely** (black background with spinner)
- Console shows: `/api/admin/coaches` returns 500
- **No admin nav links for Coaches or Tryouts visible** on some page loads (e.g., Venues/Hotels nav bar only shows: Teams, Players, Registrations, Tournament Schedule, Practices)
- CRUD operations not testable

### 5. Tryouts (/admin/tryouts)
**Status**: BROKEN
**Severity**: P0
**Screenshot**: `qa/local/evidence/admin/tryouts/tryouts-overview.png`

- **Page stuck on "Loading..." spinner indefinitely** (same as Coaches)
- No data rendered, no interactive elements accessible
- CRUD operations not testable

### 6. Registrations (/admin/registrations)
**Status**: Functional (empty state)
**Severity**: P3
**Screenshot**: `qa/local/evidence/admin/players/players-overview.png` (actually shows Registrations)

- Page loads correctly showing "0 of 0 registrations"
- Has search field, status/payment/team filter dropdowns
- Quick filters: Pending Review (0), Unpaid (0), Unassigned (0)
- **No "Add" button** (registrations come from public signup -- this is expected)
- Cannot test status workflow or team assignment without registration data
- Skeleton loading rows visible (cosmetic -- no data to display)

### 7. Tournament Schedule (/admin/games)
**Status**: Functional (empty state)
**Severity**: P3
**Screenshot**: `qa/local/evidence/admin/games/games-overview.png`

- Page loads correctly: "No tournaments yet - Create a tournament, then assign teams to it"
- **"+ Add Tournament" button** present (both in header and empty state)
- Create flow not fully tested due to session issues, but the modal button was clickable
- Delete/edit not testable without existing data

### 8. Practices (/admin/practices)
**Status**: Partially functional
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/practices/practices-overview.png`

- Page renders but shows error: "Failed to load practice schedules: API Error: 500 Internal Server Error"
- `/api/admin/practice-sessions` returns 500
- "No practice sessions yet" empty state renders underneath the error
- **"+ Add Practice" button** present but create flow not tested

### 9. Venues (/admin/venues)
**Status**: Partially functional
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/venues/venues-overview.png`

- Page renders but shows error: "Failed to load venues: API Error: 500 Internal Server Error"
- `/api/admin/venues` returns 500 (visible in error banner)
- "No venues yet" empty state renders
- **"+ Add Venue" button** present
- **Nav inconsistency**: Coaches and Tryouts nav links are missing on this page

### 10. Hotels (/admin/hotels)
**Status**: Partially functional
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/hotels/hotels-overview.png`

- Page renders but shows error: "Failed to load hotels: API Error: 500 Internal Server Error"
- `/api/admin/hotels` returns 500
- "No hotels yet" empty state renders
- **"+ Add Hotel" button** present
- **Nav inconsistency**: Same missing Coaches/Tryouts links

### 11. Settings > User Management (/admin/settings/users)
**Status**: BROKEN
**Severity**: P1
**Screenshot**: `qa/local/evidence/admin/settings-users/settings-users-overview.png`

- **Page stuck on "Loading..." spinner** (black background)
- Console errors: `/api/admin/users` returns 500, `/api/admin/invites` returns 500
- Cannot test invite modal or user list
- **Note**: Navigating to `/admin/settings/users` sometimes redirected to `/admin` (inconsistent routing)

### 12. Settings > Registration (/admin/settings/registration)
**Status**: Partially functional
**Severity**: P2
**Screenshot**: `qa/local/evidence/admin/settings-registration/settings-registration-overview.png`

- Page renders with left sidebar navigation (Settings menu)
- Shows "Select Season to Configure" with dropdown "Select a season..."
- Message: "No seasons found. Create a season first."
- **Save Changes button** present but grayed out
- Cannot test toggle/label/save without a season
- Sidebar shows: User Management, Registration (active), Roles & Permissions (Soon), Organization (Soon), Seasons, Locations (Soon), Payment Settings (Soon), Email Templates (Soon)

### 13. Settings > Seasons (/admin/settings/seasons)
**Status**: Partially functional
**Severity**: P0 (root cause of cascading failures)
**Screenshot**: `qa/local/evidence/admin/settings-seasons/settings-seasons-overview.png`

- Page renders but shows error: "Failed to load seasons: API Error: 500 Internal Server Error"
- `/api/admin/seasons` GET returns 500
- "No seasons yet - Create your first season to get started"
- **"+ Create Season" button** present -- this is the critical button to fix cascading failures
- Season creation was not tested because the page loaded in error state
- **This is the ROOT CAUSE of most other issues** -- without seasons, dashboard toggles are disabled, team creation is blocked, registration settings are empty

---

## Systemic Issues

### S1. API 500 Errors Across All Admin Endpoints (P0)
**Affected APIs**: `/api/admin/dashboard`, `/api/admin/seasons`, `/api/public/seasons`, `/api/admin/coaches`, `/api/admin/practice-sessions`, `/api/admin/venues`, `/api/admin/hotels`, `/api/admin/users`, `/api/admin/invites`

**Root cause hypothesis**: All routes use `db` from `@/lib/db.ts` which connects via `neon(process.env.DATABASE_URL)`. The 500 errors on ALL database-touching endpoints suggest either:
- DATABASE_URL is misconfigured or the Neon project is in a suspended/sleeping state
- Database schema mismatch -- tables referenced in queries may not exist
- Missing migration -- `seasons`, `venues`, `hotels`, `practice_sessions`, etc. tables may not be created

**Impact**: Nearly all CRUD workflows are non-functional

### S2. Session Fragility / Auth Rate Limiting (P1)
- Auth cookies use `__Secure-` prefix with `secure: true` -- on `localhost` (HTTP), these may not persist correctly
- `sameSite: "None"` setting compounds the issue
- Full page navigations (`page.goto()`, `window.location.href`) frequently drop the session
- Client-side Next.js link navigation preserves the session more reliably
- Auth API `/api/auth/get-session` returns 429 (Too Many Requests) after ~10-15 rapid requests
- Login sometimes redirects to `/` instead of `/admin`

### S3. Inconsistent Admin Nav Links (P2)
- Main admin nav includes: Teams, Players, Coaches, Tryouts, Registrations, Tournament Schedule, Practices
- On some pages (Venues, Hotels, Settings), Coaches and Tryouts nav links disappear
- Settings pages are accessible only via gear icon, not from the main nav

### S4. "Loading..." Infinite Spinner (P1)
- Pages that rely on failing APIs (Coaches, Tryouts, Settings/Users) get stuck on a full-screen black "Loading..." spinner
- No timeout or error fallback -- user sees spinner forever
- Other pages (Venues, Hotels, Practices) handle the error better by showing an error banner + empty state

---

## Summary Table

| Page | Route | Loads? | CRUD Testable? | Severity | Key Issue |
|------|-------|--------|----------------|----------|-----------|
| Dashboard | /admin | Yes | No (toggles disabled) | P1 | API 500 + no season |
| Teams | /admin/teams | Yes | Blocked (no seasons) | P1 | Create blocked by season |
| Players | /admin/players | Yes | Partially | P2 | Needs deeper testing |
| Coaches | /admin/coaches | No | No | P0 | Infinite spinner |
| Tryouts | /admin/tryouts | No | No | P0 | Infinite spinner |
| Registrations | /admin/registrations | Yes | No data | P3 | Empty state works |
| Tournament Schedule | /admin/games | Yes | Not tested | P3 | Empty state works |
| Practices | /admin/practices | Partial | No | P1 | API 500 + error banner |
| Venues | /admin/venues | Partial | No | P1 | API 500 + error banner |
| Hotels | /admin/hotels | Partial | No | P1 | API 500 + error banner |
| Settings/Users | /admin/settings/users | No | No | P1 | Infinite spinner |
| Settings/Registration | /admin/settings/registration | Yes | Blocked | P2 | No seasons available |
| Settings/Seasons | /admin/settings/seasons | Partial | Not tested | P0 | Root cause API 500 |

---

## Recommendations (Priority Order)

1. **Fix database connection / run migrations** -- Resolve why ALL `/api/admin/*` endpoints return 500. This likely fixes 80% of issues.
2. **Add error boundaries to Coaches, Tryouts, Settings/Users pages** -- Replace infinite "Loading..." spinner with an error message + retry button
3. **Fix session persistence on localhost** -- Consider removing `__Secure-` prefix for development, or ensure HTTPS is used
4. **Add rate-limit retry logic** -- Auth `get-session` should not 429 under normal admin use
5. **Create a default season** -- Once APIs work, ensure a seed season exists so dashboard/team creation flows are unblocked
6. **Stabilize nav links** -- Ensure Coaches/Tryouts links appear on all admin pages

# UI/UX Findings Report

**Date**: 2026-02-22
**Auditor**: uiux-agent + team-lead
**Viewport Coverage**: Desktop (1440x900) + Mobile (390x844) for all 14 admin routes

---

## Screenshot Coverage

### Desktop (14/14 routes captured)
All desktop screenshots saved to `qa/local/evidence/uiux/desktop/`:
- admin-dashboard.png, admin-teams.png, admin-players.png, admin-coaches.png
- admin-tryouts.png, admin-registrations.png, admin-games.png, admin-practices.png
- admin-venues.png, admin-hotels.png, admin-settings.png
- admin-settings-users.png, admin-settings-registration.png, admin-settings-seasons.png

### Mobile (13/14 routes captured)
All mobile screenshots saved to `qa/local/evidence/uiux/mobile/`:
- admin-dashboard.png, admin-teams.png, admin-players.png, admin-coaches.png
- admin-tryouts.png, admin-registrations.png, admin-games.png, admin-practices.png
- admin-venues.png, admin-hotels.png
- admin-settings-users.png, admin-settings-registration.png, admin-settings-seasons.png
- **Missing**: admin-settings.png (settings hub page -- mobile)

---

## Findings by Severity

### P1 -- High

#### UIUX-1: Three pages show infinite spinner with no error fallback
- **Pages**: /admin/coaches, /admin/tryouts, /admin/settings/users
- **Issue**: When API returns 500, these pages display a full-screen black loading spinner that never resolves. No error message, no timeout, no retry button.
- **Contrast**: Pages like /admin/practices, /admin/venues, /admin/hotels correctly show a red error banner + empty state when APIs fail.
- **Impact**: Users think the page is loading and wait indefinitely.
- **Fix**: Add error handling to these page components. Use the same pattern as practices/venues/hotels (error banner + retry).
- **Screenshots**: `evidence/uiux/desktop/admin-coaches.png`, `admin-tryouts.png`, `admin-settings-users.png`

### P2 -- Moderate

#### UIUX-2: Nav links inconsistently appear across admin pages
- **Issue**: On /admin/venues, /admin/hotels, and /admin/settings, the Coaches and Tryouts nav links disappear from the AdminNavbar, even when logged in as admin.
- **Expected**: All nav links visible on all admin pages for admin role.
- **Possible Cause**: AdminNavbar `isAdmin` check (line 214) may evaluate differently during hydration on some routes, or profile data may not be loaded yet when nav renders.

#### UIUX-3: Dashboard error state shows red banner above zero-state cards
- **Issue**: Dashboard simultaneously shows error banner "Failed to load dashboard data" AND renders stat cards with 0 values. Confusing -- user cannot tell if 0 is real or due to error.
- **Expected**: Either show error state OR show data, not both.
- **Fix**: When dashboard API fails, show an error state with retry button instead of rendering misleading zero-value stat cards.

#### UIUX-4: Settings sidebar "Coming Soon" items not visually distinct enough
- **Issue**: Settings sidebar lists items like "Roles & Permissions (Soon)", "Organization (Soon)", "Locations (Soon)", etc. These have "(Soon)" text but are styled similarly to active links.
- **Expected**: Disabled items should be visually distinct (grayed out, no hover effect, no cursor pointer)

### P3 -- Minor

#### UIUX-5: Mobile hamburger menu requires additional interactive testing
- **Issue**: Mobile screenshots captured page content but hamburger menu open/close, scroll handling, and overlay dismissal were not interactively tested.
- **Recommendation**: Manual test of mobile menu on actual device or headed browser.

#### UIUX-6: Missing mobile screenshot for Settings hub
- **Issue**: `/admin/settings` hub page was not captured at mobile viewport. All other 13 routes have both desktop and mobile coverage.

---

## Console/Network Errors Summary

All admin routes that query the database produce 500 errors due to the `seasons` table schema migration gap. See `qa/local/console-network-errors.csv` for the full list.

Key patterns:
- **14 unique 500 errors** across 11 admin routes
- **All trace to the same root cause**: `NeonDbError: column "registration_open" does not exist`
- **429 rate limiting** on `/api/auth/get-session` after rapid page navigation

---

## Broken Links

No broken internal links discovered. All navigation links in AdminNavbar and Settings sidebar resolve to valid pages.

---

## Responsive Design Notes

- **Desktop (1440x900)**: All pages render with proper layout. AdminNavbar is sticky with full nav links visible. Tables and card grids use available width well.
- **Mobile (390x844)**: Pages render with hamburger menu. Content reflows to single column appropriately.
- **No critical layout breakages** observed in screenshots at either viewport.

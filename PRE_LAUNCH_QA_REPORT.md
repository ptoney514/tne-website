# Pre-Launch QA Report

> **Historical Document:** This report was generated on January 25, 2026, before the migration from Vite SPA + Supabase to Next.js App Router + Neon + Better Auth. File paths, architecture references, and some issues described below are outdated. Retained as a point-in-time snapshot.

**Date:** January 25, 2026
**Project:** TNE United Express Website
**Status:** Most Issues Fixed - Ready for Review

---

## Executive Summary

| Category | Status | Critical Issues | Warnings |
|----------|--------|-----------------|----------|
| Security | ✅ Pass | 0 | 1 |
| SEO | ✅ Fixed | 0 | 0 |
| Accessibility | ✅ Fixed | 0 | 0 |
| Links | ⚠️ Warning | 20 placeholder links | 0 |
| Forms | ⚠️ Warning | HTML forms lack handlers | 5 |
| JavaScript | ✅ Fixed | 0 | 0 |
| Dependencies | ⚠️ Warning | 1 high-severity vulnerability | 0 |
| Build | ✅ Pass (with warning) | 0 | 1 |
| Linting | ✅ Pass | 0 | 2 |

## ✅ FIXED Issues

The following issues have been addressed:

1. **Error Boundary** - Added `ErrorBoundary.jsx` component wrapping all routes
2. **SEO Meta Tags** - Added meta descriptions, Open Graph, and Twitter cards to all 9 HTML pages
3. **ARIA Labels** - Added labels to mobile menu buttons and social media links
4. **Image Alt Attributes** - Fixed empty alt attributes on Instagram gallery images
5. **Email Validation** - Improved regex pattern to require 2+ character TLD
6. **Placeholder Phone** - Replaced 555 placeholder with real contact number

---

## 🔴 CRITICAL - Fix Before Launch

### 1. NPM Dependency Vulnerability (HIGH SEVERITY)

**Package:** `xlsx` (SheetJS)
**Issues:**
- Prototype Pollution vulnerability (GHSA-4r6h-8v6p-xvw6)
- Regular Expression DoS vulnerability (GHSA-5pgg-2g8v-p4x9)

**Status:** No fix available from maintainer

**Recommendation:**
```bash
# Option 1: Replace xlsx with a maintained alternative
npm uninstall xlsx
npm install exceljs  # or sheetjs-ce (community edition)

# Option 2: If xlsx is admin-only, document the risk and restrict access
```

**Impact:** High - Could allow malicious Excel files to crash the app or execute prototype pollution attacks

---

### 2. ~~Missing Error Boundary in React App~~ ✅ FIXED

**File:** `react-app/src/App.jsx`
**Status:** Fixed - Added `ErrorBoundary.jsx` component that wraps all routes and displays a user-friendly error page with refresh/home options.

---

### 3. Static HTML Forms Have No Submission Handler

**Files Affected:**
- `src/pages/tryouts.html` - Form has no action/JavaScript handler
- `src/pages/contact.html` - Form only shows alert(), no backend submission

**Issue:** Forms will not actually submit data anywhere. Users will think they registered but data is lost.

**Fix Required:** Connect forms to API endpoints or redirect users to React app forms.

---

## 🟠 HIGH PRIORITY - Remaining Issues

### ~~4. SEO Meta Tags Missing~~ ✅ FIXED

All 9 HTML pages now have complete SEO meta tags including description, Open Graph, and Twitter cards.

---

### ~~5. Accessibility Issues~~ ✅ FIXED

- Added ARIA labels to all mobile menu buttons (open/close)
- Added ARIA labels to all social media icon links in footers
- Fixed empty alt attributes on Instagram gallery images
- Added role="presentation" to decorative hero backgrounds

---

### 4. Placeholder Links (href="#") - STILL NEEDS ATTENTION

**Files:**
- index.html, teams.html, schedule.html, tryouts.html
- about.html, contact.html, training.html, merch.html

**Missing Tags:**
```html
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta name="twitter:card" content="summary_large_image">
```

**Impact:** Poor search engine rankings, bad social media share previews

---

### 5. Accessibility Issues

#### Missing ARIA Labels on Interactive Elements (40+ instances)

**Pattern Found In All HTML Pages:**
```html
<!-- Mobile Menu Button - NEEDS FIX -->
<button id="mobile-menu-btn" class="md:hidden...">
  <i data-lucide="menu" class="w-5 h-5"></i>
</button>

<!-- Fixed Version -->
<button id="mobile-menu-btn" aria-label="Open navigation menu" class="md:hidden...">
```

**Elements Needing Labels:**
- Mobile menu open/close buttons
- Carousel navigation buttons
- Social media links in footer
- Icon-only action buttons

#### Empty Alt Attributes on Images

**Files:**
- `schedule.html:127` - Hero background image
- `about.html:109` - Hero background image
- `training.html:112` - Hero background image
- `index.html:715-749` - Instagram feed images

**Fix:** Either add descriptive alt text or use `role="presentation"` for decorative images.

---

### 6. DOM Null Reference Risk

**File:** `src/pages/index.html` (lines 890-892)

**Current Code:**
```javascript
mobileMenuBtn.addEventListener('click', openMobileMenu);
mobileMenuClose.addEventListener('click', closeMobileMenu);
mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
```

**Issue:** No null check - will throw error if elements don't exist.

**Fix:**
```javascript
mobileMenuBtn?.addEventListener('click', openMobileMenu);
mobileMenuClose?.addEventListener('click', closeMobileMenu);
mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);
```

---

### 7. Weak Email Validation

**Files Affected:**
- `react-app/src/components/registration/wizardValidation.js:23`
- `react-app/src/hooks/useContactForm.js:32`
- `react-app/src/components/admin/InviteUserModal.jsx:49`

**Current Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Issue:** Too permissive, accepts invalid emails like `test@com` or `@example.`

**Recommendation:** Use HTML5 `type="email"` validation or a proper email validation library.

---

### 8. Placeholder Phone Number

**File:** `src/pages/tryouts.html:559`

**Current:** `tel:+15551234567` displayed as "(555) 123-4567"

**Issue:** 555 is an invalid US area code. Replace with actual contact number.

---

## 🟡 MEDIUM PRIORITY - Quality Improvements

### 9. Touch Targets Too Small

**WCAG Minimum:** 48x48px
**Current:** Many buttons use `p-2` (8px padding) making them ~32px

**Files Affected:**
- Mobile menu buttons in all HTML pages
- Admin action buttons in `RosterTableRow.jsx`
- Close buttons in `MobileDrawer.jsx`

**Fix:** Add minimum sizing: `min-h-12 min-w-12`

---

### 10. Admin Roster Table Not Mobile-Responsive

**File:** `react-app/src/components/admin/EnhancedRosterTable.jsx`

**Issue:** 6-column table causes horizontal scroll on mobile. Admin users managing rosters on phones will have poor experience.

**Fix:** Implement card-based layout for mobile breakpoints.

---

### 11. localStorage Access Without Try-Catch

**Files:**
- `react-app/src/components/chat/ChatWidget.jsx:64,76`
- `react-app/src/components/chat/ChatPanel.jsx:57,204-205`

**Issue:** localStorage throws errors in private browsing mode.

**Fix:** Wrap in try-catch:
```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  console.warn('localStorage unavailable');
}
```

---

### 12. Turnstile CAPTCHA Falls Back to Test Key

**File:** `react-app/src/components/registration/ui/Turnstile.jsx:26`

**Issue:** If `VITE_TURNSTILE_SITE_KEY` env var is missing, falls back to test key that always passes.

**Risk:** If production environment variable is misconfigured, CAPTCHA is bypassed.

**Fix:** Error in production if key not configured.

---

### 13. Large JavaScript Bundle

**Build Output Warning:**
```
dist/assets/index-B7iL1Sip.js  1,519.58 kB (400.27 kB gzipped)
```

**Impact:** Slower initial page load, especially on mobile networks.

**Recommendations:**
1. Implement code splitting with `React.lazy()` for routes
2. Move admin pages to separate chunks
3. Consider dynamic imports for xlsx and other large libraries

---

### 14. Placeholder Links (href="#")

**Count:** 20 placeholder links

**Primary Locations:**
- `schedule.html` - "View team" buttons, tournament details
- `teams.html` - "Open team details" buttons
- `tryouts.html` - "Terms and conditions" link
- Footer social links

**Action:** Either implement functionality or link to React app equivalents.

---

## 🟢 LOW PRIORITY - Nice to Have

### 15. ESLint Warnings (2)

**Files:**
- `Turnstile.jsx:37` - setState called synchronously in useEffect
- `AdminTournamentDetailPage.jsx:686` - setState called synchronously in useEffect

**Impact:** Performance (causes extra renders), not functionality.

---

### 16. Scroll Performance

**File:** `src/pages/index.html:895-900`

**Issue:** Parallax scroll listener fires without throttling/debouncing.

**Fix:** Add requestAnimationFrame or throttle function.

---

### 17. React Router Vulnerability (FIXED)

**Status:** ✅ Fixed via `npm audit fix`

Updated `react-router` and `react-router-dom` to patched versions.

---

## Pre-Launch Checklist

### Must Complete:
- [ ] Fix or replace `xlsx` package vulnerability
- [ ] Add Error Boundary to React app
- [ ] Connect HTML forms to backend or redirect to React app
- [ ] Add meta descriptions to all HTML pages
- [ ] Replace placeholder phone number

### Should Complete:
- [ ] Add ARIA labels to all interactive elements
- [ ] Add alt text to images
- [ ] Fix email validation patterns
- [ ] Add null checks to DOM manipulation
- [ ] Wrap localStorage calls in try-catch

### Nice to Have:
- [ ] Code-split React bundle
- [ ] Add throttling to scroll listeners
- [ ] Implement mobile-friendly admin tables
- [ ] Increase touch target sizes

---

## Environment Setup Notes

Before running tests locally:
```bash
# Install Playwright browsers
npx playwright install

# Set required environment variables
cp .env.example .env
# Edit .env with your actual keys

# Run full validation
npm run pr-check
```

---

## Summary

The site is **generally well-built** with good security practices, no hardcoded secrets, and proper architecture. However, there are several **SEO, accessibility, and form handling issues** that should be addressed before public launch.

**Estimated effort to fix critical issues:** 2-4 hours
**Estimated effort to fix all high-priority issues:** 1-2 days

---

*Report generated by Claude Code Pre-Launch QA*

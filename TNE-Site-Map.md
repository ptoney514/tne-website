# TNE United Express - Site Map

**Project:** TNE United Express Website Redesign  
**Last Updated:** December 21, 2025  
**Status:** In Progress

---

## Overview

This document tracks all pages for the TNE United Express website redesign, covering both the public-facing website and the admin portal.

**Priority Legend:**
- 🔴 **Priority** - Phase 1 (Must have for launch)
- 🟡 **Phase 2** - Secondary priority
- ⚪ **Phase 3** - Future enhancement

---

## Public Website

### 1. Homepage 🔴
**Status:** ✅ Wireframe Complete  
**URL:** `/`

**Sections:**
- [x] Navigation (fixed header)
- [x] Hero (badge logo, headline, tagline, dual CTAs)
- [x] Stats (4-column: Players, D1 Alumni, Coaches, Teams)
- [x] Programs Grid (Boys Express, Girls Express, Skills Camp)
- [x] Upcoming Events (split: Tournaments + Tryouts)
- [x] CTA Banner (registration push)
- [x] Footer (4-column with social)

**Optional Sections (Phase 2):**
- [ ] Parent Testimonials carousel
- [ ] Alumni Spotlight (D1 players)
- [ ] Partners/Sponsors logo row
- [ ] Instagram Feed embed

---

### 2. Teams 🔴
**Status:** 🔲 Not Started  
**URL:** `/teams`

**Layout:** Split-view (team roster left, tournament schedule right)

**Sections:**
- [ ] Page header with filter bar
- [ ] Team list (left panel - 60%)
- [ ] Tournament schedule (right panel - 40%)
- [ ] Filter controls (grade, gender, season)

**Sub-pages:**
- [ ] `/teams/[team-slug]` - Team Detail
- [ ] `/teams/[team-slug]/roster` - Full Roster View
- [ ] `/teams/[team-slug]/schedule` - Practice Schedule

---

### 3. Tournaments 🔴
**Status:** 🔲 Not Started  
**URL:** `/tournaments`

**Sections:**
- [ ] Page header
- [ ] Upcoming tournaments (timeline view)
- [ ] Past results archive
- [ ] Filter by team/grade

**Sub-pages:**
- [ ] `/tournaments/[tournament-slug]` - Tournament Detail
- [ ] `/tournaments/[tournament-slug]/register` - Registration Form
- [ ] `/tournaments/[tournament-slug]/brackets` - Brackets/Results

---

### 4. Tryouts / Registration 🔴
**Status:** 🔲 Not Started  
**URL:** `/tryouts`

**Sections:**
- [ ] Tryout schedule/dates
- [ ] What to expect
- [ ] Registration form
- [ ] Payment integration
- [ ] FAQ accordion

**Sub-pages:**
- [ ] `/tryouts/register` - Registration Form
- [ ] `/tryouts/payment` - Payment Portal

---

### 5. News & Updates 🟡
**Status:** 🔲 Not Started  
**URL:** `/news`

**Sections:**
- [ ] Featured article hero
- [ ] Article grid/list
- [ ] Category filters
- [ ] Search

**Sub-pages:**
- [ ] `/news/[article-slug]` - Article Detail
- [ ] `/news/photos` - Photo Gallery

---

### 6. About 🟡
**Status:** 🔲 Not Started  
**URL:** `/about`

**Sections:**
- [ ] Mission statement
- [ ] Our story/history
- [ ] Coaching philosophy
- [ ] Facilities info

**Sub-pages:**
- [ ] `/about/coaches` - Coach Profiles
- [ ] `/about/facilities` - Facilities Gallery

---

### 7. Contact 🟡
**Status:** 🔲 Not Started  
**URL:** `/contact`

**Sections:**
- [ ] Contact form
- [ ] Location/address
- [ ] Phone/email
- [ ] Social links
- [ ] Map embed

---

### 8. Shop ⚪
**Status:** 🔲 Future Phase  
**URL:** `/shop`

**Notes:** Team gear, apparel, merchandise. May integrate with external platform (Shopify, etc.)

---

## Admin Portal

### 1. Dashboard 🔴
**Status:** 🔲 Not Started  
**URL:** `/admin`

**Sections:**
- [ ] Overview stats (teams, players, registrations)
- [ ] Quick actions
- [ ] Recent activity feed
- [ ] Alerts/notifications
- [ ] Upcoming events summary

---

### 2. Team Management 🔴
**Status:** 🔲 Not Started  
**URL:** `/admin/teams`

**Sections:**
- [ ] Team list/grid view
- [ ] Add new team
- [ ] Bulk actions

**Sub-pages:**
- [ ] `/admin/teams/new` - Create Team
- [ ] `/admin/teams/[id]/edit` - Edit Team
- [ ] `/admin/teams/[id]/roster` - Manage Roster
- [ ] `/admin/teams/[id]/schedule` - Practice Schedule
- [ ] `/admin/teams/[id]/coaches` - Assign Coaches

---

### 3. Tournament Manager 🔴
**Status:** 🔲 Not Started  
**URL:** `/admin/tournaments`

**Sections:**
- [ ] Tournament list
- [ ] Create tournament
- [ ] Registration tracking

**Sub-pages:**
- [ ] `/admin/tournaments/new` - Create Tournament
- [ ] `/admin/tournaments/[id]/edit` - Edit Tournament
- [ ] `/admin/tournaments/[id]/registrations` - View Registrations
- [ ] `/admin/tournaments/[id]/brackets` - Bracket Builder
- [ ] `/admin/tournaments/[id]/results` - Enter Results

---

### 4. Player Database 🟡
**Status:** 🔲 Not Started  
**URL:** `/admin/players`

**Sections:**
- [ ] Player search/list
- [ ] Add player
- [ ] Import/export

**Sub-pages:**
- [ ] `/admin/players/new` - Add Player
- [ ] `/admin/players/[id]` - Player Profile
- [ ] `/admin/players/[id]/edit` - Edit Player
- [ ] `/admin/players/[id]/history` - Team History

---

### 5. Coach Management 🟡
**Status:** 🔲 Not Started  
**URL:** `/admin/coaches`

**Sections:**
- [ ] Coach list
- [ ] Add coach
- [ ] Certifications tracking
- [ ] Team assignments

---

### 6. Content Manager 🟡
**Status:** 🔲 Not Started  
**URL:** `/admin/content`

**Sections:**
- [ ] Posts list
- [ ] Create/edit post
- [ ] Media library
- [ ] Announcements

**Sub-pages:**
- [ ] `/admin/content/new` - Create Post
- [ ] `/admin/content/[id]/edit` - Edit Post
- [ ] `/admin/content/media` - Media Library
- [ ] `/admin/content/announcements` - Manage Announcements

---

### 7. Payments 🟡
**Status:** 🔲 Not Started  
**URL:** `/admin/payments`

**Sections:**
- [ ] Transaction history
- [ ] Outstanding balances
- [ ] Issue refunds
- [ ] Generate invoices
- [ ] Payment reports

---

### 8. Settings ⚪
**Status:** 🔲 Not Started  
**URL:** `/admin/settings`

**Sub-pages:**
- [ ] `/admin/settings/users` - User Management
- [ ] `/admin/settings/roles` - Role Permissions
- [ ] `/admin/settings/site` - Site Configuration
- [ ] `/admin/settings/integrations` - Third-party Integrations

---

## Wireframe Progress Tracker

| Page | Priority | Wireframe | Mobile | Notes |
|------|----------|-----------|--------|-------|
| Homepage | 🔴 | ✅ | 🔲 | Complete - see `basketball_wireframes.html` |
| Teams | 🔴 | 🔲 | 🔲 | Split-view layout |
| Tournaments | 🔴 | 🔲 | 🔲 | Timeline view |
| Tryouts | 🔴 | 🔲 | 🔲 | Form-heavy |
| Admin Dashboard | 🔴 | 🔲 | 🔲 | Stats + quick actions |
| Admin Teams | 🔴 | 🔲 | 🔲 | CRUD interface |
| Admin Tournaments | 🔴 | 🔲 | 🔲 | Registration management |
| News | 🟡 | 🔲 | 🔲 | Blog layout |
| About | 🟡 | 🔲 | 🔲 | Content pages |
| Contact | 🟡 | 🔲 | 🔲 | Form + map |
| Admin Players | 🟡 | 🔲 | 🔲 | Database view |
| Admin Coaches | 🟡 | 🔲 | 🔲 | Profile management |
| Admin Content | 🟡 | 🔲 | 🔲 | CMS interface |
| Admin Payments | 🟡 | 🔲 | 🔲 | Transaction tables |
| Shop | ⚪ | 🔲 | 🔲 | Future phase |
| Admin Settings | ⚪ | 🔲 | 🔲 | Future phase |

---

## Design System Reference

**Colors:**
- Primary Maroon: `#8B1F3A`
- Accent Red: `#E31837`
- Black: `#000000`
- Charcoal: `#1A1A1A`
- White: `#FFFFFF`

**Typography:**
- Headlines: Bebas Neue (ALL CAPS)
- Body: Inter

**Key Documents:**
- `TNE-United-Express-Mood-Board.md`
- `TNE-Design-Specification-Figma.md`
- `TNE-Figma-Implementation-Guide.md`

---

## Notes

*Add any project notes, decisions, or context here as we progress.*

- Homepage wireframe uses the split-view concept from earlier exploration
- Parents need quick access to: team schedules, tournament dates, practice times
- Admin portal prioritizes team and tournament management for coaches

---

*Document maintained during wireframe sessions. Update status as pages are completed.*

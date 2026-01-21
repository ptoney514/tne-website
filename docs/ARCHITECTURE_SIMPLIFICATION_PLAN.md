# TNE Website Architecture Simplification Plan

**Date:** January 20, 2025
**Status:** Draft - Pending Review
**Authors:** Development Team

---

## Executive Summary

This document proposes simplifying the TNE United Express website architecture by moving from a Supabase-powered backend to a static file-based approach. The goal is to reduce complexity, eliminate unnecessary infrastructure, and accelerate time to market while still providing the Club Director with an easy content management experience.

---

## Why This Change?

### The Core Realization

After building out significant Supabase infrastructure, we stepped back and asked: **What data actually needs a database?**

| Data Type | Volume | Update Frequency | Who Updates | Needs Database? |
|-----------|--------|------------------|-------------|-----------------|
| Teams | ~14 KB | Seasonally | Club Director | No |
| Rosters | ~50 players | Seasonally | Club Director | No |
| Coaches | ~10 records | Rarely | Club Director | No |
| Registrations | Collected externally | N/A | Google Forms | No |
| Payments | Handled externally | N/A | PayPal/Stripe | No |
| Blog/News | ~5-10 posts/season | Monthly | Club Director | No |

**Answer: None of it.**

### The Complexity We Built

Current state includes:
- 17 database migrations
- 18 admin dashboard pages
- Full authentication system (admin/coach/parent roles)
- Row-level security policies
- Excel-to-database seeding scripts
- React hooks for every data type
- Environment variables and API keys to manage

### What We Actually Need

- A way for the Club Director to update team info (currently: Excel)
- A way to post news/announcements (currently: doesn't exist)
- A fast, reliable website that just works

---

## Current State

### What's Been Built

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Club Director                                                 │
│        │                                                        │
│        ▼                                                        │
│   Excel File (team-data.xlsx)                                   │
│        │                                                        │
│        ▼                                                        │
│   Seeding Script (npm run seed)                                 │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │           SUPABASE                   │                      │
│   │  ┌─────────┐  ┌─────────┐           │                      │
│   │  │ Auth    │  │ Database│           │                      │
│   │  │ System  │  │ 17 Tables│          │                      │
│   │  └─────────┘  └─────────┘           │                      │
│   │  ┌─────────────────────┐            │                      │
│   │  │   RLS Policies      │            │                      │
│   │  └─────────────────────┘            │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        ▼                                                        │
│   React App (25+ hooks, API calls)                              │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │         ADMIN DASHBOARD              │                      │
│   │   18 pages for data management       │                      │
│   │   (Teams, Rosters, Coaches, etc.)    │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        ▼                                                        │
│   Public Website                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Infrastructure Inventory

| Component | Files/Items | Purpose | Keeping? |
|-----------|-------------|---------|----------|
| Supabase migrations | 17 files | Database schema | No |
| Admin pages | 18 pages | Data management UI | No |
| Auth system | AuthContext, ProtectedRoute | User login | No |
| Data hooks | 25+ hooks | Fetch from Supabase | Simplify |
| Seeding scripts | 3 scripts | Excel → Database | Replace |
| React app | Full SPA | Public website | Keep & simplify |
| Static HTML pages | 2 files | Legacy pages | Remove |

### Current Pain Points

1. **Deployment blocked** on Supabase environment setup
2. **Seeding required** every time data changes
3. **Auth complexity** for a site with 1-2 editors
4. **Multiple systems** to maintain and understand
5. **Onboarding burden** for anyone new to the project

---

## Future State

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIMPLIFIED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Club Director                                                 │
│        │                                                        │
│        ├──────────────────┬─────────────────────┐              │
│        ▼                  ▼                     ▼              │
│   Excel/Sheets       Decap CMS            Direct Edit          │
│   (teams, rosters)   (blog posts)         (GitHub UI)          │
│        │                  │                     │              │
│        ▼                  ▼                     ▼              │
│   ┌─────────────────────────────────────────────┐              │
│   │              GITHUB REPOSITORY              │              │
│   │                                             │              │
│   │   /data                                     │              │
│   │     teams.json     (from Excel export)      │              │
│   │     coaches.json                            │              │
│   │     schedule.json                           │              │
│   │                                             │              │
│   │   /content                                  │              │
│   │     /posts                                  │              │
│   │       2025-01-15-winter-kickoff.md         │              │
│   │       2025-01-10-registration-open.md      │              │
│   │                                             │              │
│   └─────────────────────────────────────────────┘              │
│        │                                                        │
│        │  (git push triggers)                                   │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────┐              │
│   │              VERCEL BUILD                   │              │
│   │                                             │              │
│   │   - Reads JSON files                        │              │
│   │   - Processes Markdown                      │              │
│   │   - Builds static site                      │              │
│   │   - Deploys globally (CDN)                  │              │
│   │                                             │              │
│   └─────────────────────────────────────────────┘              │
│        │                                                        │
│        ▼                                                        │
│   Static Website (Fast, no API calls)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Storage

#### Teams & Rosters (`/data/teams.json`)

```json
{
  "seasons": [
    {
      "id": "2024-25-winter",
      "name": "2024-25 Winter",
      "startDate": "2024-12-01",
      "endDate": "2025-03-31",
      "isActive": true
    }
  ],
  "teams": [
    {
      "id": "8th-elite-winter-2024",
      "seasonId": "2024-25-winter",
      "name": "8th Grade Elite",
      "gradeLevel": "8th",
      "gender": "male",
      "tier": "TNE",
      "headCoach": "marcus-johnson",
      "assistantCoach": "tony-williams",
      "teamFee": 650,
      "uniformFee": 150,
      "roster": [
        {
          "name": "Jaylen Carter",
          "jerseyNumber": 23,
          "position": "PG",
          "grade": "8th",
          "graduatingYear": 2029
        }
      ]
    }
  ],
  "coaches": [
    {
      "id": "marcus-johnson",
      "name": "Marcus Johnson",
      "email": "marcus@tneunited.com",
      "phone": "555-0101",
      "certifications": ["USA Basketball Gold License"]
    }
  ]
}
```

#### Blog Posts (`/content/posts/2025-01-15-winter-kickoff.md`)

```markdown
---
title: "Winter Season Kickoff"
date: 2025-01-15
author: "Coach Marcus"
image: /images/posts/winter-kickoff.jpg
tags: ["season", "announcement"]
---

The 2025 Winter season is officially underway! We had a great
first week of practice with all teams showing tremendous energy.

## Upcoming Schedule

- **Jan 18**: First games vs Dallas Elite
- **Jan 25**: Home tournament at Plano Sports Center

See you on the court!
```

### Content Management Options

| Content Type | Primary Method | Backup Method |
|--------------|----------------|---------------|
| Teams/Rosters | Excel → JSON export | Edit JSON directly |
| Coaches | Excel → JSON export | Edit JSON directly |
| Schedule | Excel → JSON export | Edit JSON directly |
| Blog posts | Decap CMS | Edit Markdown in GitHub |
| Page content | Decap CMS | Edit in code |

### Decap CMS Setup

Decap CMS (formerly Netlify CMS) provides a user-friendly editing interface:

- **Free and open source**
- **No backend required** — authenticates via GitHub
- **Git-based** — every change is a versioned commit
- **Works with Vercel** — triggers auto-deploy on save

The Club Director sees a simple admin interface:

```
┌──────────────────────────────────────────────────────────────┐
│  TNE Content Manager                            [Logout]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Collections                                                 │
│  ├── Posts (3)                                              │
│  ├── Announcements (2)                                      │
│  └── Page Content (5)                                       │
│                                                              │
│  Recent Posts                              [+ New Post]      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Winter Season Kickoff                      Jan 15     │ │
│  │  Registration Now Open                      Jan 10     │ │
│  │  Holiday Tournament Recap                   Dec 20     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## The Why: Benefits of This Approach

### 1. Simplicity

| Before | After |
|--------|-------|
| Database + Auth + Admin UI + Seeding | JSON files + Markdown |
| 17 migrations to manage | 0 migrations |
| Environment variables required | None for basic deploy |
| Multiple services (Supabase + Vercel) | Just Vercel |

### 2. Speed to Market

- **No database setup** required for deployment
- **No authentication** to configure
- **No seeding** step needed
- **Deploy today** — just push to main

### 3. Reduced Complexity

| Metric | Before | After |
|--------|--------|-------|
| External services | 2 (Supabase + Vercel) | 1 (Vercel) |
| Environment variables | 5+ | 0-1 |
| Database tables | 17 | 0 |
| Admin pages to maintain | 18 | 0 (Decap handles it) |
| Auth system | Full RBAC | GitHub OAuth only |

### 4. Cost

| Service | Before | After |
|---------|--------|-------|
| Supabase | Free tier (limits apply) | $0 |
| Vercel | Free tier | Free tier |
| Decap CMS | N/A | $0 (open source) |
| **Total** | $0 (but complexity cost) | $0 |

### 5. Reliability

- **No API calls** at runtime — site is fully static
- **CDN-delivered** — fast globally
- **No database downtime** concerns
- **Works offline** once loaded

### 6. Developer Experience

- **Instant local dev** — no database setup needed
- **Simple onboarding** — clone and run
- **Clear data flow** — files → build → site

---

## Migration Path

### Phase 1: Data Export (Week 1)

**Goal:** Convert existing data to JSON format

| Task | Owner | Status |
|------|-------|--------|
| Export teams from Excel to teams.json | Dev | Pending |
| Export coaches to coaches.json | Dev | Pending |
| Create schedule.json structure | Dev | Pending |
| Validate JSON matches current site data | Dev | Pending |

**Deliverable:** `/data/` folder with complete JSON files

### Phase 2: Frontend Refactor (Week 1-2)

**Goal:** Update React app to read from JSON instead of Supabase

| Task | Owner | Status |
|------|-------|--------|
| Create JSON data loading utilities | Dev | Pending |
| Update useTeams hook to read from JSON | Dev | Pending |
| Update useCoaches hook to read from JSON | Dev | Pending |
| Update Teams page to use new hooks | Dev | Pending |
| Update Schedule page to use new hooks | Dev | Pending |
| Remove Supabase client dependency | Dev | Pending |
| Remove auth context and protected routes | Dev | Pending |

**Deliverable:** Working site with no Supabase dependency

### Phase 3: Remove Supabase Infrastructure (Week 2)

**Goal:** Clean up unused code

| Task | Owner | Status |
|------|-------|--------|
| Archive admin pages (in case needed later) | Dev | Pending |
| Remove supabase/ migrations folder | Dev | Pending |
| Remove seeding scripts | Dev | Pending |
| Remove Supabase packages from package.json | Dev | Pending |
| Update environment variable documentation | Dev | Pending |

**Deliverable:** Clean codebase with no database code

### Phase 4: Decap CMS Setup (Week 2-3)

**Goal:** Enable content management for Club Director

| Task | Owner | Status |
|------|-------|--------|
| Add Decap CMS configuration | Dev | Pending |
| Set up GitHub OAuth app | Dev | Pending |
| Create content collections (posts, announcements) | Dev | Pending |
| Build blog/news page on frontend | Dev | Pending |
| Test editorial workflow | Dev + Director | Pending |
| Document CMS usage for Club Director | Dev | Pending |

**Deliverable:** Working CMS at `/admin` path

### Phase 5: Excel Workflow (Week 3)

**Goal:** Streamline team data updates

| Task | Owner | Status |
|------|-------|--------|
| Create Excel-to-JSON conversion script | Dev | Pending |
| Document update workflow for Club Director | Dev | Pending |
| Test full update cycle | Dev + Director | Pending |

**Deliverable:** Simple `npm run update-teams` command

### Phase 6: Deploy (Week 3)

**Goal:** Go live on Vercel

| Task | Owner | Status |
|------|-------|--------|
| Configure Vercel project | Dev | Pending |
| Set up custom domain | Dev | Pending |
| Test production build | Dev | Pending |
| Go live | Dev | Pending |

**Deliverable:** Live website at tneunited.com

---

## What We're Keeping

| Component | Reason |
|-----------|--------|
| React app structure | Solid foundation, just simplifying data layer |
| Tailwind CSS styling | Works great, no changes needed |
| Design system | Proven patterns, keep using them |
| Component library | Reusable, well-tested |
| Vercel deployment | Best-in-class for static sites |

## What We're Removing

| Component | Reason |
|-----------|--------|
| Supabase database | Overkill for static data |
| Authentication system | Not needed without admin dashboard |
| Admin dashboard (18 pages) | Replaced by Decap CMS |
| Seeding scripts | Replaced by JSON files |
| Database migrations | No database |
| RLS policies | No database |

## What We're Adding

| Component | Reason |
|-----------|--------|
| JSON data files | Simple, version-controlled data storage |
| Markdown content | Easy blog post authoring |
| Decap CMS | User-friendly editing without code |
| Excel-to-JSON script | Maintain familiar workflow |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Club Director finds JSON editing difficult | Low | Medium | Decap CMS provides friendly UI; Excel workflow unchanged |
| Need real-time features later | Low | High | Can add Supabase back if truly needed |
| Lose admin dashboard functionality | Medium | Low | Current dashboard rarely used; Decap covers content needs |
| Git conflicts on content updates | Low | Low | Decap handles branching; single editor typical |

---

## Future Considerations

### If We Need More Later

This architecture doesn't prevent adding complexity — it just doesn't start with it:

| Future Need | Solution |
|-------------|----------|
| User accounts/login | Add Supabase Auth only |
| Real-time scores | Add Supabase Realtime only |
| Payment integration | Keep using Stripe/PayPal externally |
| Parent portal | Evaluate if truly needed; could be separate app |

### What This Enables

- **Faster iteration** — change content without deploys for structural changes
- **Lower maintenance** — fewer systems to monitor and update
- **Easier handoff** — anyone can understand JSON + Markdown
- **Better performance** — static sites are inherently fast

---

## Decision Required

**Do we proceed with this simplification?**

### Option A: Proceed with Simplification
- Remove Supabase infrastructure
- Implement JSON + Decap CMS approach
- Deploy within 2-3 weeks

### Option B: Keep Current Architecture
- Continue with Supabase setup
- Complete admin dashboard
- Deploy with full infrastructure

### Option C: Hybrid Approach
- Keep Supabase for future use
- Add JSON layer for immediate deployment
- Migrate gradually

---

## Appendix

### A. Files to Archive (Not Delete)

Before removing, archive these to a branch:
- `/supabase/` — all migrations
- `/react-app/src/pages/Admin*.jsx` — all admin pages
- `/react-app/src/contexts/AuthContext.jsx`
- `/react-app/src/components/ProtectedRoute.jsx`
- `/scripts/seed-from-excel.js`
- `/scripts/import-data.js`

### B. Recommended JSON Schema

See `/docs/schemas/` (to be created) for full JSON Schema definitions.

### C. Decap CMS Configuration Preview

```yaml
# /react-app/public/admin/config.yml
backend:
  name: github
  repo: ptoney514/tne-website
  branch: main

media_folder: "react-app/public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "posts"
    label: "Blog Posts"
    folder: "content/posts"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Author", name: "author", widget: "string" }
      - { label: "Image", name: "image", widget: "image", required: false }
      - { label: "Body", name: "body", widget: "markdown" }
```

---

## Approval

| Role | Name | Approval | Date |
|------|------|----------|------|
| Club Director | | [ ] Approved / [ ] Changes Requested | |
| Technical Lead | | [ ] Approved / [ ] Changes Requested | |
| Developer | | [ ] Approved / [ ] Changes Requested | |

---

*Document version: 1.0*
*Last updated: January 20, 2025*

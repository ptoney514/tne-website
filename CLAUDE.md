# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TNE United Express youth basketball website — built with Next.js App Router, Neon PostgreSQL (via Drizzle ORM), and Neon Auth for authentication.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4 (PostCSS)
- **Icons**: `lucide-react`
- **Fonts**: Bebas Neue (headlines), Inter (body), Space Mono (labels/badges)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Neon Auth (`@neondatabase/auth`, managed Better Auth hosted by Neon)
- **Hosting**: Vercel

## Development

```bash
npm run dev          # Next.js dev server on localhost:3000
npm run build        # Production build
npm run db:studio    # Drizzle Studio (database browser)
```

## Brand Colors

| Color | Hex | Tailwind Class |
|-------|-----|----------------|
| Maroon | `#8B1F3A` | `tne-maroon` |
| Red | `#E31837` | `tne-red` |
| Red Dark | `#C41230` | `tne-red-dark` |
| Black | `#050505` | `bg-[#050505]` |

Custom colors are defined in `app/globals.css` via CSS custom properties (`@theme`).

## Design System Rules

**Source of truth**: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and existing React components.

Key patterns:
- **Copy components exactly** from DESIGN_SYSTEM.md or source files - do not improvise
- Use **Teams page navbar style** (sticky, backdrop-blur) for interior pages, not the Homepage glass nav
- Follow **dark hero + light content** pattern for page structure
- Use `rounded-3xl` for cards, `rounded-2xl` for inner elements
- Import icons from `lucide-react` (e.g., `import { ArrowLeft } from 'lucide-react'`)

## File Structure

```
app/
├── layout.jsx              # Root layout
├── page.jsx                # Homepage (redirect)
├── globals.css             # Tailwind config + custom styles
├── (public)/               # Public route group
│   ├── teams/page.jsx      # Teams list
│   ├── teams/[teamId]/     # Team detail
│   ├── schedule/page.jsx   # Schedule
│   ├── tryouts/page.jsx    # Tryouts & registration
│   ├── about/page.jsx      # About
│   ├── contact/page.jsx    # Contact
│   ├── tournaments/        # Tournament detail
│   ├── login/page.jsx      # Login
│   ├── signup/page.jsx     # Sign up
│   └── ...                 # Other public pages
├── admin/                  # Admin route group
│   ├── page.jsx            # Dashboard
│   ├── teams/              # Team management
│   ├── players/            # Player management
│   ├── tournaments/        # Tournament management
│   └── ...                 # Other admin pages
└── api/                    # API routes
    ├── auth/[...path]/     # Neon Auth proxy handler
    └── auth/profile/       # User profile API (custom fields)

components/                 # Shared React components
lib/                        # Auth config, DB client, utilities
db/                         # Drizzle schema & migrations
data/json/                  # Static JSON data files
```

## Project Tracking

**Milestone**: [MVP - Phase 1](https://github.com/ptoney514/tne-website/milestone/1)
**Status Overview**: See [PROJECT_STATUS.md](PROJECT_STATUS.md)

All work is tracked in GitHub Issues. At session start:

```bash
# Check what's next
gh issue list --milestone "MVP - Phase 1" --state open

# Pick an issue and create branch
git checkout -b feat/{issue-number}-{short-description}
```

### Branch Naming

```
feat/1-schedule-page
fix/15-nav-bug
chore/18-update-deps
```

### Commits

Reference issues in commits: `feat: Add schedule page (#1)`

### PR Workflow

Use keywords to auto-close issues:

```bash
gh pr create --title "Add schedule page" --body "Closes #1"
```

### Pre-PR Checklist (REQUIRED)

Before creating any PR, run the full check:

```bash
npm run pr-check
```

This runs:
1. `eslint .` - Lint check
2. `next build` - Next.js production build
3. `npx playwright test` - Playwright E2E tests

**All checks must pass before creating a PR.**

Individual commands:
```bash
npm test              # Run E2E tests
npm run test:headed   # Run tests with browser visible (debugging)
npm run test:ui       # Interactive test UI
npm run test:unit     # Vitest unit tests
```

## Development Pattern: Tests-as-You-Go

When building features:
1. Write tests alongside implementation
2. E2E tests for user flows (Playwright)
3. Unit tests for hooks and utilities (Vitest)

Run before committing:
- `/pre-commit` - Quick review of staged changes
- `npm run pr-check` - Full validation (lint, build, test)

## Remaining Work

See GitHub Issues for full tracking:
- [#1](https://github.com/ptoney514/tne-website/issues/1) Schedule page
- [#2](https://github.com/ptoney514/tne-website/issues/2) Tryouts page
- [#3](https://github.com/ptoney514/tne-website/issues/3) About page
- [#4](https://github.com/ptoney514/tne-website/issues/4) Contact page
- [#5](https://github.com/ptoney514/tne-website/issues/5) Tournaments page
- [#6](https://github.com/ptoney514/tne-website/issues/6) Admin Dashboard
- [#7](https://github.com/ptoney514/tne-website/issues/7) Admin Team Management
- [#8](https://github.com/ptoney514/tne-website/issues/8) Admin Tournament Manager
- [#10](https://github.com/ptoney514/tne-website/issues/10) Vercel Deployment

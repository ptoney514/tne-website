# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TNE United Express youth basketball website - currently static HTML + Tailwind CSS, with Supabase backend planned for Phase 2.

## Tech Stack

- **Frontend**: HTML + Tailwind CSS (CDN)
- **Icons**: Lucide (`<script src="https://unpkg.com/lucide@latest"></script>`)
- **Fonts**: Bebas Neue (headlines), Inter (body), Space Mono (labels/badges)
- **Backend (planned)**: Supabase
- **Hosting (planned)**: Vercel

## Development

No build step required. Open HTML files directly in browser:
```bash
open src/pages/index.html
open src/pages/teams.html
```

## Brand Colors

| Color | Hex | Tailwind Class |
|-------|-----|----------------|
| Maroon | `#8B1F3A` | `tne-maroon` |
| Red | `#E31837` | `tne-red` |
| Red Dark | `#C41230` | `tne-red-dark` |
| Black | `#050505` | `bg-[#050505]` |

Custom colors are defined in the Tailwind config at the top of each HTML file.

## Design System Rules

**Source of truth**: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and existing HTML files.

Key patterns:
- **Copy components exactly** from DESIGN_SYSTEM.md or source files - do not improvise
- Use **Teams page navbar style** (sticky, backdrop-blur) for interior pages, not the Homepage glass nav
- Follow **dark hero + light content** pattern for page structure
- Use `rounded-3xl` for cards, `rounded-2xl` for inner elements
- Initialize Lucide icons with: `lucide.createIcons({ attrs: { strokeWidth: 1.5 } });`

## File Structure

```
src/pages/
├── index.html     # Homepage (complete)
└── teams.html     # Teams list page (complete)
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
1. `npm run lint:react` - ESLint on React app
2. `npm run build:react` - Vite production build
3. `npm run test` - Playwright E2E tests

**All checks must pass before creating a PR.**

Individual commands:
```bash
npm test              # Run E2E tests
npm run test:headed   # Run tests with browser visible (debugging)
npm run test:ui       # Interactive test UI
```

## Development Pattern: Tests-as-You-Go

When building features:
1. Write tests alongside implementation
2. E2E tests for user flows (Playwright)
3. Unit tests for hooks and utilities (Vitest)

Run before committing:
- `/pre-commit` - Quick review of staged changes
- `npm run pr-check` - Full validation (lint, build, test)

## Remaining Pages to Build

See GitHub Issues for full tracking:
- [#1](https://github.com/ptoney514/tne-website/issues/1) Schedule page
- [#2](https://github.com/ptoney514/tne-website/issues/2) Tryouts page
- [#3](https://github.com/ptoney514/tne-website/issues/3) About page
- [#4](https://github.com/ptoney514/tne-website/issues/4) Contact page
- [#5](https://github.com/ptoney514/tne-website/issues/5) Tournaments page
- [#6](https://github.com/ptoney514/tne-website/issues/6) Admin Dashboard
- [#7](https://github.com/ptoney514/tne-website/issues/7) Admin Team Management
- [#8](https://github.com/ptoney514/tne-website/issues/8) Admin Tournament Manager
- [#9](https://github.com/ptoney514/tne-website/issues/9) Supabase Setup
- [#10](https://github.com/ptoney514/tne-website/issues/10) Vercel Deployment

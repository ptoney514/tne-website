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

## Remaining Pages to Build

- Team Detail page
- Schedule page
- Tryouts page
- About page
- Contact page
- Admin Portal (dashboard, team/player/schedule management)

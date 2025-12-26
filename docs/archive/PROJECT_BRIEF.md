# TNE United Express - Project Brief

**Project:** TNE Website Rebuild  
**Status:** In Development  
**Updated:** December 21, 2025

---

## What We're Building

A modern, brand-aligned website for TNE United Express youth basketball:

1. **Public site** — Program info, team visibility, tryout registration
2. **Admin tools** — Manage teams, players, schedules (Phase 1)
3. **Parent portal** — View schedules, payment status (Phase 2)

---

## Current Progress

| Page | Status | File |
|------|--------|------|
| Homepage | ✅ Complete | `tne-v2-homepage-complete.html` |
| Teams List | ✅ Complete | `tne-v2-teams.html` |
| Team Detail | 🔲 Next | — |
| Schedule | 🔲 Planned | — |
| Tryouts | 🔲 Planned | — |
| About | 🔲 Planned | — |
| Contact | 🔲 Planned | — |

---

## Tech Stack

- **Frontend:** HTML + Tailwind CSS (CDN)
- **Icons:** Lucide
- **Fonts:** Bebas Neue, Inter, Space Mono (Google Fonts)
- **Backend (planned):** Supabase
- **Hosting (planned):** Vercel

---

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Maroon | `#8B1F3A` | Gradients, accents |
| Red | `#E31837` | Primary CTA, highlights |
| Red Dark | `#C41230` | Hover states |
| Black | `#050505` | Page backgrounds |

---

## Phase 1 Scope (MVP)

**Public Pages:**
- [x] Homepage
- [x] Teams list
- [ ] Team detail
- [ ] Global schedule
- [ ] Tryouts info + registration
- [ ] About
- [ ] Contact

**Admin Portal:**
- [ ] Dashboard
- [ ] Team management
- [ ] Player management
- [ ] Schedule management
- [ ] Registration review

---

## Key User Needs

| User | Primary Need |
|------|-------------|
| **Parents** | Find my kid's practice/game schedule quickly |
| **Prospective families** | Learn about program, sign up for tryouts |
| **Admins** | Manage teams and schedules without developer help |
| **Coaches** | View roster, update practice times |

---

## Success Criteria

1. Admin can add a team and it appears on public site immediately
2. Parents can find any team's schedule in < 3 clicks
3. Registration form works end-to-end
4. Brand matches actual team apparel (maroon/black/white)
5. Works on mobile

---

## Design System

See `DESIGN_SYSTEM.md` for:
- Component patterns (navbar, cards, footer)
- Typography rules
- Color usage
- Code snippets to copy

**Source of truth:**
- `tne-v2-homepage-complete.html`
- `tne-v2-teams.html`

---

## Next Steps

1. Build Team Detail page
2. Build Schedule page
3. Build Tryouts page
4. Set up Supabase schema
5. Connect frontend to backend

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| HTML + Tailwind (no React yet) | Faster iteration, simpler deployment |
| Teams page style for navbar | Cleaner than homepage glass nav for interior pages |
| Dark hero + light content | Matches established pattern |
| No payment integration Phase 1 | PayPal button works for now |

---

## Open Questions

- [ ] Exact tryout registration flow
- [ ] Fee structure per team/grade
- [ ] Required vs optional player profile fields
- [ ] Team-specific vs org-wide announcements

---

## Related Files

```
docs/
├── TNE-United-Express-Mood-Board.md
├── TNE-Site-Map.md
├── tne-phase1-screen-inventory.md
└── tne-website-project-brief.md (full version)

src/pages/
├── tne-v2-homepage-complete.html
└── tne-v2-teams.html
```

---

*Lightweight brief for Claude Code. See full project brief for complete details.*

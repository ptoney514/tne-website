# TNE United Express - Project Status

## Tracking

**GitHub Repo**: [ptoney514/tne-website](https://github.com/ptoney514/tne-website)
**Milestone**: [MVP - Phase 1](https://github.com/ptoney514/tne-website/milestone/1)

> This file is a high-level overview. For detailed task tracking, see GitHub Issues.

---

## MVP Definition

**Goal**: A modern website where parents can find schedules quickly, families can register for tryouts, and admins can manage teams without developer help.

**Differentiator**: Purpose-built for TNE United Express with brand-aligned design and streamlined admin tools.

**Target Audience**: TNE families (parents, players) and organization admins/coaches.

---

## MVP Features (10 issues)

### Public Pages

| Feature | Issue | Status |
|---------|-------|--------|
| Homepage | N/A | Complete |
| Teams List | N/A | Complete |
| Team Detail | N/A | Complete |
| Schedule Page | [#1](https://github.com/ptoney514/tne-website/issues/1) | Open |
| Tryouts & Registration | [#2](https://github.com/ptoney514/tne-website/issues/2) | Open |
| About Page | [#3](https://github.com/ptoney514/tne-website/issues/3) | Open |
| Contact Page | [#4](https://github.com/ptoney514/tne-website/issues/4) | Open |
| Tournaments Page | [#5](https://github.com/ptoney514/tne-website/issues/5) | Open |

### Admin Portal

| Feature | Issue | Status |
|---------|-------|--------|
| Dashboard | [#6](https://github.com/ptoney514/tne-website/issues/6) | Open |
| Team Management | [#7](https://github.com/ptoney514/tne-website/issues/7) | Open |
| Tournament Manager | [#8](https://github.com/ptoney514/tne-website/issues/8) | Open |

### Infrastructure

| Feature | Issue | Status |
|---------|-------|--------|
| Neon + Better Auth | [#9](https://github.com/ptoney514/tne-website/issues/9) | Complete (migrated from Supabase) |
| Vercel Deployment | [#10](https://github.com/ptoney514/tne-website/issues/10) | Open |

---

## Not in MVP (Phase 2+)

- News/Blog section
- Shop/Merchandise
- Parent portal (payment history, player profiles)
- Player database (admin)
- Coach management (admin)
- Payment integration
- Instagram feed embed
- Alumni spotlight

---

## Already Complete

- Homepage (Next.js)
- Teams list page (Next.js)
- Team detail page (Next.js)
- Design system documentation
- Brand colors and typography defined
- Neon PostgreSQL + Drizzle ORM setup
- Better Auth integration (email/password, roles)

---

## Development Workflow

### Session Start

```bash
# 1. Check what's next
gh issue list --milestone "MVP - Phase 1" --state open

# 2. Pick an issue and create branch
git checkout -b feat/{issue-number}-{short-description}
```

### Branch Naming

```
<type>/<issue-number>-<short-description>

feat/1-schedule-page
fix/15-nav-bug
chore/18-update-deps
```

### Commits

Reference the issue in commits:

```
feat: Add schedule page layout (#1)
fix: Resolve nav overlap issue (#15)
```

### PR Creation

Use keywords to auto-close issues:

```bash
gh pr create --title "Add schedule page" --body "Closes #1"
```

### Session End

```bash
# Push work (even if WIP)
git push -u origin feat/1-schedule-page

# Update issue if not done
gh issue comment 1 --body "WIP: Layout complete, need filter logic"
```

---

## Quick Commands

```bash
# View open MVP issues
gh issue list --milestone "MVP - Phase 1" --state open

# View specific issue
gh issue view {number}

# Close completed issue
gh issue close {number}

# Check milestone progress
gh api repos/ptoney514/tne-website/milestones/1
```

---

*Last updated: February 21, 2026*

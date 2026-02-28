# Disaster Recovery Runbook

Last updated: 2026-02-28

## Infrastructure Overview

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Vercel** | Hosting, CDN, deployments | [vercel.com/pernells-projects/tne-website](https://vercel.com/pernells-projects/tne-website) |
| **Neon** | PostgreSQL database | [console.neon.tech](https://console.neon.tech) — project `noisy-sea-79276165` |
| **Neon Auth** | Authentication (managed Better Auth) | Neon Console → Auth tab |
| **GitHub** | Source code, CI/CD | [github.com/ptoney514/tne-website](https://github.com/ptoney514/tne-website) |
| **Sentry** | Error tracking | [sentry.io](https://sentry.io) — org `ptcs`, project `javascript-nextjs` |
| **Resend** | Transactional email | [resend.com](https://resend.com) |
| **Cloudflare** | DNS | [dash.cloudflare.com](https://dash.cloudflare.com) |

## Database Branches

| Branch | Endpoint | Purpose |
|--------|----------|---------|
| `main` | `ep-wild-sky-ahcar46r` | Production |
| `dev` | `ep-frosty-waterfall-ahw4b3ju` | Development / preview deploys |

---

## Backup Strategy

### Neon Point-in-Time Recovery (PITR)

- **Window**: 6 hours (Launch plan)
- **Granularity**: Any point within the window
- **How to restore**: Neon Console → Backup & Restore → select timestamp → restore to new branch

This means if you discover data corruption, you have up to **6 hours** to catch it and restore.

### Weekly pg_dump — Local (Primary)

A macOS **launchd** agent runs `scripts/backup-db.sh` every Sunday at 3:00 AM local time. If the Mac is asleep, it runs when it wakes up. Backups are saved to `~/backups/tne-website/` and auto-cleaned after 30 days.

**Plist location**: `~/Library/LaunchAgents/com.tne.db-backup.plist`
**Log file**: `~/backups/tne-website/backup.log`

```bash
# Monitor — check log
cat ~/backups/tne-website/backup.log

# Monitor — list recent backups
ls -lh ~/backups/tne-website/tne-*.dump

# Manual trigger
launchctl start com.tne.db-backup

# On-demand via npm
npm run db:backup        # production
npm run db:backup:dev    # dev branch

# Manage the scheduled agent
launchctl list | grep tne              # verify it's loaded
launchctl stop com.tne.db-backup       # stop a running backup
launchctl unload ~/Library/LaunchAgents/com.tne.db-backup.plist   # disable
launchctl load ~/Library/LaunchAgents/com.tne.db-backup.plist     # re-enable
```

After each backup, copy the dump file to your NAS and/or Google Drive for offsite redundancy.

### Weekly pg_dump — GitHub Actions (Secondary)

A GitHub Action also runs every Sunday at 3:00 AM UTC as a fallback. Uploads to GitHub Actions artifacts (retained 30 days). Requires GitHub Actions billing to be active.

See `.github/workflows/backup.yml`.

### What's Backed Up

| Data | Backup method | Retention |
|------|--------------|-----------|
| Database (schema + data) | Neon PITR | 6 hours rolling |
| Database (full dump) | Weekly local pg_dump → `~/backups/tne-website/` | 30 days |
| Database (full dump) | Weekly GitHub Actions pg_dump → artifact | 30 days |
| Source code | GitHub | Permanent (git history) |
| Deployments | Vercel | Automatic rollback to any previous deploy |
| Environment variables | Documented in `.env.example` | Manual (see Secret Recovery below) |

---

## Recovery Procedures

### 1. Site is down (500 errors, blank page)

**Diagnosis:**
```bash
# Check health endpoint
curl https://tnebasketball.com/api/health

# Check Vercel deployment status
vercel ls --prod

# Check Sentry for errors
# → sentry.io → Issues tab
```

**Fix — rollback to last working deploy:**
1. Go to [Vercel Dashboard → Deployments](https://vercel.com/pernells-projects/tne-website/deployments)
2. Find the last successful production deployment
3. Click the three-dot menu → **Promote to Production**

Or via CLI:
```bash
# List recent deployments
vercel ls

# Promote a specific deployment
vercel promote <deployment-url>
```

### 2. Database is corrupted or data was accidentally deleted

**If within 6-hour PITR window:**
1. Go to Neon Console → project → **Backup & Restore**
2. Select the timestamp **before** the corruption
3. Click **Restore** — this creates a new branch with the restored data
4. Verify the restored branch has correct data
5. Update `DATABASE_URL` in Vercel to point to the restored branch
6. Redeploy

**If outside PITR window — use weekly pg_dump:**
1. Find the most recent backup:
   ```bash
   ls -lh ~/backups/tne-website/tne-production-*.dump
   ```
   Or download from GitHub → Actions → **Weekly Database Backup** workflow artifacts.
2. Create a new Neon branch for the restore:
   ```bash
   neonctl branches create --project-id noisy-sea-79276165 --name restore-YYYY-MM-DD --org-id org-morning-pine-04214347
   ```
3. Get the connection string and restore:
   ```bash
   pg_restore --no-owner --no-acl -d "<new-branch-connection-string>" backup.dump
   ```
4. Verify, then update `DATABASE_URL` in Vercel

### 3. Seed script accidentally ran against production

The `db-guard` in `scripts/lib/db-guard.ts` should prevent this. If it happened anyway:

1. Immediately check what was inserted (seed scripts log what they create)
2. If within 6 hours, use Neon PITR to restore (see procedure 2 above)
3. If outside window, use the weekly pg_dump

### 4. Vercel project deleted or environment variables lost

**Redeploy:**
```bash
vercel link
vercel deploy --prod
```

**Restore environment variables:**
All required variables are documented in `.env.example`. You'll need:
- `DATABASE_URL` — from Neon Console → Connection Details
- `NEON_AUTH_BASE_URL` — from Neon Console → Auth tab
- `RESEND_API_KEY` — from Resend dashboard
- `ADMIN_NOTIFICATION_EMAILS` — set to admin email addresses
- Sentry vars — from Sentry dashboard → Project Settings → Client Keys / Auth Tokens

### 5. GitHub repository is compromised or deleted

- Every contributor has a full clone of the repo (git is distributed)
- To recreate: create a new repo and push from any local clone
- CI/CD will need GitHub secrets reconfigured (see `.env.example` for the list)

### 6. DNS is misconfigured

Domain `tnebasketball.com` is managed in Cloudflare. Vercel provides the CNAME target.

```bash
# Verify DNS resolution
dig tnebasketball.com
dig www.tnebasketball.com

# Check Vercel domain config
vercel domains ls
```

---

## Recovery Time Objectives

| Scenario | Target RTO | Target RPO |
|----------|-----------|-----------|
| Bad deploy (site down) | < 5 min (Vercel rollback) | 0 (no data loss) |
| Database corruption (within PITR) | < 15 min | Up to 6 hours of data |
| Database corruption (outside PITR) | < 30 min | Up to 7 days of data |
| Full infrastructure rebuild | < 1 hour | Up to 7 days of data |

---

## Contacts

| Role | Contact |
|------|---------|
| Site admin | pernell@gmail.com |

---

## Maintenance Schedule

| Task | Frequency | How |
|------|-----------|-----|
| Verify weekly backup runs | Weekly | `ls -lh ~/backups/tne-website/` or check GitHub Actions |
| Copy backup to NAS/Google Drive | Weekly (after backup) | Copy latest `.dump` from `~/backups/tne-website/` |
| Test backup restore | Monthly | Restore dump to a test Neon branch, verify data |
| Rotate Sentry auth token | Every 6 months | Sentry → Settings → Auth Tokens |
| Review Neon PITR window | Quarterly | Neon Console → Settings → Instant restore |

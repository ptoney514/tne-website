# TNE Website: Supabase to Neon Migration Plan

**Branch:** `chore/migrate-to-neon`
**Created:** 2026-02-01
**Status:** Planning Phase

---

## Executive Summary

This document outlines the migration strategy from Supabase (PostgreSQL + Auth + SDK) to Neon (PostgreSQL) with a separate auth solution. The migration affects authentication, database access patterns, and API architecture while preserving all existing functionality.

### Why Migrate?

| Supabase | Neon |
|----------|------|
| All-in-one platform | Database-focused |
| Vendor lock-in to SDK patterns | Standard PostgreSQL, portable |
| Auth tightly coupled to DB | Auth decoupled, more flexibility |
| No branching | **Database branching** for previews/testing |
| Pricing tied to platform usage | Serverless, pay for compute |

### Migration Scope

- **13 database tables** with relationships and constraints
- **Authentication system** (email/password, sessions, roles)
- **15+ React hooks** using Supabase client
- **2 API routes** (`/api/register`, `/api/chat`)
- **Row-Level Security** → API-level authorization
- **Test infrastructure** updates

---

## Current Architecture Analysis

### Database Schema (13 Tables)

| Table | Records | Relationships | Notes |
|-------|---------|---------------|-------|
| `profiles` | User profiles | → auth.users | Auto-created on signup |
| `seasons` | Training periods | - | Active season controls app |
| `coaches` | Coach profiles | → profiles | Active flag |
| `teams` | Team records | → seasons, coaches | Fees, practice schedules |
| `players` | Player database | → parents | Medical, jersey info |
| `parents_guardians` | Parent accounts | → profiles | Address, contact |
| `team_roster` | Team membership | → teams, players | Payment tracking |
| `tryout_sessions` | Tryout events | → seasons | Capacity limits |
| `tryout_signups` | Tryout registrations | → sessions, teams | Status workflow |
| `registrations` | New player apps | - | Approval workflow |
| `events` | Schedule/games | → teams, seasons | Multi-type events |
| `announcements` | News/updates | → teams | Public/pinned flags |
| `contact_submissions` | Contact form | - | Status tracking |

### Authentication Patterns

```
Current Flow (Supabase):
┌─────────────┐      ┌──────────────────┐      ┌────────────┐
│ Login Form  │ ───▶ │ supabase.auth    │ ───▶ │ JWT Token  │
└─────────────┘      │ .signInWithPwd() │      │ in cookie  │
                     └──────────────────┘      └────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ profiles table   │ ◀── Auto-created trigger
                     │ (role, name)     │
                     └──────────────────┘
```

### React Hooks Using Supabase (Refactor Required)

| Hook | Purpose | Supabase Calls |
|------|---------|----------------|
| `useAuth` | Auth state, sign in/out | `auth.signInWithPassword`, `auth.signOut`, `auth.getSession` |
| `useRegistrations` | Manage registrations | `from('registrations').select/update` |
| `useTeams` | Team CRUD | `from('teams').select/insert/update/delete` |
| `usePlayers` | Player CRUD | `from('players').select/insert/update/delete` |
| `useCoaches` | Coach CRUD | `from('coaches').select/insert/update/delete` |
| `useEvents` | Schedule CRUD | `from('events').select/insert/update/delete` |
| `useTryoutSessions` | Tryout management | `from('tryout_sessions').select/insert/update/delete` |
| `useTryoutSignups` | Signup management | `from('tryout_signups').select/insert/update` |
| `useUsers` | User management | `from('profiles').select/update`, admin auth |
| `useSeason` | Season selection | `from('seasons').select/update` |
| `useContactForm` | Contact submissions | `from('contact_submissions').insert` |
| `useTeamRegistration` | Registration form | `from('registrations').insert` |

### Row-Level Security Policies (Must Convert to API)

```sql
-- Example: Current RLS policy for players
CREATE POLICY "Parents can view own players" ON players
  FOR SELECT USING (
    primary_parent_id IN (
      SELECT id FROM parents_guardians
      WHERE profile_id = auth.uid()
    )
  );

-- Must become API middleware check:
// if (user.role === 'parent') {
//   query = query.where('primary_parent_id', 'IN', userParentIds)
// }
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1)

#### 1.1 Set Up Neon Database

```bash
# Create Neon project via CLI or dashboard
neon projects create --name tne-website

# Create development branch
neon branches create --name development

# Get connection string
neon connection-string --branch development
```

**Environment Variables (New):**
```env
# Neon Database
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# For Drizzle/Prisma migrations
DIRECT_URL=${DATABASE_URL_UNPOOLED}
```

#### 1.2 Choose Auth Solution

**Recommended: Better Auth** (for this use case)

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Better Auth** | Modern, good DX, database sessions, built-in admin | Newer, smaller community | This project ✓ |
| Auth.js v5 | Popular, many providers | Complex config, callback-heavy | Multi-provider OAuth |
| Clerk | Polished UI, managed | Vendor lock-in, pricing | Quick setup, less control |
| Lucia v3 | Full control, lightweight | More manual work | Custom requirements |

**Why Better Auth for TNE:**
- Database sessions (works with Neon directly)
- Built-in role management
- Admin API for user management
- Simple React integration
- TypeScript-first

#### 1.3 Database ORM Selection

**Recommended: Drizzle ORM**

```typescript
// Drizzle schema example (type-safe, SQL-like)
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth'),
  currentGrade: integer('current_grade'),
  primaryParentId: uuid('primary_parent_id').references(() => parentsGuardians.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Why Drizzle:**
- Type-safe queries
- SQL-like syntax (familiar)
- Lightweight (no heavy runtime)
- Excellent Neon support
- Migration generation

---

### Phase 2: Database Migration (Week 1-2)

#### 2.1 Schema Translation

Create Drizzle schema from existing SQL:

```
/react-app/src/db/
├── schema/
│   ├── index.ts           # Export all schemas
│   ├── auth.ts            # Better Auth tables
│   ├── profiles.ts        # User profiles
│   ├── seasons.ts         # Seasons
│   ├── coaches.ts         # Coaches
│   ├── teams.ts           # Teams
│   ├── players.ts         # Players
│   ├── parents.ts         # Parents/Guardians
│   ├── roster.ts          # Team roster (join)
│   ├── tryouts.ts         # Tryout sessions & signups
│   ├── registrations.ts   # Registrations
│   ├── events.ts          # Schedule/events
│   ├── announcements.ts   # Announcements
│   └── contact.ts         # Contact submissions
├── migrations/            # Generated migrations
├── index.ts               # DB client export
└── seed.ts                # Seed data for dev
```

#### 2.2 Schema Changes for Better Auth

Better Auth uses its own tables. Merge with profiles:

```typescript
// Better Auth will create: user, session, account, verification
// We extend user table with our profile fields

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  // Better Auth fields above, our fields below:
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: userRoleEnum('role').default('parent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### 2.3 Data Migration Script

```typescript
// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js';
import { db } from '../src/db';
import * as schema from '../src/db/schema';

async function migrateData() {
  const supabase = createClient(OLD_URL, OLD_KEY);

  // 1. Migrate seasons
  const { data: seasons } = await supabase.from('seasons').select('*');
  await db.insert(schema.seasons).values(seasons);

  // 2. Migrate coaches
  const { data: coaches } = await supabase.from('coaches').select('*');
  await db.insert(schema.coaches).values(coaches);

  // 3. Migrate teams (after coaches for FK)
  const { data: teams } = await supabase.from('teams').select('*');
  await db.insert(schema.teams).values(teams);

  // ... continue for all tables in dependency order

  // 4. Migrate users (special handling for auth)
  // Better Auth will handle user creation differently
  // May need to set up password reset flow for existing users
}
```

**User Migration Strategy:**
1. Export user emails from Supabase
2. Create users in Better Auth with temporary passwords
3. Send password reset emails to all users
4. Alternative: Allow "magic link" first login, then set password

---

### Phase 3: API Layer (Week 2-3)

#### 3.1 API Route Structure

Convert Supabase client calls to API routes:

```
/api/
├── auth/
│   └── [...all].ts        # Better Auth handler
├── admin/
│   ├── users/
│   │   ├── index.ts       # GET (list), POST (create)
│   │   └── [id].ts        # GET, PATCH, DELETE
│   ├── registrations/
│   │   ├── index.ts       # GET (list)
│   │   ├── [id].ts        # GET, PATCH
│   │   └── [id]/approve.ts # POST (approve workflow)
│   ├── teams/
│   ├── players/
│   ├── coaches/
│   ├── events/
│   ├── tryouts/
│   └── seasons/
├── public/
│   ├── teams.ts           # Public team list
│   ├── schedule.ts        # Public schedule
│   └── tryouts.ts         # Public tryout sessions
├── register.ts            # Registration form (existing)
├── contact.ts             # Contact form
└── chat.ts                # AI chat (existing)
```

#### 3.2 Authorization Middleware

Replace RLS with API middleware:

```typescript
// lib/auth-middleware.ts
import { auth } from './auth';

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return session;
}

export async function requireAdmin(request: Request) {
  const session = await requireAuth(request);
  if (session.user.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 });
  }
  return session;
}

export async function requireRole(request: Request, roles: string[]) {
  const session = await requireAuth(request);
  if (!roles.includes(session.user.role)) {
    throw new Response('Forbidden', { status: 403 });
  }
  return session;
}
```

#### 3.3 Example API Route

```typescript
// api/admin/teams/index.ts
import { db } from '@/db';
import { teams } from '@/db/schema';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  await requireAdmin(request);

  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.isActive, true));

  return Response.json(allTeams);
}

export async function POST(request: Request) {
  await requireAdmin(request);

  const body = await request.json();
  const newTeam = await db.insert(teams).values(body).returning();

  return Response.json(newTeam[0], { status: 201 });
}
```

---

### Phase 4: React Hooks Refactor (Week 3)

#### 4.1 API Client Setup

```typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl = '/api';

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: 'include', // Send auth cookies
    });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }

  // patch, delete, etc.
}

export const api = new ApiClient();
```

#### 4.2 Hook Refactoring Pattern

**Before (Supabase):**
```typescript
// hooks/useTeams.js
export function useTeams() {
  const [teams, setTeams] = useState([]);

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*, head_coach:coaches(*)')
      .eq('is_active', true);

    if (error) throw error;
    setTeams(data);
  }

  async function createTeam(team) {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return { teams, fetchTeams, createTeam };
}
```

**After (API):**
```typescript
// hooks/useTeams.ts
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  async function fetchTeams() {
    const data = await api.get<Team[]>('/admin/teams');
    setTeams(data);
  }

  async function createTeam(team: CreateTeamInput) {
    const data = await api.post<Team>('/admin/teams', team);
    return data;
  }

  return { teams, fetchTeams, createTeam };
}
```

#### 4.3 Hooks Migration Checklist

| Hook | Status | API Routes Needed |
|------|--------|-------------------|
| `useAuth` | 🔄 | Better Auth handles |
| `useRegistrations` | ⬜ | `/api/admin/registrations` |
| `useTeams` | ⬜ | `/api/admin/teams`, `/api/public/teams` |
| `usePlayers` | ⬜ | `/api/admin/players` |
| `useCoaches` | ⬜ | `/api/admin/coaches` |
| `useEvents` | ⬜ | `/api/admin/events`, `/api/public/schedule` |
| `useTryoutSessions` | ⬜ | `/api/admin/tryouts` |
| `useTryoutSignups` | ⬜ | `/api/admin/tryouts/signups` |
| `useUsers` | ⬜ | `/api/admin/users` |
| `useSeason` | ⬜ | `/api/admin/seasons` |
| `useContactForm` | ⬜ | `/api/contact` |

---

### Phase 5: Auth Integration (Week 2-3)

#### 5.1 Better Auth Setup

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable later
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      role: { type: 'string', defaultValue: 'parent' },
    },
  },
});
```

#### 5.2 React Auth Provider

```typescript
// contexts/AuthContext.tsx (refactored)
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export function AuthProvider({ children }) {
  const session = authClient.useSession();

  const signIn = async (email: string, password: string) => {
    await authClient.signIn.email({ email, password });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  const value = {
    user: session.data?.user,
    isLoading: session.isPending,
    isAuthenticated: !!session.data,
    signIn,
    signOut,
    hasRole: (role: string) => session.data?.user?.role === role,
    isAdmin: () => session.data?.user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

### Phase 6: Testing Updates (Week 3-4)

#### 6.1 Test Database Strategy

Leverage Neon branching for test isolation:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.TEST_BASE_URL,
  },
  // Each test run can use a Neon branch
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
});

// tests/setup/global-setup.ts
export default async function globalSetup() {
  // Create ephemeral Neon branch for this test run
  const branch = await neon.branches.create({
    name: `test-${Date.now()}`,
    parent: 'development',
  });

  process.env.DATABASE_URL = branch.connectionString;
}
```

#### 6.2 Test Client Updates

```typescript
// tests/fixtures/db-client.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const testDb = drizzle(sql);

// Helper functions for test data
export async function createTestUser(data: Partial<User>) {
  return testDb.insert(users).values({
    email: `test.${Date.now()}@example.com`,
    role: 'parent',
    ...data,
  }).returning();
}
```

---

## File Changes Summary

### New Files to Create

```
react-app/
├── src/
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema/               # All table schemas
│   │   └── migrations/           # Generated migrations
│   └── lib/
│       ├── auth.ts               # Better Auth config
│       ├── auth-client.ts        # React auth client
│       └── api-client.ts         # API client wrapper
├── drizzle.config.ts             # Drizzle config
└── scripts/
    ├── migrate-data.ts           # Data migration script
    └── generate-migrations.ts    # Schema migration generator

api/
├── auth/
│   └── [...all].ts               # Better Auth handler
├── admin/
│   ├── users/                    # User management
│   ├── teams/                    # Team management
│   ├── players/                  # Player management
│   ├── coaches/                  # Coach management
│   ├── events/                   # Event management
│   ├── registrations/            # Registration management
│   ├── tryouts/                  # Tryout management
│   └── seasons/                  # Season management
├── public/
│   ├── teams.ts                  # Public teams
│   ├── schedule.ts               # Public schedule
│   └── tryouts.ts                # Public tryouts
└── lib/
    ├── db.ts                     # Server DB client
    └── auth-middleware.ts        # Auth/role middleware
```

### Files to Modify

```
react-app/src/
├── contexts/AuthContext.jsx      # Complete rewrite
├── hooks/
│   ├── useRegistrations.js       # API client calls
│   ├── useTeams.js               # API client calls
│   ├── usePlayers.js             # API client calls
│   ├── useCoaches.js             # API client calls
│   ├── useEvents.js              # API client calls
│   ├── useTryoutSessions.js      # API client calls
│   ├── useTryoutSignups.js       # API client calls
│   ├── useUsers.js               # API client calls
│   ├── useSeason.js              # API client calls
│   └── useContactForm.js         # API client calls
└── lib/
    └── supabase.js               # DELETE
```

### Files to Delete

```
react-app/src/lib/supabase.js
api/lib/supabaseAdmin.js
tne-supabase-schema-fixed.sql     # Keep for reference, but deprecated
supabase-contact-submissions.sql  # Keep for reference, but deprecated
```

---

## Potential Issues & Mitigations

### 1. User Migration & Password Reset

**Issue:** Supabase passwords are hashed and cannot be exported.

**Mitigation:**
- Export user emails and metadata only
- Create users in Better Auth with `password: null`
- Send password reset emails to all existing users
- Alternative: Implement "first login" magic link flow

### 2. Session Continuity

**Issue:** Existing logged-in users will be logged out during migration.

**Mitigation:**
- Announce maintenance window
- Clear communication about re-login requirement
- Keep migration window short (database cutover)

### 3. RLS to API Authorization Gap

**Issue:** Missing authorization checks could expose data.

**Mitigation:**
- Create authorization matrix document
- Unit test every API endpoint for role enforcement
- Add integration tests for access control
- Review all endpoints before launch

### 4. Dual-Write Transition Period

**Issue:** During migration, need to keep both systems in sync.

**Mitigation:**
- Use feature flags to switch between Supabase and Neon
- Read from Neon, write to both during transition
- Verify data consistency before final cutover

### 5. Realtime Features

**Issue:** Supabase realtime subscriptions won't work with Neon.

**Current Usage:** None found (no `.subscribe()` calls in codebase).

**Future Need:** If needed, use:
- Server-Sent Events (SSE) for simple updates
- Pusher/Ably for more complex realtime
- Neon's logical replication (advanced)

### 6. Storage/File Uploads

**Issue:** Supabase Storage won't be available.

**Current Usage:** None found (no file uploads implemented yet).

**Future Need:** Use Vercel Blob or Cloudflare R2 when needed.

### 7. Edge Function Equivalent

**Issue:** Supabase Edge Functions won't be available.

**Current Usage:** None deployed (mentioned as TODO for email resend).

**Mitigation:** Vercel serverless functions serve the same purpose.

### 8. Google Sheets Dual-Write

**Issue:** Current registration writes to both Google Sheets and Supabase.

**Current:** Works independently - just update Supabase calls to Neon.

### 9. Test Environment Isolation

**Issue:** Tests currently use Supabase test client with service role.

**Mitigation:** Neon branching provides better isolation:
- Create branch per PR/test run
- Full database copy, not shared state
- Delete branch after tests complete

---

## Environment Variables Comparison

### Old (Supabase — no longer used)

```env
# Frontend (old)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Backend (old)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### New (Neon + Better Auth)

```env
# Database (shared)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Frontend
NEXT_PUBLIC_APP_URL=https://tneexpress.com   # For auth client

# Backend
DATABASE_URL_UNPOOLED=postgresql://...  # For migrations
BETTER_AUTH_SECRET=your-secret-key      # Session signing
BETTER_AUTH_URL=https://tneexpress.com  # Auth base URL

# Existing (unchanged)
ANTHROPIC_API_KEY=sk-...
GOOGLE_PLACES_API_KEY=...
TURNSTILE_SECRET_KEY=...
GOOGLE_SERVICE_ACCOUNT_KEY=...
REGISTRATION_SHEET_ID=...
```

---

## Rollback Plan

If migration fails or issues arise:

### Immediate Rollback (< 24 hours)
1. Revert environment variables to Supabase
2. Deploy previous version from git
3. Supabase data should be intact (read-only during migration)

### Data Rollback (if Neon data was modified)
1. Export any new data created in Neon
2. Restore from Supabase (primary during transition)
3. Manually reconcile new records

### Feature Flag Approach (Recommended)
```typescript
// Use feature flags for gradual rollout
const USE_NEON = process.env.USE_NEON === 'true';

// In hooks/API calls:
if (USE_NEON) {
  return api.get('/teams');
} else {
  return supabase.from('teams').select();
}
```

---

## Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Neon project, Drizzle schema, Better Auth setup |
| 1-2 | Database | Schema migration, data migration script, verification |
| 2-3 | API Layer | All admin API routes, authorization middleware |
| 2-3 | Auth | Better Auth integration, AuthContext refactor |
| 3 | Hooks | All hooks refactored to use API client |
| 3-4 | Testing | Test infrastructure updates, E2E verification |
| 4 | Cutover | Production migration, monitoring, cleanup |

---

## Success Criteria

- [ ] All existing functionality works identically
- [ ] All E2E tests pass
- [ ] Admin dashboard fully functional
- [ ] Public pages load correctly
- [ ] Registration form submits successfully
- [ ] Login/logout works for all roles
- [ ] Role-based access enforced correctly
- [ ] Performance equal or better than Supabase
- [ ] Database branching works for preview deployments
- [ ] No data loss during migration

---

## Future Considerations

### Registration Database (Mentioned Requirement)

The current `registrations` table handles this. With Neon:
- Same schema, just in Neon
- API routes for CRUD operations
- Admin approval workflow unchanged
- Can add payment integration later (Stripe)

### Potential Enhancements Post-Migration

1. **Preview Deployments** - Each PR gets its own database branch
2. **Staging Environment** - Permanent branch for QA
3. **Point-in-Time Recovery** - Neon's branching enables this
4. **Read Replicas** - If performance needs grow
5. **Connection Pooling** - Neon's built-in pooler for serverless

---

## Next Steps

1. [ ] Review this plan and approve approach
2. [ ] Set up Neon project and get credentials
3. [ ] Decide on auth solution (Better Auth recommended)
4. [ ] Begin Phase 1: Foundation setup
5. [ ] Create GitHub issues for each phase

---

## Appendix: Dependency Changes

### Add

```json
{
  "@neondatabase/serverless": "^0.9.0",
  "drizzle-orm": "^0.30.0",
  "drizzle-kit": "^0.21.0",
  "better-auth": "^0.5.0",
  "@better-auth/react": "^0.5.0"
}
```

### Remove

```json
{
  "@supabase/supabase-js": "^2.x.x"
}
```

import { neonAuth } from '@neondatabase/auth/next/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/schema/userProfiles';
import { coaches, teams } from '@/lib/schema';
import { and, eq, or, inArray } from 'drizzle-orm';

type UserRole = 'admin' | 'coach' | 'parent';

interface AuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    role: UserRole;
  };
}

/**
 * Get the current Neon Auth session enriched with user_profiles data.
 * Uses neonAuth() which reads cookies from next/headers automatically.
 */
async function getEnrichedSession(): Promise<AuthSession | null> {
  const { session, user } = await neonAuth();

  if (!session || !user) return null;

  // Fetch role + profile fields from user_profiles
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, user.id));

  return {
    session: {
      id: session.id,
      userId: user.id,
      expiresAt: new Date(session.expiresAt),
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name || '',
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      role: (profile?.role as UserRole) ?? 'parent',
    },
  };
}

/**
 * Require authenticated user.
 * Returns session or throws 401.
 * The `request` param is kept for backward compatibility but unused —
 * Neon Auth reads cookies from next/headers.
 */
export async function requireAuth(_request?: Request): Promise<AuthSession> {
  const session = await getEnrichedSession();

  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return session;
}

/**
 * Require admin role.
 * Returns session or throws 401/403.
 */
export async function requireAdmin(_request?: Request): Promise<AuthSession> {
  const session = await requireAuth();

  if (session.user.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return session;
}

/**
 * Require one of the specified roles.
 * Returns session or throws 401/403.
 */
export async function requireRole(
  _request: Request,
  roles: UserRole[]
): Promise<AuthSession> {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    throw new Response(
      JSON.stringify({
        error: `Forbidden: Requires one of: ${roles.join(', ')}`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return session;
}

/**
 * Optional auth - returns session if present, null otherwise.
 */
export async function optionalAuth(_request?: Request): Promise<AuthSession | null> {
  try {
    return await getEnrichedSession();
  } catch {
    return null;
  }
}

/**
 * Check if user is admin without throwing.
 */
export async function isAdmin(_request?: Request): Promise<boolean> {
  const session = await optionalAuth();
  return session?.user.role === 'admin';
}

/**
 * Check if user has any of the specified roles.
 */
export async function hasRole(_request: Request, roles: UserRole[]): Promise<boolean> {
  const session = await optionalAuth();
  return session ? roles.includes(session.user.role) : false;
}

/**
 * Resolve a user ID to the team IDs they coach.
 */
export async function getCoachTeamIds(userId: string): Promise<string[]> {
  const coachRecords = await db
    .select({ id: coaches.id })
    .from(coaches)
    .where(and(eq(coaches.profileId, userId), eq(coaches.isActive, true)));

  if (coachRecords.length === 0) return [];
  const coachIds = coachRecords.map(c => c.id);

  const teamRecords = await db
    .select({ id: teams.id })
    .from(teams)
    .where(or(
      inArray(teams.headCoachId, coachIds),
      inArray(teams.assistantCoachId, coachIds)
    ));

  return teamRecords.map(t => t.id);
}

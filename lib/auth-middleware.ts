import { auth } from './auth';
import { db } from '@/lib/db';
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
    firstName?: string;
    lastName?: string;
    role: UserRole;
  };
}

/**
 * Require authenticated user
 * Returns session or throws 401
 */
export async function requireAuth(request: Request): Promise<AuthSession> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return session as AuthSession;
}

/**
 * Require admin role
 * Returns session or throws 401/403
 */
export async function requireAdmin(request: Request): Promise<AuthSession> {
  const session = await requireAuth(request);

  if (session.user.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return session;
}

/**
 * Require one of the specified roles
 * Returns session or throws 401/403
 */
export async function requireRole(
  request: Request,
  roles: UserRole[]
): Promise<AuthSession> {
  const session = await requireAuth(request);

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
 * Optional auth - returns session if present, null otherwise
 * Use for routes that have different behavior for authenticated vs anonymous users
 */
export async function optionalAuth(request: Request): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session as AuthSession | null;
  } catch {
    return null;
  }
}

/**
 * Check if user is admin without throwing
 */
export async function isAdmin(request: Request): Promise<boolean> {
  const session = await optionalAuth(request);
  return session?.user.role === 'admin';
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(request: Request, roles: UserRole[]): Promise<boolean> {
  const session = await optionalAuth(request);
  return session ? roles.includes(session.user.role) : false;
}

/**
 * Resolve a user ID to the team IDs they coach.
 * Follows the chain: user.id → coaches.profileId → coaches.id → teams.headCoachId/assistantCoachId → teams.id
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

import { db } from '../lib/db';
import { tryoutSessions, tryoutSignups, seasons } from '../lib/schema';
import { eq, gte, and, sql } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch upcoming tryout sessions with signup counts
    const sessionsData = await db
      .select({
        id: tryoutSessions.id,
        seasonId: tryoutSessions.seasonId,
        seasonName: seasons.name,
        date: tryoutSessions.date,
        startTime: tryoutSessions.startTime,
        endTime: tryoutSessions.endTime,
        location: tryoutSessions.location,
        address: tryoutSessions.address,
        gradeLevels: tryoutSessions.gradeLevels,
        gender: tryoutSessions.gender,
        maxParticipants: tryoutSessions.maxParticipants,
        notes: tryoutSessions.notes,
        registrationOpen: tryoutSessions.registrationOpen,
        createdAt: tryoutSessions.createdAt,
      })
      .from(tryoutSessions)
      .leftJoin(seasons, eq(tryoutSessions.seasonId, seasons.id))
      .where(
        and(
          gte(tryoutSessions.date, today),
          eq(tryoutSessions.registrationOpen, true)
        )
      )
      .orderBy(tryoutSessions.date, tryoutSessions.startTime);

    // Get signup counts for each session
    const sessionIds = sessionsData.map((s) => s.id);
    let signupCounts: Record<string, number> = {};

    if (sessionIds.length > 0) {
      const counts = await db
        .select({
          sessionId: tryoutSignups.tryoutSessionId,
          count: sql<number>`count(*)::int`,
        })
        .from(tryoutSignups)
        .where(sql`${tryoutSignups.tryoutSessionId} IN ${sessionIds}`)
        .groupBy(tryoutSignups.tryoutSessionId);

      signupCounts = counts.reduce(
        (acc, c) => {
          acc[c.sessionId] = c.count;
          return acc;
        },
        {} as Record<string, number>
      );
    }

    // Transform to match frontend expectations
    const result = sessionsData.map((session) => {
      const signedUp = signupCounts[session.id] || 0;
      const spotsLeft = session.maxParticipants
        ? session.maxParticipants - signedUp
        : null;

      return {
        id: session.id,
        season_id: session.seasonId,
        season: session.seasonName
          ? { id: session.seasonId, name: session.seasonName }
          : null,
        date: session.date,
        start_time: session.startTime,
        end_time: session.endTime,
        location: session.location,
        address: session.address,
        grade_levels: session.gradeLevels,
        gender: session.gender,
        max_participants: session.maxParticipants,
        current_signups: signedUp,
        spots_remaining: spotsLeft,
        is_full: spotsLeft !== null && spotsLeft <= 0,
        notes: session.notes,
        registration_open: session.registrationOpen,
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // 1 minute cache (signups change frequently)
      },
    });
  } catch (error) {
    console.error('Error fetching tryout sessions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tryout sessions' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

import { db } from '../lib/db';
import { tryoutSessions, tryoutSignups, seasons } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const seasonId = url.searchParams.get('seasonId');
    const includeSignups = url.searchParams.get('includeSignups') === 'true';

    let whereClause = sql`true`;
    if (seasonId) {
      whereClause = sql`${tryoutSessions.seasonId} = ${seasonId}`;
    }

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
        updatedAt: tryoutSessions.updatedAt,
      })
      .from(tryoutSessions)
      .leftJoin(seasons, eq(tryoutSessions.seasonId, seasons.id))
      .where(whereClause)
      .orderBy(desc(tryoutSessions.date));

    // Get signup counts
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

    // Optionally get full signups data
    let signupsBySession: Record<string, Array<Record<string, unknown>>> = {};
    if (includeSignups && sessionIds.length > 0) {
      const signups = await db
        .select()
        .from(tryoutSignups)
        .where(sql`${tryoutSignups.tryoutSessionId} IN ${sessionIds}`)
        .orderBy(tryoutSignups.createdAt);

      signupsBySession = signups.reduce(
        (acc, s) => {
          if (!acc[s.tryoutSessionId]) acc[s.tryoutSessionId] = [];
          acc[s.tryoutSessionId].push({
            id: s.id,
            player_first_name: s.playerFirstName,
            player_last_name: s.playerLastName,
            player_date_of_birth: s.playerDateOfBirth,
            player_grade: s.playerGrade,
            player_gender: s.playerGender,
            parent_first_name: s.parentFirstName,
            parent_last_name: s.parentLastName,
            parent_email: s.parentEmail,
            parent_phone: s.parentPhone,
            status: s.status,
            created_at: s.createdAt,
          });
          return acc;
        },
        {} as Record<string, Array<Record<string, unknown>>>
      );
    }

    const result = sessionsData.map((session) => ({
      id: session.id,
      season_id: session.seasonId,
      date: session.date,
      start_time: session.startTime,
      end_time: session.endTime,
      location: session.location,
      address: session.address,
      grade_levels: session.gradeLevels,
      gender: session.gender,
      max_participants: session.maxParticipants,
      current_signups: signupCounts[session.id] || 0,
      notes: session.notes,
      registration_open: session.registrationOpen,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      season: session.seasonName
        ? { id: session.seasonId, name: session.seasonName }
        : null,
      signups: includeSignups ? signupsBySession[session.id] || [] : undefined,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
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

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newSession] = await db
      .insert(tryoutSessions)
      .values({
        seasonId: body.season_id,
        date: body.date,
        startTime: body.start_time,
        endTime: body.end_time,
        location: body.location,
        address: body.address,
        gradeLevels: body.grade_levels,
        gender: body.gender,
        maxParticipants: body.max_participants,
        notes: body.notes,
        registrationOpen: body.registration_open ?? true,
      })
      .returning();

    return new Response(JSON.stringify(newSession), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating tryout session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create tryout session' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing tryout session ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.date !== undefined) updateData.date = body.date;
    if (body.start_time !== undefined) updateData.startTime = body.start_time;
    if (body.end_time !== undefined) updateData.endTime = body.end_time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.grade_levels !== undefined)
      updateData.gradeLevels = body.grade_levels;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.max_participants !== undefined)
      updateData.maxParticipants = body.max_participants;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.registration_open !== undefined)
      updateData.registrationOpen = body.registration_open;

    const [updated] = await db
      .update(tryoutSessions)
      .set(updateData)
      .where(eq(tryoutSessions.id, id))
      .returning();

    if (!updated) {
      return new Response(
        JSON.stringify({ error: 'Tryout session not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating tryout session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update tryout session' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing tryout session ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await db.delete(tryoutSessions).where(eq(tryoutSessions.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting tryout session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete tryout session' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

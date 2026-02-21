import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tryoutSessions, tryoutSignups, seasons } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const seasonId = request.nextUrl.searchParams.get('seasonId');
    const includeSignups = request.nextUrl.searchParams.get('includeSignups') === 'true';

    let whereClause = sql`true`;
    if (seasonId) {
      whereClause = sql`${tryoutSessions.seasonId} = ${seasonId}`;
    }

    const sessionsData = await db
      .select({
        id: tryoutSessions.id,
        seasonId: tryoutSessions.seasonId,
        seasonName: seasons.name,
        name: tryoutSessions.name,
        date: tryoutSessions.date,
        startTime: tryoutSessions.startTime,
        endTime: tryoutSessions.endTime,
        location: tryoutSessions.location,
        gradeLevels: tryoutSessions.gradeLevels,
        gender: tryoutSessions.gender,
        maxCapacity: tryoutSessions.maxCapacity,
        notes: tryoutSessions.notes,
        isActive: tryoutSessions.isActive,
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
          sessionId: tryoutSignups.sessionId,
          count: sql<number>`count(*)::int`,
        })
        .from(tryoutSignups)
        .where(sql`${tryoutSignups.sessionId} IN ${sessionIds}`)
        .groupBy(tryoutSignups.sessionId);

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
        .where(sql`${tryoutSignups.sessionId} IN ${sessionIds}`)
        .orderBy(tryoutSignups.createdAt);

      signupsBySession = signups.reduce(
        (acc, s) => {
          if (!acc[s.sessionId]) acc[s.sessionId] = [];
          acc[s.sessionId].push({
            id: s.id,
            player_first_name: s.playerFirstName,
            player_last_name: s.playerLastName,
            player_date_of_birth: s.playerDateOfBirth,
            player_grade: s.playerCurrentGrade,
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
      name: session.name,
      date: session.date,
      start_time: session.startTime,
      end_time: session.endTime,
      location: session.location,
      grade_levels: session.gradeLevels,
      gender: session.gender,
      max_capacity: session.maxCapacity,
      current_signups: signupCounts[session.id] || 0,
      notes: session.notes,
      is_active: session.isActive,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      season: session.seasonName
        ? { id: session.seasonId, name: session.seasonName }
        : null,
      signups: includeSignups ? signupsBySession[session.id] || [] : undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching tryout sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tryout sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newSession] = await db
      .insert(tryoutSessions)
      .values({
        seasonId: body.season_id,
        name: body.name || 'Tryout Session',
        date: body.date,
        startTime: body.start_time,
        endTime: body.end_time,
        location: body.location,
        gradeLevels: body.grade_levels,
        gender: body.gender,
        maxCapacity: body.max_capacity ?? body.max_participants,
        notes: body.notes,
        isActive: body.is_active ?? true,
      })
      .returning();

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating tryout session:', error);
    return NextResponse.json(
      { error: 'Failed to create tryout session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing tryout session ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.start_time !== undefined) updateData.startTime = body.start_time;
    if (body.end_time !== undefined) updateData.endTime = body.end_time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.grade_levels !== undefined)
      updateData.gradeLevels = body.grade_levels;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.max_capacity !== undefined)
      updateData.maxCapacity = body.max_capacity;
    if (body.max_participants !== undefined)
      updateData.maxCapacity = body.max_participants;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.is_active !== undefined)
      updateData.isActive = body.is_active;

    const [updated] = await db
      .update(tryoutSessions)
      .set(updateData)
      .where(eq(tryoutSessions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Tryout session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating tryout session:', error);
    return NextResponse.json(
      { error: 'Failed to update tryout session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing tryout session ID' },
        { status: 400 }
      );
    }

    await db.delete(tryoutSessions).where(eq(tryoutSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting tryout session:', error);
    return NextResponse.json(
      { error: 'Failed to delete tryout session' },
      { status: 500 }
    );
  }
}

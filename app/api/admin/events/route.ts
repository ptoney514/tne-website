import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, teams, seasons } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const seasonId = request.nextUrl.searchParams.get('seasonId');
    const teamId = request.nextUrl.searchParams.get('teamId');
    const eventType = request.nextUrl.searchParams.get('eventType');

    let whereClause = sql`true`;
    if (seasonId) {
      whereClause = sql`${events.seasonId} = ${seasonId}`;
    }
    if (teamId) {
      whereClause = sql`${whereClause} AND ${events.teamId} = ${teamId}`;
    }
    if (eventType) {
      whereClause = sql`${whereClause} AND ${events.eventType} = ${eventType}`;
    }

    const eventsData = await db
      .select({
        id: events.id,
        seasonId: events.seasonId,
        seasonName: seasons.name,
        teamId: events.teamId,
        teamName: teams.name,
        teamGradeLevel: teams.gradeLevel,
        eventType: events.eventType,
        title: events.title,
        description: events.description,
        date: events.date,
        startTime: events.startTime,
        endTime: events.endTime,
        location: events.location,
        address: events.address,
        opponent: events.opponent,
        isHomeGame: events.isHomeGame,
        tournamentName: events.tournamentName,
        notes: events.notes,
        isCancelled: events.isCancelled,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .leftJoin(seasons, eq(events.seasonId, seasons.id))
      .leftJoin(teams, eq(events.teamId, teams.id))
      .where(whereClause)
      .orderBy(desc(events.date), events.startTime);

    const result = eventsData.map((event) => ({
      id: event.id,
      season_id: event.seasonId,
      team_id: event.teamId,
      event_type: event.eventType,
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      address: event.address,
      opponent: event.opponent,
      is_home_game: event.isHomeGame,
      tournament_name: event.tournamentName,
      notes: event.notes,
      is_cancelled: event.isCancelled,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      season: event.seasonName
        ? { id: event.seasonId, name: event.seasonName }
        : null,
      team: event.teamId
        ? {
            id: event.teamId,
            name: event.teamName,
            grade_level: event.teamGradeLevel,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newEvent] = await db
      .insert(events)
      .values({
        seasonId: body.season_id,
        teamId: body.team_id,
        eventType: body.event_type,
        title: body.title,
        description: body.description,
        date: body.date,
        startTime: body.start_time,
        endTime: body.end_time,
        location: body.location,
        address: body.address,
        opponent: body.opponent,
        isHomeGame: body.is_home_game,
        tournamentName: body.tournament_name,
        notes: body.notes,
        isCancelled: body.is_cancelled ?? false,
      })
      .returning();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.team_id !== undefined) updateData.teamId = body.team_id;
    if (body.event_type !== undefined) updateData.eventType = body.event_type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.start_time !== undefined) updateData.startTime = body.start_time;
    if (body.end_time !== undefined) updateData.endTime = body.end_time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.opponent !== undefined) updateData.opponent = body.opponent;
    if (body.is_home_game !== undefined) updateData.isHomeGame = body.is_home_game;
    if (body.tournament_name !== undefined)
      updateData.tournamentName = body.tournament_name;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.is_cancelled !== undefined) updateData.isCancelled = body.is_cancelled;

    const [updated] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

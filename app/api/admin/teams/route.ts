import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, coaches, seasons, teamRoster } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const seasonId = request.nextUrl.searchParams.get('seasonId');

    // Fetch teams with joins
    const teamsData = await db
      .select({
        id: teams.id,
        name: teams.name,
        gradeLevel: teams.gradeLevel,
        gender: teams.gender,
        practiceLocation: teams.practiceLocation,
        practiceDays: teams.practiceDays,
        practiceTime: teams.practiceTime,
        teamFee: teams.teamFee,
        uniformFee: teams.uniformFee,
        isActive: teams.isActive,
        seasonId: teams.seasonId,
        seasonName: seasons.name,
        headCoachId: teams.headCoachId,
        headCoachFirstName: coaches.firstName,
        headCoachLastName: coaches.lastName,
        assistantCoachId: teams.assistantCoachId,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .leftJoin(seasons, eq(teams.seasonId, seasons.id))
      .leftJoin(coaches, eq(teams.headCoachId, coaches.id))
      .where(seasonId ? eq(teams.seasonId, seasonId) : sql`true`)
      .orderBy(teams.gradeLevel);

    // Get roster counts
    const rosterCounts = await db
      .select({
        teamId: teamRoster.teamId,
        count: sql<number>`count(*)::int`,
      })
      .from(teamRoster)
      .where(eq(teamRoster.isActive, true))
      .groupBy(teamRoster.teamId);

    const countMap = rosterCounts.reduce(
      (acc, r) => {
        acc[r.teamId] = r.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const result = teamsData.map((team) => ({
      id: team.id,
      name: team.name,
      grade_level: team.gradeLevel,
      gender: team.gender,
      practice_location: team.practiceLocation,
      practice_days: team.practiceDays,
      practice_time: team.practiceTime,
      team_fee: team.teamFee,
      uniform_fee: team.uniformFee,
      is_active: team.isActive,
      season_id: team.seasonId,
      head_coach_id: team.headCoachId,
      assistant_coach_id: team.assistantCoachId,
      created_at: team.createdAt,
      updated_at: team.updatedAt,
      player_count: countMap[team.id] || 0,
      season: team.seasonName
        ? { id: team.seasonId, name: team.seasonName }
        : null,
      head_coach: team.headCoachId
        ? {
            id: team.headCoachId,
            first_name: team.headCoachFirstName,
            last_name: team.headCoachLastName,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newTeam] = await db
      .insert(teams)
      .values({
        seasonId: body.season_id,
        name: body.name,
        gradeLevel: body.grade_level,
        gender: body.gender,
        headCoachId: body.head_coach_id || null,
        assistantCoachId: body.assistant_coach_id || null,
        practiceLocation: body.practice_location,
        practiceDays: body.practice_days,
        practiceTime: body.practice_time,
        teamFee: body.team_fee,
        uniformFee: body.uniform_fee,
        isActive: body.is_active ?? true,
      })
      .returning();

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.grade_level !== undefined) updateData.gradeLevel = body.grade_level;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.head_coach_id !== undefined) updateData.headCoachId = body.head_coach_id;
    if (body.assistant_coach_id !== undefined)
      updateData.assistantCoachId = body.assistant_coach_id;
    if (body.practice_location !== undefined)
      updateData.practiceLocation = body.practice_location;
    if (body.practice_days !== undefined) updateData.practiceDays = body.practice_days;
    if (body.practice_time !== undefined) updateData.practiceTime = body.practice_time;
    if (body.team_fee !== undefined) updateData.teamFee = body.team_fee;
    if (body.uniform_fee !== undefined) updateData.uniformFee = body.uniform_fee;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const [updated] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
    }

    await db.delete(teams).where(eq(teams.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}

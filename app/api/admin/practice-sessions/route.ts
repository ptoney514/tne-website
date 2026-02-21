import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practiceSessions, practiceSessionTeams, teams, seasons } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin, requireRole, getCoachTeamIds } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['admin', 'coach']);
    const isCoach = session.user.role === 'coach';

    let coachTeamIds: string[] = [];
    if (isCoach) {
      coachTeamIds = await getCoachTeamIds(session.user.id);
      if (coachTeamIds.length === 0) return NextResponse.json([]);
    }

    const id = request.nextUrl.searchParams.get('id');
    const teamId = request.nextUrl.searchParams.get('teamId');

    // Get practice sessions for a specific team
    if (teamId) {
      // Coach can only access their own teams
      if (isCoach && !coachTeamIds.includes(teamId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const teamPractices = await db
        .select({
          id: practiceSessionTeams.id,
          practiceSession: practiceSessions,
        })
        .from(practiceSessionTeams)
        .innerJoin(practiceSessions, eq(practiceSessionTeams.practiceSessionId, practiceSessions.id))
        .where(
          and(
            eq(practiceSessionTeams.teamId, teamId),
            eq(practiceSessions.isActive, true)
          )
        );

      return NextResponse.json(teamPractices.map(p => p.practiceSession));
    }

    if (id) {
      const practice = await db
        .select()
        .from(practiceSessions)
        .where(eq(practiceSessions.id, id))
        .limit(1);

      if (practice.length === 0) {
        return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
      }

      // Coach: verify practice involves at least one of their teams
      if (isCoach) {
        const practiceTeamAssignments = await db
          .select({ teamId: practiceSessionTeams.teamId })
          .from(practiceSessionTeams)
          .where(eq(practiceSessionTeams.practiceSessionId, id));

        const involvesCoachTeam = practiceTeamAssignments.some(
          t => coachTeamIds.includes(t.teamId)
        );
        if (!involvesCoachTeam) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return NextResponse.json(practice[0]);
    }

    // Get all practices with their assigned teams and season
    const allPractices = await db
      .select({
        practice: practiceSessions,
        season: seasons,
      })
      .from(practiceSessions)
      .leftJoin(seasons, eq(practiceSessions.seasonId, seasons.id))
      .orderBy(practiceSessions.dayOfWeek);

    // Get team assignments for each practice
    const practiceIds = allPractices.map(p => p.practice.id);
    const assignments = practiceIds.length > 0
      ? await db
          .select({
            practiceSessionId: practiceSessionTeams.practiceSessionId,
            teamId: practiceSessionTeams.teamId,
            team: teams,
          })
          .from(practiceSessionTeams)
          .innerJoin(teams, eq(practiceSessionTeams.teamId, teams.id))
      : [];

    // Group assignments by practice
    const assignmentMap = new Map();
    for (const a of assignments) {
      if (!assignmentMap.has(a.practiceSessionId)) {
        assignmentMap.set(a.practiceSessionId, []);
      }
      assignmentMap.get(a.practiceSessionId).push({
        id: a.teamId,
        team: a.team,
      });
    }

    let result = allPractices.map(p => ({
      ...p.practice,
      season: p.season,
      practice_session_teams: assignmentMap.get(p.practice.id) || [],
    }));

    // Coach: filter to practices that include at least one of their teams
    if (isCoach) {
      result = result.filter(p =>
        p.practice_session_teams.some((t: { id: string }) => coachTeamIds.includes(t.id))
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin practice-sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { teamIds, ...practiceData } = body;

    // Get active season if not provided
    if (!practiceData.seasonId) {
      const activeSeason = await db
        .select()
        .from(seasons)
        .where(eq(seasons.isActive, true))
        .limit(1);

      if (activeSeason.length === 0) {
        return NextResponse.json({ error: 'No active season found' }, { status: 400 });
      }
      practiceData.seasonId = activeSeason[0].id;
    }

    const [newPractice] = await db
      .insert(practiceSessions)
      .values(practiceData)
      .returning();

    // Assign teams if provided
    if (teamIds && teamIds.length > 0) {
      const assignmentData = teamIds.map((teamId: string) => ({
        practiceSessionId: newPractice.id,
        teamId,
      }));

      await db.insert(practiceSessionTeams).values(assignmentData);
    }

    return NextResponse.json(newPractice, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin practice-sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Practice session ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { teamIds, ...updates } = body;

    const [updated] = await db
      .update(practiceSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(practiceSessions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
    }

    // Update team assignments if provided
    if (teamIds !== undefined) {
      // Delete existing assignments
      await db
        .delete(practiceSessionTeams)
        .where(eq(practiceSessionTeams.practiceSessionId, id));

      // Add new assignments
      if (teamIds.length > 0) {
        const assignmentData = teamIds.map((teamId: string) => ({
          practiceSessionId: id,
          teamId,
        }));

        await db.insert(practiceSessionTeams).values(assignmentData);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin practice-sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Practice session ID required' }, { status: 400 });
    }

    // Delete team assignments first (cascade should handle this but being explicit)
    await db
      .delete(practiceSessionTeams)
      .where(eq(practiceSessionTeams.practiceSessionId, id));

    await db.delete(practiceSessions).where(eq(practiceSessions.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin practice-sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

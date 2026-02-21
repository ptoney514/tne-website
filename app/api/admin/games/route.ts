import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, gameTeams, teams, tournamentDetails, tournamentHotels, tournamentNearbyPlaces } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const seasonId = request.nextUrl.searchParams.get('seasonId');
    const gameType = request.nextUrl.searchParams.get('gameType');

    if (id) {
      // Get single game with all related data
      const game = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
        .limit(1);

      if (game.length === 0) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }

      // Get team assignments
      const teamAssignments = await db
        .select({
          gameTeam: gameTeams,
          team: teams,
        })
        .from(gameTeams)
        .innerJoin(teams, eq(gameTeams.teamId, teams.id))
        .where(eq(gameTeams.gameId, id));

      return NextResponse.json({
        ...game[0],
        game_teams: teamAssignments.map(t => ({
          ...t.gameTeam,
          team: t.team,
        })),
      });
    }

    // Build query conditions
    const conditions = [];
    if (seasonId) conditions.push(eq(games.seasonId, seasonId));
    if (gameType) conditions.push(eq(games.gameType, gameType as 'game' | 'tournament'));

    let query = db.select().from(games);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const allGames = await query.orderBy(games.date);

    // Get team counts for each game
    const gameIds = allGames.map(g => g.id);
    const teamCounts = gameIds.length > 0
      ? await db
          .select({
            gameId: gameTeams.gameId,
            teamId: gameTeams.teamId,
            teamName: teams.name,
            teamGradeLevel: teams.gradeLevel,
            teamGender: teams.gender,
          })
          .from(gameTeams)
          .innerJoin(teams, eq(gameTeams.teamId, teams.id))
          .where(sql`${gameTeams.gameId} IN ${gameIds}`)
      : [];

    // Group by game
    const countMap = new Map<string, any[]>();
    for (const t of teamCounts) {
      if (!countMap.has(t.gameId)) {
        countMap.set(t.gameId, []);
      }
      countMap.get(t.gameId)!.push(t);
    }

    const result = allGames.map(g => ({
      ...g,
      teams_count: countMap.get(g.id)?.length || 0,
      game_teams: (countMap.get(g.id) || []).map((assignment) => ({
        game_id: assignment.gameId,
        team_id: assignment.teamId,
        team: {
          id: assignment.teamId,
          name: assignment.teamName,
          grade_level: assignment.teamGradeLevel,
          gender: assignment.teamGender,
        },
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin games error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { teamIds, ...gameData } = body;

    const [newGame] = await db
      .insert(games)
      .values(gameData)
      .returning();

    // Assign teams if provided
    if (teamIds && teamIds.length > 0) {
      const assignmentData = teamIds.map((teamId: string) => ({
        gameId: newGame.id,
        teamId,
      }));

      await db.insert(gameTeams).values(assignmentData);
    }

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin games error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { teamIds, ...updates } = body;

    const [updated] = await db
      .update(games)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Update team assignments if provided
    if (teamIds !== undefined) {
      await db.delete(gameTeams).where(eq(gameTeams.gameId, id));

      if (teamIds.length > 0) {
        const assignmentData = teamIds.map((teamId: string) => ({
          gameId: id,
          teamId,
        }));

        await db.insert(gameTeams).values(assignmentData);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin games error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    // Delete related data first
    await db.delete(gameTeams).where(eq(gameTeams.gameId, id));

    // Delete tournament details if any
    const details = await db
      .select()
      .from(tournamentDetails)
      .where(eq(tournamentDetails.gameId, id));

    for (const detail of details) {
      await db.delete(tournamentHotels).where(eq(tournamentHotels.tournamentDetailId, detail.id));
      await db.delete(tournamentNearbyPlaces).where(eq(tournamentNearbyPlaces.tournamentDetailId, detail.id));
      await db.delete(tournamentDetails).where(eq(tournamentDetails.id, detail.id));
    }

    await db.delete(games).where(eq(games.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin games error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

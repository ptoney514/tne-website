import { db } from '../lib/db';
import { events, teams, seasons, games, gameTeams } from '../lib/schema';
import { eq, gte, and, or, sql } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teamId = url.searchParams.get('teamId');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const today = new Date().toISOString().split('T')[0];

    // Fetch events
    const eventsQuery = db
      .select({
        id: events.id,
        type: sql<string>`'event'`,
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
        teamId: events.teamId,
        teamName: teams.name,
        teamGradeLevel: teams.gradeLevel,
        teamGender: teams.gender,
      })
      .from(events)
      .leftJoin(teams, eq(events.teamId, teams.id))
      .where(
        and(
          gte(events.date, today),
          teamId ? eq(events.teamId, teamId) : sql`true`
        )
      )
      .orderBy(events.date, events.startTime)
      .limit(limit);

    // Fetch games with team assignments
    const gamesQuery = db
      .select({
        id: games.id,
        type: sql<string>`'game'`,
        gameType: games.gameType,
        name: games.name,
        description: games.description,
        date: games.date,
        endDate: games.endDate,
        startTime: games.startTime,
        endTime: games.endTime,
        location: games.location,
        address: games.address,
        externalUrl: games.externalUrl,
        isFeatured: games.isFeatured,
        notes: games.notes,
        isCancelled: games.isCancelled,
      })
      .from(games)
      .where(gte(games.date, today))
      .orderBy(games.date, games.startTime)
      .limit(limit);

    const [eventsData, gamesData] = await Promise.all([
      eventsQuery,
      gamesQuery,
    ]);

    // Fetch game teams for games
    const gameIds = gamesData.map((g) => g.id);
    let gameTeamsData: Array<{
      gameId: string;
      teamId: string;
      opponent: string | null;
      isHomeGame: boolean | null;
      result: string | null;
      teamName: string;
      teamGradeLevel: string;
      teamGender: string;
    }> = [];

    if (gameIds.length > 0) {
      gameTeamsData = await db
        .select({
          gameId: gameTeams.gameId,
          teamId: gameTeams.teamId,
          opponent: gameTeams.opponent,
          isHomeGame: gameTeams.isHomeGame,
          result: gameTeams.result,
          teamName: teams.name,
          teamGradeLevel: teams.gradeLevel,
          teamGender: teams.gender,
        })
        .from(gameTeams)
        .innerJoin(teams, eq(gameTeams.teamId, teams.id))
        .where(sql`${gameTeams.gameId} IN ${gameIds}`);
    }

    // Transform events
    const transformedEvents = eventsData.map((event) => ({
      id: event.id,
      type: 'event',
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
      team: event.teamId
        ? {
            id: event.teamId,
            name: event.teamName,
            grade_level: event.teamGradeLevel,
            gender: event.teamGender,
          }
        : null,
    }));

    // Transform games with team assignments
    const transformedGames = gamesData.map((game) => {
      const assignedTeams = gameTeamsData
        .filter((gt) => gt.gameId === game.id)
        .map((gt) => ({
          team_id: gt.teamId,
          opponent: gt.opponent,
          is_home_game: gt.isHomeGame,
          result: gt.result,
          team: {
            id: gt.teamId,
            name: gt.teamName,
            grade_level: gt.teamGradeLevel,
            gender: gt.teamGender,
          },
        }));

      return {
        id: game.id,
        type: game.gameType,
        event_type: game.gameType,
        title: game.name,
        description: game.description,
        date: game.date,
        end_date: game.endDate,
        start_time: game.startTime,
        end_time: game.endTime,
        location: game.location,
        address: game.address,
        external_url: game.externalUrl,
        is_featured: game.isFeatured,
        notes: game.notes,
        is_cancelled: game.isCancelled,
        game_teams: assignedTeams,
        teams_count: assignedTeams.length,
      };
    });

    // Combine and sort by date
    const combined = [...transformedEvents, ...transformedGames].sort(
      (a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.start_time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      }
    );

    return new Response(JSON.stringify(combined), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching public schedule:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch schedule' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

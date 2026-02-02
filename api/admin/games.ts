import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { games, gameTeams, teams, tournamentDetails, tournamentHotels, tournamentNearbyPlaces, hotels, nearbyPlaces, venues } from '../lib/schema';
import { eq, and, gte } from 'drizzle-orm';
import { requireAdmin } from '../lib/auth-middleware';

export const config = {
  runtime: 'nodejs',
};

async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id, seasonId, gameType } = req.query;

        if (id) {
          // Get single game with all related data
          const game = await db
            .select()
            .from(games)
            .where(eq(games.id, id as string))
            .limit(1);

          if (game.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
          }

          // Get team assignments
          const teamAssignments = await db
            .select({
              gameTeam: gameTeams,
              team: teams,
            })
            .from(gameTeams)
            .innerJoin(teams, eq(gameTeams.teamId, teams.id))
            .where(eq(gameTeams.gameId, id as string));

          return res.status(200).json({
            ...game[0],
            game_teams: teamAssignments.map(t => ({
              ...t.gameTeam,
              team: t.team,
            })),
          });
        }

        // Build query conditions
        const conditions = [];
        if (seasonId) conditions.push(eq(games.seasonId, seasonId as string));
        if (gameType) conditions.push(eq(games.gameType, gameType as string));

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
              })
              .from(gameTeams)
              .innerJoin(teams, eq(gameTeams.teamId, teams.id))
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
          game_teams: countMap.get(g.id) || [],
        }));

        return res.status(200).json(result);
      }

      case 'POST': {
        const { teamIds, ...gameData } = req.body;

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

        return res.status(201).json(newGame);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Game ID required' });
        }

        const { teamIds, ...updates } = req.body;

        const [updated] = await db
          .update(games)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(games.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Game not found' });
        }

        // Update team assignments if provided
        if (teamIds !== undefined) {
          await db.delete(gameTeams).where(eq(gameTeams.gameId, id as string));

          if (teamIds.length > 0) {
            const assignmentData = teamIds.map((teamId: string) => ({
              gameId: id as string,
              teamId,
            }));

            await db.insert(gameTeams).values(assignmentData);
          }
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Game ID required' });
        }

        // Delete related data first
        await db.delete(gameTeams).where(eq(gameTeams.gameId, id as string));

        // Delete tournament details if any
        const details = await db
          .select()
          .from(tournamentDetails)
          .where(eq(tournamentDetails.gameId, id as string));

        for (const detail of details) {
          await db.delete(tournamentHotels).where(eq(tournamentHotels.tournamentDetailId, detail.id));
          await db.delete(tournamentNearbyPlaces).where(eq(tournamentNearbyPlaces.tournamentDetailId, detail.id));
          await db.delete(tournamentDetails).where(eq(tournamentDetails.id, detail.id));
        }

        await db.delete(games).where(eq(games.id, id as string));

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin games error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

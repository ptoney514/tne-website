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
        const { id, gameId } = req.query;

        // Get tournament detail by game ID
        if (gameId) {
          const detail = await db
            .select()
            .from(tournamentDetails)
            .where(eq(tournamentDetails.gameId, gameId as string))
            .limit(1);

          if (detail.length === 0) {
            return res.status(200).json(null);
          }

          // Get venue, hotels, and places
          const detailId = detail[0].id;

          const venue = detail[0].venueId
            ? await db.select().from(venues).where(eq(venues.id, detail[0].venueId)).limit(1)
            : [];

          const hotelLinks = await db
            .select({
              link: tournamentHotels,
              hotel: hotels,
            })
            .from(tournamentHotels)
            .innerJoin(hotels, eq(tournamentHotels.hotelId, hotels.id))
            .where(eq(tournamentHotels.tournamentDetailId, detailId));

          const placeLinks = await db
            .select({
              link: tournamentNearbyPlaces,
              place: nearbyPlaces,
            })
            .from(tournamentNearbyPlaces)
            .innerJoin(nearbyPlaces, eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaces.id))
            .where(eq(tournamentNearbyPlaces.tournamentDetailId, detailId));

          return res.status(200).json({
            ...detail[0],
            venue: venue[0] || null,
            tournament_hotels: hotelLinks.map(h => ({ ...h.link, hotel: h.hotel })),
            tournament_nearby_places: placeLinks.map(p => ({ ...p.link, nearby_place: p.place })),
          });
        }

        // Get tournament detail by ID
        if (id) {
          const detail = await db
            .select()
            .from(tournamentDetails)
            .where(eq(tournamentDetails.id, id as string))
            .limit(1);

          if (detail.length === 0) {
            return res.status(404).json({ error: 'Tournament details not found' });
          }

          return res.status(200).json(detail[0]);
        }

        // List all tournament games with details
        const tournamentGames = await db
          .select()
          .from(games)
          .where(eq(games.gameType, 'tournament'))
          .orderBy(games.date);

        return res.status(200).json(tournamentGames);
      }

      case 'POST': {
        const { gameId, ...detailsData } = req.body;

        if (!gameId) {
          return res.status(400).json({ error: 'Game ID required' });
        }

        // Check if details already exist
        const existing = await db
          .select()
          .from(tournamentDetails)
          .where(eq(tournamentDetails.gameId, gameId))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          const [updated] = await db
            .update(tournamentDetails)
            .set({ ...detailsData, updatedAt: new Date() })
            .where(eq(tournamentDetails.gameId, gameId))
            .returning();

          return res.status(200).json(updated);
        }

        // Create new
        const [newDetail] = await db
          .insert(tournamentDetails)
          .values({ gameId, ...detailsData })
          .returning();

        return res.status(201).json(newDetail);
      }

      case 'PATCH': {
        const { id, gameId } = req.query;

        const whereClause = id
          ? eq(tournamentDetails.id, id as string)
          : gameId
            ? eq(tournamentDetails.gameId, gameId as string)
            : null;

        if (!whereClause) {
          return res.status(400).json({ error: 'Detail ID or Game ID required' });
        }

        const updates = req.body;

        const [updated] = await db
          .update(tournamentDetails)
          .set({ ...updates, updatedAt: new Date() })
          .where(whereClause)
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Tournament details not found' });
        }

        return res.status(200).json(updated);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin tournaments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

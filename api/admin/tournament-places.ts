import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { tournamentNearbyPlaces, nearbyPlaces, tournamentDetails } from '../lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '../lib/auth-middleware';

export const config = {
  runtime: 'nodejs',
};

async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { tournamentDetailId } = req.query;

        if (!tournamentDetailId) {
          return res.status(400).json({ error: 'Tournament detail ID required' });
        }

        const placeLinks = await db
          .select({
            link: tournamentNearbyPlaces,
            place: nearbyPlaces,
          })
          .from(tournamentNearbyPlaces)
          .innerJoin(nearbyPlaces, eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaces.id))
          .where(eq(tournamentNearbyPlaces.tournamentDetailId, tournamentDetailId as string));

        return res.status(200).json(placeLinks.map(p => ({ ...p.link, nearby_place: p.place })));
      }

      case 'POST': {
        const { tournamentDetailId, nearbyPlaceId, ...linkInfo } = req.body;

        if (!tournamentDetailId || !nearbyPlaceId) {
          return res.status(400).json({ error: 'Tournament detail ID and nearby place ID required' });
        }

        // Handle bulk insert
        if (Array.isArray(req.body)) {
          const newLinks = await db
            .insert(tournamentNearbyPlaces)
            .values(req.body)
            .returning();

          // Update places_populated_at timestamp
          const detailId = req.body[0]?.tournamentDetailId;
          if (detailId) {
            await db
              .update(tournamentDetails)
              .set({ placesPopulatedAt: new Date() })
              .where(eq(tournamentDetails.id, detailId));
          }

          return res.status(201).json(newLinks);
        }

        const [newLink] = await db
          .insert(tournamentNearbyPlaces)
          .values({ tournamentDetailId, nearbyPlaceId, ...linkInfo })
          .returning();

        return res.status(201).json(newLink);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Link ID required' });
        }

        const updates = req.body;

        const [updated] = await db
          .update(tournamentNearbyPlaces)
          .set(updates)
          .where(eq(tournamentNearbyPlaces.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Tournament place link not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id, tournamentDetailId, nearbyPlaceId } = req.query;

        if (id) {
          await db.delete(tournamentNearbyPlaces).where(eq(tournamentNearbyPlaces.id, id as string));
        } else if (tournamentDetailId && nearbyPlaceId) {
          await db
            .delete(tournamentNearbyPlaces)
            .where(
              and(
                eq(tournamentNearbyPlaces.tournamentDetailId, tournamentDetailId as string),
                eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaceId as string)
              )
            );
        } else {
          return res.status(400).json({ error: 'Link ID or (tournamentDetailId and nearbyPlaceId) required' });
        }

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin tournament-places error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

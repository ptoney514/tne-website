import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { nearbyPlaces } from '../lib/schema';
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
        const { id, city, state, placeType, googlePlaceId } = req.query;

        if (id) {
          const place = await db
            .select()
            .from(nearbyPlaces)
            .where(eq(nearbyPlaces.id, id as string))
            .limit(1);

          if (place.length === 0) {
            return res.status(404).json({ error: 'Place not found' });
          }
          return res.status(200).json(place[0]);
        }

        // Find by Google Place ID (for deduplication)
        if (googlePlaceId) {
          const place = await db
            .select()
            .from(nearbyPlaces)
            .where(eq(nearbyPlaces.googlePlaceId, googlePlaceId as string))
            .limit(1);

          return res.status(200).json(place[0] || null);
        }

        // Filter by location and/or type
        const conditions = [];
        if (city) conditions.push(eq(nearbyPlaces.city, city as string));
        if (state) conditions.push(eq(nearbyPlaces.state, state as string));
        if (placeType && placeType !== 'all') {
          conditions.push(eq(nearbyPlaces.placeType, placeType as string));
        }

        let query = db.select().from(nearbyPlaces);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as typeof query;
        }

        const allPlaces = await query.orderBy(nearbyPlaces.name);

        return res.status(200).json(allPlaces);
      }

      case 'POST': {
        const placeData = req.body;

        // Handle bulk insert
        if (Array.isArray(placeData)) {
          const newPlaces = await db
            .insert(nearbyPlaces)
            .values(placeData)
            .returning();

          return res.status(201).json(newPlaces);
        }

        const [newPlace] = await db
          .insert(nearbyPlaces)
          .values(placeData)
          .returning();

        return res.status(201).json(newPlace);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Place ID required' });
        }

        const updates = req.body;

        const [updated] = await db
          .update(nearbyPlaces)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(nearbyPlaces.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Place not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Place ID required' });
        }

        await db.delete(nearbyPlaces).where(eq(nearbyPlaces.id, id as string));

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin nearby-places error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

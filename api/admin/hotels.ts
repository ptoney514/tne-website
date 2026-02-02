import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { hotels } from '../lib/schema';
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
        const { id, city, state, googlePlaceId } = req.query;

        if (id) {
          const hotel = await db
            .select()
            .from(hotels)
            .where(eq(hotels.id, id as string))
            .limit(1);

          if (hotel.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
          }
          return res.status(200).json(hotel[0]);
        }

        // Find by Google Place ID (for deduplication)
        if (googlePlaceId) {
          const hotel = await db
            .select()
            .from(hotels)
            .where(eq(hotels.googlePlaceId, googlePlaceId as string))
            .limit(1);

          return res.status(200).json(hotel[0] || null);
        }

        // Filter by location
        if (city && state) {
          const locationHotels = await db
            .select()
            .from(hotels)
            .where(
              and(
                eq(hotels.city, city as string),
                eq(hotels.state, state as string)
              )
            )
            .orderBy(hotels.name);

          return res.status(200).json(locationHotels);
        }

        const allHotels = await db
          .select()
          .from(hotels)
          .orderBy(hotels.name);

        return res.status(200).json(allHotels);
      }

      case 'POST': {
        const hotelData = req.body;

        // Handle bulk insert
        if (Array.isArray(hotelData)) {
          const newHotels = await db
            .insert(hotels)
            .values(hotelData)
            .returning();

          return res.status(201).json(newHotels);
        }

        const [newHotel] = await db
          .insert(hotels)
          .values(hotelData)
          .returning();

        return res.status(201).json(newHotel);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Hotel ID required' });
        }

        const updates = req.body;

        const [updated] = await db
          .update(hotels)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(hotels.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Hotel not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Hotel ID required' });
        }

        await db.delete(hotels).where(eq(hotels.id, id as string));

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin hotels error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

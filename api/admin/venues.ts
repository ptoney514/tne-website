import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { venues } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../lib/auth-middleware';

export const config = {
  runtime: 'nodejs',
};

async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id } = req.query;

        if (id) {
          const venue = await db
            .select()
            .from(venues)
            .where(eq(venues.id, id as string))
            .limit(1);

          if (venue.length === 0) {
            return res.status(404).json({ error: 'Venue not found' });
          }
          return res.status(200).json(venue[0]);
        }

        const allVenues = await db
          .select()
          .from(venues)
          .orderBy(venues.name);

        return res.status(200).json(allVenues);
      }

      case 'POST': {
        const venueData = req.body;

        const [newVenue] = await db
          .insert(venues)
          .values(venueData)
          .returning();

        return res.status(201).json(newVenue);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Venue ID required' });
        }

        const updates = req.body;

        const [updated] = await db
          .update(venues)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(venues.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Venue not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Venue ID required' });
        }

        await db.delete(venues).where(eq(venues.id, id as string));

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin venues error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

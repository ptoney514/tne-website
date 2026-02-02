import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { tournamentHotels, tournamentDetails, hotels } from '../lib/schema';
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

        const hotelLinks = await db
          .select({
            link: tournamentHotels,
            hotel: hotels,
          })
          .from(tournamentHotels)
          .innerJoin(hotels, eq(tournamentHotels.hotelId, hotels.id))
          .where(eq(tournamentHotels.tournamentDetailId, tournamentDetailId as string));

        return res.status(200).json(hotelLinks.map(h => ({ ...h.link, hotel: h.hotel })));
      }

      case 'POST': {
        const { tournamentDetailId, hotelId, ...rateInfo } = req.body;

        if (!tournamentDetailId || !hotelId) {
          return res.status(400).json({ error: 'Tournament detail ID and hotel ID required' });
        }

        // Handle bulk insert
        if (Array.isArray(req.body)) {
          const newLinks = await db
            .insert(tournamentHotels)
            .values(req.body)
            .returning();

          return res.status(201).json(newLinks);
        }

        const [newLink] = await db
          .insert(tournamentHotels)
          .values({ tournamentDetailId, hotelId, ...rateInfo })
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
          .update(tournamentHotels)
          .set(updates)
          .where(eq(tournamentHotels.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Tournament hotel link not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id, tournamentDetailId, hotelId } = req.query;

        if (id) {
          await db.delete(tournamentHotels).where(eq(tournamentHotels.id, id as string));
        } else if (tournamentDetailId && hotelId) {
          await db
            .delete(tournamentHotels)
            .where(
              and(
                eq(tournamentHotels.tournamentDetailId, tournamentDetailId as string),
                eq(tournamentHotels.hotelId, hotelId as string)
              )
            );
        } else {
          return res.status(400).json({ error: 'Link ID or (tournamentDetailId and hotelId) required' });
        }

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin tournament-hotels error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

import { db } from '../lib/db';
import { seasons } from '../lib/schema';
import { desc, eq, gte, lte, and, or, sql } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    const currentOnly = url.searchParams.get('currentOnly') === 'true';

    const today = new Date().toISOString().split('T')[0];

    let query = db.select().from(seasons);

    if (currentOnly) {
      // Only return the current season (date range includes today)
      query = query.where(
        and(
          lte(seasons.startDate, today),
          gte(seasons.endDate, today)
        )
      ) as typeof query;
    } else if (!includeInactive) {
      // Only return active or current/upcoming seasons
      query = query.where(
        or(
          eq(seasons.isActive, true),
          gte(seasons.endDate, today)
        )
      ) as typeof query;
    }

    const seasonsData = await query.orderBy(desc(seasons.startDate));

    // Transform to match frontend expectations
    const result = seasonsData.map((season) => ({
      id: season.id,
      name: season.name,
      start_date: season.startDate,
      end_date: season.endDate,
      is_active: season.isActive,
      tryouts_open: season.tryoutsOpen,
      registration_open: season.registrationOpen,
      created_at: season.createdAt,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch seasons' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

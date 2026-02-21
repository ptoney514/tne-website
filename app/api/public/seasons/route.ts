import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasons } from '@/lib/schema';
import { desc, eq, gte, lte, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';
    const currentOnly = request.nextUrl.searchParams.get('currentOnly') === 'true';

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

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}

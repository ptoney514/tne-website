import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, tournamentDetails, tournamentHotels, tournamentNearbyPlaces, hotels, nearbyPlaces, venues } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const gameId = request.nextUrl.searchParams.get('gameId');

    // Get tournament detail by game ID
    if (gameId) {
      const detail = await db
        .select()
        .from(tournamentDetails)
        .where(eq(tournamentDetails.gameId, gameId))
        .limit(1);

      if (detail.length === 0) {
        return NextResponse.json(null);
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

      return NextResponse.json({
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
        .where(eq(tournamentDetails.id, id))
        .limit(1);

      if (detail.length === 0) {
        return NextResponse.json({ error: 'Tournament details not found' }, { status: 404 });
      }

      return NextResponse.json(detail[0]);
    }

    // List all tournament games with details
    const tournamentGames = await db
      .select()
      .from(games)
      .where(eq(games.gameType, 'tournament'))
      .orderBy(games.date);

    return NextResponse.json(tournamentGames);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournaments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { gameId, ...detailsData } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
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

      return NextResponse.json(updated);
    }

    // Create new
    const [newDetail] = await db
      .insert(tournamentDetails)
      .values({ gameId, ...detailsData })
      .returning();

    return NextResponse.json(newDetail, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournaments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const gameId = request.nextUrl.searchParams.get('gameId');

    const whereClause = id
      ? eq(tournamentDetails.id, id)
      : gameId
        ? eq(tournamentDetails.gameId, gameId)
        : null;

    if (!whereClause) {
      return NextResponse.json({ error: 'Detail ID or Game ID required' }, { status: 400 });
    }

    const updates = await request.json();

    const [updated] = await db
      .update(tournamentDetails)
      .set({ ...updates, updatedAt: new Date() })
      .where(whereClause)
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Tournament details not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournaments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tournamentNearbyPlaces, nearbyPlaces, tournamentDetails } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const tournamentDetailId = request.nextUrl.searchParams.get('tournamentDetailId');

    if (!tournamentDetailId) {
      return NextResponse.json({ error: 'Tournament detail ID required' }, { status: 400 });
    }

    const placeLinks = await db
      .select({
        link: tournamentNearbyPlaces,
        place: nearbyPlaces,
      })
      .from(tournamentNearbyPlaces)
      .innerJoin(nearbyPlaces, eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaces.id))
      .where(eq(tournamentNearbyPlaces.tournamentDetailId, tournamentDetailId));

    return NextResponse.json(placeLinks.map(p => ({ ...p.link, nearby_place: p.place })));
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    // Handle bulk insert
    if (Array.isArray(body)) {
      const newLinks = await db
        .insert(tournamentNearbyPlaces)
        .values(body)
        .returning();

      // Update updatedAt timestamp
      const detailId = body[0]?.tournamentDetailId;
      if (detailId) {
        await db
          .update(tournamentDetails)
          .set({ updatedAt: new Date() })
          .where(eq(tournamentDetails.id, detailId));
      }

      return NextResponse.json(newLinks, { status: 201 });
    }

    const { tournamentDetailId, nearbyPlaceId, ...linkInfo } = body;

    if (!tournamentDetailId || !nearbyPlaceId) {
      return NextResponse.json({ error: 'Tournament detail ID and nearby place ID required' }, { status: 400 });
    }

    const [newLink] = await db
      .insert(tournamentNearbyPlaces)
      .values({ tournamentDetailId, nearbyPlaceId, ...linkInfo })
      .returning();

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    const updates = await request.json();

    const [updated] = await db
      .update(tournamentNearbyPlaces)
      .set(updates)
      .where(eq(tournamentNearbyPlaces.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Tournament place link not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const tournamentDetailId = request.nextUrl.searchParams.get('tournamentDetailId');
    const nearbyPlaceId = request.nextUrl.searchParams.get('nearbyPlaceId');

    if (id) {
      await db.delete(tournamentNearbyPlaces).where(eq(tournamentNearbyPlaces.id, id));
    } else if (tournamentDetailId && nearbyPlaceId) {
      await db
        .delete(tournamentNearbyPlaces)
        .where(
          and(
            eq(tournamentNearbyPlaces.tournamentDetailId, tournamentDetailId),
            eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaceId)
          )
        );
    } else {
      return NextResponse.json({ error: 'Link ID or (tournamentDetailId and nearbyPlaceId) required' }, { status: 400 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

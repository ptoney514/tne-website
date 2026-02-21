import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nearbyPlaces } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const city = request.nextUrl.searchParams.get('city');
    const state = request.nextUrl.searchParams.get('state');
    const placeType = request.nextUrl.searchParams.get('placeType');
    const googlePlaceId = request.nextUrl.searchParams.get('googlePlaceId');

    if (id) {
      const place = await db
        .select()
        .from(nearbyPlaces)
        .where(eq(nearbyPlaces.id, id))
        .limit(1);

      if (place.length === 0) {
        return NextResponse.json({ error: 'Place not found' }, { status: 404 });
      }
      return NextResponse.json(place[0]);
    }

    // Find by Google Place ID (for deduplication)
    if (googlePlaceId) {
      // googlePlaceId not in schema - return null
      return NextResponse.json(null);
    }

    // Filter by location and/or type
    const conditions = [];
    if (city) conditions.push(eq(nearbyPlaces.city, city));
    if (state) conditions.push(eq(nearbyPlaces.state, state));
    if (placeType && placeType !== 'all') {
      conditions.push(eq(nearbyPlaces.placeType, placeType as 'restaurant' | 'attraction' | 'entertainment' | 'shopping' | 'other'));
    }

    let query = db.select().from(nearbyPlaces);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const allPlaces = await query.orderBy(nearbyPlaces.name);

    return NextResponse.json(allPlaces);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin nearby-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const placeData = await request.json();

    // Handle bulk insert
    if (Array.isArray(placeData)) {
      const newPlaces = await db
        .insert(nearbyPlaces)
        .values(placeData)
        .returning();

      return NextResponse.json(newPlaces, { status: 201 });
    }

    const [newPlace] = await db
      .insert(nearbyPlaces)
      .values(placeData)
      .returning();

    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin nearby-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Place ID required' }, { status: 400 });
    }

    const updates = await request.json();

    const [updated] = await db
      .update(nearbyPlaces)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nearbyPlaces.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin nearby-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Place ID required' }, { status: 400 });
    }

    await db.delete(nearbyPlaces).where(eq(nearbyPlaces.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin nearby-places error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

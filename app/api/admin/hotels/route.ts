import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hotels } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const city = request.nextUrl.searchParams.get('city');
    const state = request.nextUrl.searchParams.get('state');
    const googlePlaceId = request.nextUrl.searchParams.get('googlePlaceId');

    if (id) {
      const hotel = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, id))
        .limit(1);

      if (hotel.length === 0) {
        return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
      }
      return NextResponse.json(hotel[0]);
    }

    // Find by name (for deduplication)
    if (googlePlaceId) {
      // googlePlaceId not in schema - search by name instead
      return NextResponse.json(null);
    }

    // Filter by location
    if (city && state) {
      const locationHotels = await db
        .select()
        .from(hotels)
        .where(
          and(
            eq(hotels.city, city),
            eq(hotels.state, state)
          )
        )
        .orderBy(hotels.name);

      return NextResponse.json(locationHotels);
    }

    const allHotels = await db
      .select()
      .from(hotels)
      .orderBy(hotels.name);

    return NextResponse.json(allHotels);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const hotelData = await request.json();

    // Handle bulk insert
    if (Array.isArray(hotelData)) {
      const newHotels = await db
        .insert(hotels)
        .values(hotelData)
        .returning();

      return NextResponse.json(newHotels, { status: 201 });
    }

    const [newHotel] = await db
      .insert(hotels)
      .values(hotelData)
      .returning();

    return NextResponse.json(newHotel, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    const updates = await request.json();

    const [updated] = await db
      .update(hotels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    await db.delete(hotels).where(eq(hotels.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

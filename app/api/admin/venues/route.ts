import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { venues } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (id) {
      const venue = await db
        .select()
        .from(venues)
        .where(eq(venues.id, id))
        .limit(1);

      if (venue.length === 0) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }
      return NextResponse.json(venue[0]);
    }

    const allVenues = await db
      .select()
      .from(venues)
      .orderBy(venues.name);

    return NextResponse.json(allVenues);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin venues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const venueData = await request.json();

    const [newVenue] = await db
      .insert(venues)
      .values(venueData)
      .returning();

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin venues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Venue ID required' }, { status: 400 });
    }

    const updates = await request.json();

    const [updated] = await db
      .update(venues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin venues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Venue ID required' }, { status: 400 });
    }

    await db.delete(venues).where(eq(venues.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin venues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tournamentHotels, hotels } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const tournamentDetailId = request.nextUrl.searchParams.get('tournamentDetailId');

    if (!tournamentDetailId) {
      return NextResponse.json({ error: 'Tournament detail ID required' }, { status: 400 });
    }

    const hotelLinks = await db
      .select({
        link: tournamentHotels,
        hotel: hotels,
      })
      .from(tournamentHotels)
      .innerJoin(hotels, eq(tournamentHotels.hotelId, hotels.id))
      .where(eq(tournamentHotels.tournamentDetailId, tournamentDetailId));

    return NextResponse.json(hotelLinks.map(h => ({ ...h.link, hotel: h.hotel })));
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-hotels error:', error);
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
        .insert(tournamentHotels)
        .values(body)
        .returning();

      return NextResponse.json(newLinks, { status: 201 });
    }

    const { tournamentDetailId, hotelId, ...rateInfo } = body;

    if (!tournamentDetailId || !hotelId) {
      return NextResponse.json({ error: 'Tournament detail ID and hotel ID required' }, { status: 400 });
    }

    const [newLink] = await db
      .insert(tournamentHotels)
      .values({ tournamentDetailId, hotelId, ...rateInfo })
      .returning();

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-hotels error:', error);
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
      .update(tournamentHotels)
      .set(updates)
      .where(eq(tournamentHotels.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Tournament hotel link not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const tournamentDetailId = request.nextUrl.searchParams.get('tournamentDetailId');
    const hotelId = request.nextUrl.searchParams.get('hotelId');

    if (id) {
      await db.delete(tournamentHotels).where(eq(tournamentHotels.id, id));
    } else if (tournamentDetailId && hotelId) {
      await db
        .delete(tournamentHotels)
        .where(
          and(
            eq(tournamentHotels.tournamentDetailId, tournamentDetailId),
            eq(tournamentHotels.hotelId, hotelId)
          )
        );
    } else {
      return NextResponse.json({ error: 'Link ID or (tournamentDetailId and hotelId) required' }, { status: 400 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Admin tournament-hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

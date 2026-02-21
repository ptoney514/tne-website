import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasons } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const seasonsData = await db
      .select()
      .from(seasons)
      .orderBy(desc(seasons.startDate));

    const result = seasonsData.map((season) => ({
      id: season.id,
      name: season.name,
      start_date: season.startDate,
      end_date: season.endDate,
      is_active: season.isActive,
      tryouts_open: season.tryoutsOpen,
      registration_open: season.registrationOpen,
      created_at: season.createdAt,
      updated_at: season.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching seasons:', error);
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newSeason] = await db
      .insert(seasons)
      .values({
        name: body.name,
        startDate: body.start_date,
        endDate: body.end_date,
        isActive: body.is_active ?? true,
        tryoutsOpen: body.tryouts_open ?? false,
        registrationOpen: body.registration_open ?? false,
      })
      .returning();

    return NextResponse.json(newSeason, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating season:', error);
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing season ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.start_date !== undefined) updateData.startDate = body.start_date;
    if (body.end_date !== undefined) updateData.endDate = body.end_date;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;
    if (body.tryouts_open !== undefined)
      updateData.tryoutsOpen = body.tryouts_open;
    if (body.registration_open !== undefined)
      updateData.registrationOpen = body.registration_open;

    const [updated] = await db
      .update(seasons)
      .set(updateData)
      .where(eq(seasons.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating season:', error);
    return NextResponse.json({ error: 'Failed to update season' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing season ID' }, { status: 400 });
    }

    await db.delete(seasons).where(eq(seasons.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting season:', error);
    return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasons } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, desc } from 'drizzle-orm';

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined);
}

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
      tryouts_label: season.tryoutsLabel,
      registration_open: season.registrationOpen,
      registration_label: season.registrationLabel,
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
    const isActive = firstDefined(body.is_active, body.isActive);
    const tryoutsOpen = firstDefined(body.tryouts_open, body.tryoutsOpen);
    const tryoutsLabel = firstDefined(body.tryouts_label, body.tryoutsLabel);
    const registrationOpen = firstDefined(
      body.registration_open,
      body.registrationOpen
    );
    const registrationLabel = firstDefined(
      body.registration_label,
      body.registrationLabel
    );

    const [newSeason] = await db
      .insert(seasons)
      .values({
        name: body.name,
        startDate: body.start_date,
        endDate: body.end_date,
        isActive: isActive ?? true,
        tryoutsOpen: tryoutsOpen ?? false,
        tryoutsLabel: tryoutsLabel ?? null,
        registrationOpen: registrationOpen ?? false,
        registrationLabel: registrationLabel ?? null,
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

    const startDate = firstDefined(body.start_date, body.startDate);
    if (startDate !== undefined) updateData.startDate = startDate;

    const endDate = firstDefined(body.end_date, body.endDate);
    if (endDate !== undefined) updateData.endDate = endDate;

    const isActive = firstDefined(body.is_active, body.isActive);
    if (isActive !== undefined) updateData.isActive = isActive;

    const tryoutsOpen = firstDefined(body.tryouts_open, body.tryoutsOpen);
    if (tryoutsOpen !== undefined) updateData.tryoutsOpen = tryoutsOpen;

    const tryoutsLabel = firstDefined(body.tryouts_label, body.tryoutsLabel);
    if (tryoutsLabel !== undefined) updateData.tryoutsLabel = tryoutsLabel;

    const registrationOpen = firstDefined(
      body.registration_open,
      body.registrationOpen
    );
    if (registrationOpen !== undefined) {
      updateData.registrationOpen = registrationOpen;
    }

    const registrationLabel = firstDefined(
      body.registration_label,
      body.registrationLabel
    );
    if (registrationLabel !== undefined) {
      updateData.registrationLabel = registrationLabel;
    }

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

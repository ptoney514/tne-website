import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teamRoster } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing roster entry ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.jersey_number !== undefined) updateData.jerseyNumber = body.jersey_number;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.payment_status !== undefined) updateData.paymentStatus = body.payment_status;
    if (body.payment_amount !== undefined) updateData.paymentAmount = body.payment_amount;
    if (body.payment_date !== undefined) updateData.paymentDate = body.payment_date;
    if (body.payment_notes !== undefined) updateData.paymentNotes = body.payment_notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(teamRoster)
      .set(updateData)
      .where(eq(teamRoster.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Roster entry not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating roster entry:', error);
    return NextResponse.json({ error: 'Failed to update roster entry' }, { status: 500 });
  }
}

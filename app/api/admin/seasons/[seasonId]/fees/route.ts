import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasonFees } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, and, asc } from 'drizzle-orm';

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { seasonId } = await params;

    const fees = await db
      .select()
      .from(seasonFees)
      .where(eq(seasonFees.seasonId, seasonId))
      .orderBy(asc(seasonFees.displayOrder), asc(seasonFees.amount));

    const result = fees.map((fee) => ({
      id: fee.id,
      season_id: fee.seasonId,
      name: fee.name,
      description: fee.description,
      amount: fee.amount,
      currency: fee.currency,
      is_active: fee.isActive,
      is_public: fee.isPublic,
      display_order: fee.displayOrder,
      payment_enabled: fee.paymentEnabled,
      created_at: fee.createdAt,
      updated_at: fee.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching season fees:', error);
    return NextResponse.json({ error: 'Failed to fetch season fees' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { seasonId } = await params;
    const body = await request.json();

    const isActive = firstDefined(body.is_active, body.isActive);
    const isPublic = firstDefined(body.is_public, body.isPublic);
    const displayOrder = firstDefined(body.display_order, body.displayOrder);
    const paymentEnabled = firstDefined(body.payment_enabled, body.paymentEnabled);

    const [newFee] = await db
      .insert(seasonFees)
      .values({
        seasonId,
        name: body.name,
        description: body.description ?? null,
        amount: body.amount,
        currency: body.currency ?? 'USD',
        isActive: isActive ?? true,
        isPublic: isPublic ?? true,
        displayOrder: displayOrder ?? 0,
        paymentEnabled: paymentEnabled ?? false,
      })
      .returning();

    return NextResponse.json(newFee, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating season fee:', error);
    return NextResponse.json({ error: 'Failed to create season fee' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { seasonId } = await params;
    const feeId = request.nextUrl.searchParams.get('feeId');

    if (!feeId) {
      return NextResponse.json({ error: 'Missing feeId query parameter' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.currency !== undefined) updateData.currency = body.currency;

    const isActive = firstDefined(body.is_active, body.isActive);
    if (isActive !== undefined) updateData.isActive = isActive;

    const isPublic = firstDefined(body.is_public, body.isPublic);
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const displayOrder = firstDefined(body.display_order, body.displayOrder);
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const paymentEnabled = firstDefined(body.payment_enabled, body.paymentEnabled);
    if (paymentEnabled !== undefined) updateData.paymentEnabled = paymentEnabled;

    const [updated] = await db
      .update(seasonFees)
      .set(updateData)
      .where(and(eq(seasonFees.id, feeId), eq(seasonFees.seasonId, seasonId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating season fee:', error);
    return NextResponse.json({ error: 'Failed to update season fee' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    await requireAdmin(request);
    const { seasonId } = await params;
    const feeId = request.nextUrl.searchParams.get('feeId');

    if (!feeId) {
      return NextResponse.json({ error: 'Missing feeId query parameter' }, { status: 400 });
    }

    await db
      .delete(seasonFees)
      .where(and(eq(seasonFees.id, feeId), eq(seasonFees.seasonId, seasonId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting season fee:', error);
    return NextResponse.json({ error: 'Failed to delete season fee' }, { status: 500 });
  }
}

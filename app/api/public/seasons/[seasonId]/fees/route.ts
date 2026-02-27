import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasonFees } from '@/lib/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;

    const fees = await db
      .select()
      .from(seasonFees)
      .where(
        and(
          eq(seasonFees.seasonId, seasonId),
          eq(seasonFees.isActive, true),
          eq(seasonFees.isPublic, true)
        )
      )
      .orderBy(asc(seasonFees.displayOrder), asc(seasonFees.amount));

    const result = fees.map((fee) => ({
      id: fee.id,
      season_id: fee.seasonId,
      name: fee.name,
      description: fee.description,
      amount: fee.amount,
      currency: fee.currency,
      display_order: fee.displayOrder,
    }));

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching season fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch season fees' },
      { status: 500 }
    );
  }
}

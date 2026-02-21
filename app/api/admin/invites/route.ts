import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userInvites } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);

    const body = await request.json();
    const { email, role, display_name, personal_message } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const VALID_ROLES = ['admin', 'coach', 'parent'];
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 });
    }

    const inviteCode = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await db
      .insert(userInvites)
      .values({
        email: email.toLowerCase().trim(),
        role: role || 'parent',
        inviteCode,
        status: 'pending',
        invitedById: session.user.id,
        expiresAt,
      })
      .returning();

    return NextResponse.json(
      {
        ...invite,
        invite_url: `/invite/${inviteCode}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const status = request.nextUrl.searchParams.get('status');

    const invitesData = status
      ? await db
          .select()
          .from(userInvites)
          .where(eq(userInvites.status, status as 'pending' | 'accepted' | 'expired' | 'revoked'))
          .orderBy(desc(userInvites.createdAt))
      : await db.select().from(userInvites).orderBy(desc(userInvites.createdAt));

    return NextResponse.json(invitesData);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing invite ID' }, { status: 400 });
    }

    const body = await request.json();

    // Only allow revoking pending invites
    if (body.status === 'revoked') {
      const [existing] = await db
        .select()
        .from(userInvites)
        .where(eq(userInvites.id, id));

      if (!existing) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
      }

      if (existing.status !== 'pending') {
        return NextResponse.json(
          { error: 'Can only revoke pending invites' },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(userInvites)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(userInvites.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating invite:', error);
    return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 });
  }
}

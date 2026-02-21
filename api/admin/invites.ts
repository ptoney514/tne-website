import { db } from '../lib/db';
import { userInvites } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, desc } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
};

export async function POST(request: Request) {
  try {
    const session = await requireAdmin(request);

    const body = await request.json();
    const { email, role, display_name, personal_message } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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

    return new Response(
      JSON.stringify({
        ...invite,
        invite_url: `/invite/${inviteCode}`,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating invite:', error);
    return new Response(JSON.stringify({ error: 'Failed to create invite' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let query = db.select().from(userInvites).orderBy(desc(userInvites.createdAt));

    if (status) {
      query = db
        .select()
        .from(userInvites)
        .where(eq(userInvites.status, status as 'pending' | 'accepted' | 'expired' | 'revoked'))
        .orderBy(desc(userInvites.createdAt));
    }

    const invitesData = await query;

    return new Response(JSON.stringify(invitesData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching invites:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invites' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing invite ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Only allow revoking pending invites
    if (body.status === 'revoked') {
      const [existing] = await db
        .select()
        .from(userInvites)
        .where(eq(userInvites.id, id));

      if (!existing) {
        return new Response(JSON.stringify({ error: 'Invite not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (existing.status !== 'pending') {
        return new Response(
          JSON.stringify({ error: 'Can only revoke pending invites' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const [updated] = await db
      .update(userInvites)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(userInvites.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Invite not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating invite:', error);
    return new Response(JSON.stringify({ error: 'Failed to update invite' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

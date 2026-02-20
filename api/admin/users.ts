import { db } from '../lib/db';
import { user } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const role = url.searchParams.get('role');

    let whereClause = sql`true`;
    if (role) {
      whereClause = sql`${user.role} = ${role}`;
    }

    const usersData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt));

    const result = usersData.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      email_verified: u.emailVerified,
      first_name: u.firstName,
      last_name: u.lastName,
      phone: u.phone,
      role: u.role,
      image: u.image,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
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
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;

    const [updated] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
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
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(user).where(eq(user.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

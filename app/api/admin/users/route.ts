import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles, neonAuthUsers } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';
import { authServer } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const role = request.nextUrl.searchParams.get('role');

    // Join neon_auth.users_sync with user_profiles for full user listing
    let query = db
      .select({
        id: neonAuthUsers.id,
        name: neonAuthUsers.name,
        email: neonAuthUsers.email,
        emailVerified: neonAuthUsers.emailVerified,
        image: neonAuthUsers.image,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        phone: userProfiles.phone,
        role: userProfiles.role,
        createdAt: neonAuthUsers.createdAt,
        updatedAt: userProfiles.updatedAt,
      })
      .from(neonAuthUsers)
      .leftJoin(userProfiles, eq(neonAuthUsers.id, userProfiles.id))
      .$dynamic();

    if (role) {
      query = query.where(sql`${userProfiles.role} = ${role}`);
    }

    const usersData = await query.orderBy(desc(neonAuthUsers.createdAt));

    const result = usersData.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      email_verified: u.emailVerified,
      first_name: u.firstName,
      last_name: u.lastName,
      phone: u.phone,
      role: u.role ?? 'parent',
      image: u.image,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;

    // Upsert into user_profiles (user may not have a profile row yet)
    const [updated] = await db
      .insert(userProfiles)
      .values({ id, ...updateData })
      .onConflictDoUpdate({
        target: userProfiles.id,
        set: updateData,
      })
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Delete from user_profiles
    await db.delete(userProfiles).where(eq(userProfiles.id, id));

    // Delete from Neon Auth via server API
    try {
      await authServer.admin.removeUser({ userId: id });
    } catch (e) {
      console.warn('Failed to delete user from Neon Auth:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

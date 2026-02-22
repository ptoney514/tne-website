import { NextResponse } from 'next/server';
import { neonAuth } from '@neondatabase/auth/next/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/schema/userProfiles';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/profile — fetch current user's profile from user_profiles.
 */
export async function GET() {
  try {
    const { user } = await neonAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, user.id));

    if (!profile) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: null,
        lastName: null,
        phone: null,
        role: 'parent',
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * POST /api/auth/profile — create or upsert user profile.
 * Used after signup and invite acceptance.
 */
export async function POST() {
  try {
    const { user } = await neonAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile exists
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, user.id));

    if (existing) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: existing.firstName,
        lastName: existing.lastName,
        phone: existing.phone,
        role: existing.role,
      });
    }

    // Parse name into first/last
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    // Create profile with default role
    const [profile] = await db
      .insert(userProfiles)
      .values({
        id: user.id,
        firstName,
        lastName,
        role: 'parent',
      })
      .returning();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      role: profile.role,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

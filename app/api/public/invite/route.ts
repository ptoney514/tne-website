import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { userInvites, user, coaches, parents } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
    }

    const [invite] = await db
      .select()
      .from(userInvites)
      .where(eq(userInvites.inviteCode, code));

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if expired by time
    if (new Date() > invite.expiresAt) {
      // Update status if still pending
      if (invite.status === 'pending') {
        await db
          .update(userInvites)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(userInvites.id, invite.id));
      }
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    if (invite.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted', status: 'accepted' },
        { status: 410 }
      );
    }

    if (invite.status === 'revoked') {
      return NextResponse.json(
        { error: 'Invitation has been revoked' },
        { status: 410 }
      );
    }

    if (invite.status === 'expired') {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      status: invite.status,
    });
  } catch (error) {
    console.error('Error looking up invite:', error);
    return NextResponse.json({ error: 'Failed to look up invitation' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, password, firstName, lastName } = body;

    if (!code || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Look up invite
    const [invite] = await db
      .select()
      .from(userInvites)
      .where(eq(userInvites.inviteCode, code));

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 410 }
      );
    }

    if (new Date() > invite.expiresAt) {
      await db
        .update(userInvites)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(userInvites.id, invite.id));

      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Create user via Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: invite.email,
        password,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    const newUser = signUpResult.user;

    // Update role to the invited role (Better Auth defaults to 'parent' with input: false)
    await db
      .update(user)
      .set({ role: invite.role })
      .where(eq(user.id, newUser.id));

    // Update invite record
    await db
      .update(userInvites)
      .set({
        status: 'accepted',
        acceptedById: newUser.id,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userInvites.id, invite.id));

    // Link to role-specific profile table
    if (invite.role === 'coach') {
      // Check for existing coach record by email
      const [existingCoach] = await db
        .select()
        .from(coaches)
        .where(eq(coaches.email, invite.email));

      if (existingCoach) {
        await db
          .update(coaches)
          .set({ profileId: newUser.id, updatedAt: new Date() })
          .where(eq(coaches.id, existingCoach.id));
      } else {
        await db.insert(coaches).values({
          profileId: newUser.id,
          firstName,
          lastName,
          email: invite.email,
        });
      }
    } else if (invite.role === 'parent') {
      // Check for existing parent record by email
      const [existingParent] = await db
        .select()
        .from(parents)
        .where(eq(parents.email, invite.email));

      if (existingParent) {
        await db
          .update(parents)
          .set({ profileId: newUser.id, updatedAt: new Date() })
          .where(eq(parents.id, existingParent.id));
      } else {
        await db.insert(parents).values({
          profileId: newUser.id,
          firstName,
          lastName,
          email: invite.email,
          phone: '',
        });
      }
    }

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: invite.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

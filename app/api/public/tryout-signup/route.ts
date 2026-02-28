import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tryoutSignups, tryoutSessions } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { sendTryoutConfirmation, sendAdminTryoutNotification } from '@/lib/email';

interface TryoutSignupPayload {
  tryout_session_id: string;
  player_first_name: string;
  player_last_name: string;
  player_date_of_birth: string;
  player_graduating_year: number;
  player_current_grade: string;
  player_gender: 'male' | 'female';
  parent_first_name?: string;
  parent_last_name?: string;
  parent_email: string;
  parent_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  years_experience?: number;
  prior_tne_player?: boolean;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TryoutSignupPayload;

    // Validate required fields
    const requiredFields = [
      'tryout_session_id',
      'player_first_name',
      'player_last_name',
      'player_date_of_birth',
      'player_current_grade',
      'player_gender',
      'parent_email',
      'parent_phone',
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof TryoutSignupPayload]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify tryout session exists and is active
    const [session] = await db
      .select()
      .from(tryoutSessions)
      .where(eq(tryoutSessions.id, body.tryout_session_id))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: 'Tryout session not found' },
        { status: 404 }
      );
    }

    if (!session.isActive) {
      return NextResponse.json(
        { error: 'Registration is closed for this session' },
        { status: 400 }
      );
    }

    // Check capacity
    if (session.maxCapacity) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tryoutSignups)
        .where(eq(tryoutSignups.sessionId, body.tryout_session_id));

      if (countResult.count >= session.maxCapacity) {
        return NextResponse.json(
          { error: 'This tryout session is full' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate signup (same player name + DOB + session)
    const [existing] = await db
      .select()
      .from(tryoutSignups)
      .where(
        sql`${tryoutSignups.sessionId} = ${body.tryout_session_id}
            AND ${tryoutSignups.playerFirstName} = ${body.player_first_name}
            AND ${tryoutSignups.playerLastName} = ${body.player_last_name}
            AND ${tryoutSignups.playerDateOfBirth} = ${body.player_date_of_birth}`
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          error: 'This player is already registered for this tryout session',
        },
        { status: 409 }
      );
    }

    // Insert signup
    const [newSignup] = await db
      .insert(tryoutSignups)
      .values({
        sessionId: body.tryout_session_id,
        playerFirstName: body.player_first_name,
        playerLastName: body.player_last_name,
        playerDateOfBirth: body.player_date_of_birth,
        playerGraduatingYear: body.player_graduating_year,
        playerCurrentGrade: body.player_current_grade,
        playerGender: body.player_gender,
        parentFirstName: body.parent_first_name ?? '',
        parentLastName: body.parent_last_name ?? '',
        parentEmail: body.parent_email ?? '',
        parentPhone: body.parent_phone ?? '',
        emergencyContactName: body.emergency_contact_name ?? '',
        emergencyContactPhone: body.emergency_contact_phone ?? '',
        emergencyContactRelationship: body.emergency_contact_relationship,
        yearsExperience: body.years_experience,
        priorTnePlayer: body.prior_tne_player,
        notes: body.notes,
        status: 'registered',
      })
      .returning();

    // Fire-and-forget confirmation email
    const sessionTime = `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}`;
    sendTryoutConfirmation({
      to: body.parent_email,
      playerName: `${body.player_first_name} ${body.player_last_name}`,
      sessionDate: session.date,
      sessionTime,
      location: session.location,
      grades: session.gradeLevels,
    }).catch((err) => console.error('Failed to send confirmation email:', err));

    // Fire-and-forget admin notification
    sendAdminTryoutNotification({
      playerFirstName: body.player_first_name,
      playerLastName: body.player_last_name,
      playerDob: body.player_date_of_birth,
      playerGrade: body.player_current_grade,
      playerGender: body.player_gender,
      playerSchool: '',
      parentFirstName: body.parent_first_name,
      parentLastName: body.parent_last_name,
      parentEmail: body.parent_email,
      parentPhone: body.parent_phone,
      relationship: body.emergency_contact_relationship,
      sessionDate: session.date,
      sessionTime,
      location: session.location,
      grades: session.gradeLevels,
    }).catch((err) => console.error('Failed to send admin tryout notification:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully registered for tryout',
        signup_id: newSignup.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tryout signup:', error);
    return NextResponse.json(
      { error: 'Failed to register for tryout' },
      { status: 500 }
    );
  }
}

import { db } from '../lib/db';
import { tryoutSignups, tryoutSessions } from '../lib/schema';
import { eq, sql } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

interface TryoutSignupPayload {
  tryout_session_id: string;
  player_first_name: string;
  player_last_name: string;
  player_date_of_birth: string;
  player_grade: string;
  player_gender: 'male' | 'female';
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  previous_experience?: string;
  how_heard_about_us?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TryoutSignupPayload;

    // Validate required fields
    const requiredFields = [
      'tryout_session_id',
      'player_first_name',
      'player_last_name',
      'player_date_of_birth',
      'player_grade',
      'player_gender',
      'parent_first_name',
      'parent_last_name',
      'parent_email',
      'parent_phone',
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof TryoutSignupPayload]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Verify tryout session exists and is open
    const [session] = await db
      .select()
      .from(tryoutSessions)
      .where(eq(tryoutSessions.id, body.tryout_session_id))
      .limit(1);

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Tryout session not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!session.registrationOpen) {
      return new Response(
        JSON.stringify({ error: 'Registration is closed for this session' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check capacity
    if (session.maxParticipants) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tryoutSignups)
        .where(eq(tryoutSignups.tryoutSessionId, body.tryout_session_id));

      if (countResult.count >= session.maxParticipants) {
        return new Response(
          JSON.stringify({ error: 'This tryout session is full' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Check for duplicate signup (same email + session)
    const [existing] = await db
      .select()
      .from(tryoutSignups)
      .where(
        sql`${tryoutSignups.tryoutSessionId} = ${body.tryout_session_id}
            AND ${tryoutSignups.parentEmail} = ${body.parent_email}
            AND ${tryoutSignups.playerFirstName} = ${body.player_first_name}
            AND ${tryoutSignups.playerLastName} = ${body.player_last_name}`
      )
      .limit(1);

    if (existing) {
      return new Response(
        JSON.stringify({
          error: 'This player is already registered for this tryout session',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert signup
    const [newSignup] = await db
      .insert(tryoutSignups)
      .values({
        tryoutSessionId: body.tryout_session_id,
        playerFirstName: body.player_first_name,
        playerLastName: body.player_last_name,
        playerDateOfBirth: body.player_date_of_birth,
        playerGrade: body.player_grade,
        playerGender: body.player_gender,
        parentFirstName: body.parent_first_name,
        parentLastName: body.parent_last_name,
        parentEmail: body.parent_email,
        parentPhone: body.parent_phone,
        emergencyContactName: body.emergency_contact_name,
        emergencyContactPhone: body.emergency_contact_phone,
        medicalNotes: body.medical_notes,
        previousExperience: body.previous_experience,
        howHeardAboutUs: body.how_heard_about_us,
        notes: body.notes,
        status: 'registered',
      })
      .returning();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully registered for tryout',
        signup_id: newSignup.id,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating tryout signup:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to register for tryout' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

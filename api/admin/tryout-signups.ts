import { db } from '../lib/db';
import { tryoutSignups, tryoutSessions } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const status = url.searchParams.get('status');

    let whereClause = sql`true`;
    if (sessionId) {
      whereClause = sql`${tryoutSignups.tryoutSessionId} = ${sessionId}`;
    }
    if (status) {
      whereClause = sql`${whereClause} AND ${tryoutSignups.status} = ${status}`;
    }

    const signupsData = await db
      .select({
        id: tryoutSignups.id,
        tryoutSessionId: tryoutSignups.tryoutSessionId,
        sessionDate: tryoutSessions.date,
        sessionLocation: tryoutSessions.location,
        playerFirstName: tryoutSignups.playerFirstName,
        playerLastName: tryoutSignups.playerLastName,
        playerDateOfBirth: tryoutSignups.playerDateOfBirth,
        playerGrade: tryoutSignups.playerGrade,
        playerGender: tryoutSignups.playerGender,
        parentFirstName: tryoutSignups.parentFirstName,
        parentLastName: tryoutSignups.parentLastName,
        parentEmail: tryoutSignups.parentEmail,
        parentPhone: tryoutSignups.parentPhone,
        emergencyContactName: tryoutSignups.emergencyContactName,
        emergencyContactPhone: tryoutSignups.emergencyContactPhone,
        medicalNotes: tryoutSignups.medicalNotes,
        previousExperience: tryoutSignups.previousExperience,
        howHeardAboutUs: tryoutSignups.howHeardAboutUs,
        status: tryoutSignups.status,
        teamOfferedId: tryoutSignups.teamOfferedId,
        notes: tryoutSignups.notes,
        createdAt: tryoutSignups.createdAt,
        updatedAt: tryoutSignups.updatedAt,
      })
      .from(tryoutSignups)
      .leftJoin(
        tryoutSessions,
        eq(tryoutSignups.tryoutSessionId, tryoutSessions.id)
      )
      .where(whereClause)
      .orderBy(desc(tryoutSignups.createdAt));

    const result = signupsData.map((signup) => ({
      id: signup.id,
      tryout_session_id: signup.tryoutSessionId,
      session_date: signup.sessionDate,
      session_location: signup.sessionLocation,
      player_first_name: signup.playerFirstName,
      player_last_name: signup.playerLastName,
      player_date_of_birth: signup.playerDateOfBirth,
      player_grade: signup.playerGrade,
      player_gender: signup.playerGender,
      parent_first_name: signup.parentFirstName,
      parent_last_name: signup.parentLastName,
      parent_email: signup.parentEmail,
      parent_phone: signup.parentPhone,
      emergency_contact_name: signup.emergencyContactName,
      emergency_contact_phone: signup.emergencyContactPhone,
      medical_notes: signup.medicalNotes,
      previous_experience: signup.previousExperience,
      how_heard_about_us: signup.howHeardAboutUs,
      status: signup.status,
      team_offered_id: signup.teamOfferedId,
      notes: signup.notes,
      created_at: signup.createdAt,
      updated_at: signup.updatedAt,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching tryout signups:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tryout signups' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing signup ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.team_offered_id !== undefined)
      updateData.teamOfferedId = body.team_offered_id;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(tryoutSignups)
      .set(updateData)
      .where(eq(tryoutSignups.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Signup not found' }), {
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
    console.error('Error updating tryout signup:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update tryout signup' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing signup ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(tryoutSignups).where(eq(tryoutSignups.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting tryout signup:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete tryout signup' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

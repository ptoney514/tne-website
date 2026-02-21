import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tryoutSignups, tryoutSessions } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const status = request.nextUrl.searchParams.get('status');

    let whereClause = sql`true`;
    if (sessionId) {
      whereClause = sql`${tryoutSignups.sessionId} = ${sessionId}`;
    }
    if (status) {
      whereClause = sql`${whereClause} AND ${tryoutSignups.status} = ${status}`;
    }

    const signupsData = await db
      .select({
        id: tryoutSignups.id,
        sessionId: tryoutSignups.sessionId,
        sessionDate: tryoutSessions.date,
        sessionLocation: tryoutSessions.location,
        playerFirstName: tryoutSignups.playerFirstName,
        playerLastName: tryoutSignups.playerLastName,
        playerDateOfBirth: tryoutSignups.playerDateOfBirth,
        playerCurrentGrade: tryoutSignups.playerCurrentGrade,
        playerGender: tryoutSignups.playerGender,
        parentFirstName: tryoutSignups.parentFirstName,
        parentLastName: tryoutSignups.parentLastName,
        parentEmail: tryoutSignups.parentEmail,
        parentPhone: tryoutSignups.parentPhone,
        emergencyContactName: tryoutSignups.emergencyContactName,
        emergencyContactPhone: tryoutSignups.emergencyContactPhone,
        emergencyContactRelationship: tryoutSignups.emergencyContactRelationship,
        yearsExperience: tryoutSignups.yearsExperience,
        priorTnePlayer: tryoutSignups.priorTnePlayer,
        status: tryoutSignups.status,
        offeredTeamId: tryoutSignups.offeredTeamId,
        notes: tryoutSignups.notes,
        createdAt: tryoutSignups.createdAt,
        updatedAt: tryoutSignups.updatedAt,
      })
      .from(tryoutSignups)
      .leftJoin(
        tryoutSessions,
        eq(tryoutSignups.sessionId, tryoutSessions.id)
      )
      .where(whereClause)
      .orderBy(desc(tryoutSignups.createdAt));

    const result = signupsData.map((signup) => ({
      id: signup.id,
      tryout_session_id: signup.sessionId,
      session_date: signup.sessionDate,
      session_location: signup.sessionLocation,
      player_first_name: signup.playerFirstName,
      player_last_name: signup.playerLastName,
      player_date_of_birth: signup.playerDateOfBirth,
      player_grade: signup.playerCurrentGrade,
      player_gender: signup.playerGender,
      parent_first_name: signup.parentFirstName,
      parent_last_name: signup.parentLastName,
      parent_email: signup.parentEmail,
      parent_phone: signup.parentPhone,
      emergency_contact_name: signup.emergencyContactName,
      emergency_contact_phone: signup.emergencyContactPhone,
      emergency_contact_relationship: signup.emergencyContactRelationship,
      years_experience: signup.yearsExperience,
      prior_tne_player: signup.priorTnePlayer,
      status: signup.status,
      offered_team_id: signup.offeredTeamId,
      notes: signup.notes,
      created_at: signup.createdAt,
      updated_at: signup.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching tryout signups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tryout signups' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing signup ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.team_offered_id !== undefined)
      updateData.offeredTeamId = body.team_offered_id;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(tryoutSignups)
      .set(updateData)
      .where(eq(tryoutSignups.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Signup not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating tryout signup:', error);
    return NextResponse.json(
      { error: 'Failed to update tryout signup' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing signup ID' }, { status: 400 });
    }

    await db.delete(tryoutSignups).where(eq(tryoutSignups.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting tryout signup:', error);
    return NextResponse.json(
      { error: 'Failed to delete tryout signup' },
      { status: 500 }
    );
  }
}

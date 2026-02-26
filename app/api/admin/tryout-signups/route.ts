import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  tryoutSignups,
  tryoutSessions,
  registrations,
  players,
  teamRoster,
} from '@/lib/schema';
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
        registrationId: registrations.id,
        createdPlayerId: registrations.createdPlayerId,
        registrationStatus: registrations.status,
        createdAt: tryoutSignups.createdAt,
        updatedAt: tryoutSignups.updatedAt,
      })
      .from(tryoutSignups)
      .leftJoin(
        tryoutSessions,
        eq(tryoutSignups.sessionId, tryoutSessions.id)
      )
      .leftJoin(
        registrations,
        eq(registrations.tryoutSignupId, tryoutSignups.id)
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
      registration_id: signup.registrationId,
      registration_status: signup.registrationStatus,
      player_id: signup.createdPlayerId,
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
    const action = request.nextUrl.searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'Missing signup ID' }, { status: 400 });
    }

    if (action === 'convert') {
      const [signup] = await db
        .select()
        .from(tryoutSignups)
        .where(eq(tryoutSignups.id, id))
        .limit(1);

      if (!signup) {
        return NextResponse.json({ error: 'Signup not found' }, { status: 404 });
      }

      const [existingRegistration] = await db
        .select({
          id: registrations.id,
          teamId: registrations.teamId,
          createdPlayerId: registrations.createdPlayerId,
          paymentStatus: registrations.paymentStatus,
          paymentAmount: registrations.paymentAmount,
        })
        .from(registrations)
        .where(eq(registrations.tryoutSignupId, id))
        .orderBy(desc(registrations.createdAt))
        .limit(1);

      let playerId = existingRegistration?.createdPlayerId ?? null;
      const teamId = existingRegistration?.teamId ?? signup.offeredTeamId ?? null;

      if (!playerId) {
        const [newPlayer] = await db
          .insert(players)
          .values({
            firstName: signup.playerFirstName,
            lastName: signup.playerLastName,
            dateOfBirth: signup.playerDateOfBirth,
            graduatingYear: signup.playerGraduatingYear,
            currentGrade: signup.playerCurrentGrade,
            gender: signup.playerGender,
            emergencyContactName: signup.emergencyContactName,
            emergencyContactPhone: signup.emergencyContactPhone,
            emergencyContactRelationship: signup.emergencyContactRelationship,
            medicalNotes: signup.notes,
          })
          .returning({ id: players.id });

        playerId = newPlayer.id;
      }

      if (teamId && playerId) {
        await db
          .insert(teamRoster)
          .values({
            teamId,
            playerId,
            paymentStatus: existingRegistration?.paymentStatus || 'pending',
            paymentAmount: existingRegistration?.paymentAmount ?? null,
            isActive: true,
          })
          .onConflictDoNothing();
      }

      let registrationId = existingRegistration?.id ?? null;

      if (registrationId) {
        await db
          .update(registrations)
          .set({
            source: 'tryout_offer',
            teamId,
            status: 'approved',
            createdPlayerId: playerId,
            updatedAt: new Date(),
          })
          .where(eq(registrations.id, registrationId));
      } else {
        const [newRegistration] = await db
          .insert(registrations)
          .values({
            source: 'tryout_offer',
            tryoutSignupId: signup.id,
            teamId,
            status: 'approved',
            playerFirstName: signup.playerFirstName,
            playerLastName: signup.playerLastName,
            playerDateOfBirth: signup.playerDateOfBirth,
            playerGraduatingYear: signup.playerGraduatingYear,
            playerCurrentGrade: signup.playerCurrentGrade,
            playerGender: signup.playerGender,
            parentFirstName: signup.parentFirstName,
            parentLastName: signup.parentLastName,
            parentEmail: signup.parentEmail,
            parentPhone: signup.parentPhone,
            emergencyContactName: signup.emergencyContactName,
            emergencyContactPhone: signup.emergencyContactPhone,
            emergencyContactRelationship: signup.emergencyContactRelationship,
            paymentStatus: 'pending',
            createdPlayerId: playerId,
          })
          .returning({ id: registrations.id });

        registrationId = newRegistration.id;
      }

      await db
        .update(tryoutSignups)
        .set({
          status: 'offered',
          updatedAt: new Date(),
        })
        .where(eq(tryoutSignups.id, id));

      return NextResponse.json({
        success: true,
        signup_id: id,
        registration_id: registrationId,
        player_id: playerId,
      });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.tryout_session_id !== undefined) updateData.sessionId = body.tryout_session_id;
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

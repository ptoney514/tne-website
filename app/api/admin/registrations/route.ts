import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { requireAdmin, requireRole, getCoachTeamIds } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { players, registrations, seasons, teamRoster, teams } from '@/lib/schema';

function calculateGraduatingYear(gradeValue: unknown): number {
  const grade = Number.parseInt(String(gradeValue ?? ''), 10);
  if (Number.isNaN(grade)) return new Date().getFullYear() + 6;

  const today = new Date();
  const schoolYear = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  return schoolYear + (12 - grade);
}

function normalizeStatus(status: unknown): 'pending' | 'approved' | 'rejected' {
  if (status === 'approved' || status === 'rejected') return status;
  return 'pending';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['admin', 'coach']);
    const isCoach = session.user.role === 'coach';

    let coachTeamIds: string[] = [];
    if (isCoach) {
      coachTeamIds = await getCoachTeamIds(session.user.id);
      if (coachTeamIds.length === 0) return NextResponse.json([]);
    }

    const seasonId = request.nextUrl.searchParams.get('seasonId');
    const teamId = request.nextUrl.searchParams.get('teamId');
    const status = request.nextUrl.searchParams.get('status');

    const conditions = [];
    if (seasonId) conditions.push(eq(teams.seasonId, seasonId));
    if (teamId) conditions.push(eq(registrations.teamId, teamId));
    if (status) conditions.push(eq(registrations.status, normalizeStatus(status)));
    if (isCoach) conditions.push(inArray(registrations.teamId, coachTeamIds));

    const baseQuery = db
      .select({
        id: registrations.id,
        source: registrations.source,
        status: registrations.status,
        teamId: registrations.teamId,
        seasonId: teams.seasonId,
        seasonName: seasons.name,
        teamName: teams.name,
        teamGradeLevel: teams.gradeLevel,
        playerFirstName: registrations.playerFirstName,
        playerLastName: registrations.playerLastName,
        playerDateOfBirth: registrations.playerDateOfBirth,
        playerCurrentGrade: registrations.playerCurrentGrade,
        playerGender: registrations.playerGender,
        jerseySize: registrations.jerseySize,
        position: registrations.position,
        medicalNotes: registrations.medicalNotes,
        desiredJerseyNumber: registrations.desiredJerseyNumber,
        lastTeamPlayedFor: registrations.lastTeamPlayedFor,
        parentFirstName: registrations.parentFirstName,
        parentLastName: registrations.parentLastName,
        parentEmail: registrations.parentEmail,
        parentPhone: registrations.parentPhone,
        parentRelationship: registrations.parentRelationship,
        parentHomePhone: registrations.parentHomePhone,
        parent2Name: registrations.parent2Name,
        parent2Phone: registrations.parent2Phone,
        parent2Email: registrations.parent2Email,
        parentAddressStreet: registrations.parentAddressStreet,
        parentAddressCity: registrations.parentAddressCity,
        parentAddressState: registrations.parentAddressState,
        parentAddressZip: registrations.parentAddressZip,
        emergencyContactName: registrations.emergencyContactName,
        emergencyContactPhone: registrations.emergencyContactPhone,
        emergencyContactRelationship: registrations.emergencyContactRelationship,
        paymentStatus: registrations.paymentStatus,
        paymentAmount: registrations.paymentAmount,
        paymentDate: registrations.paymentDate,
        paymentTransactionId: registrations.paymentTransactionId,
        paymentPlanType: registrations.paymentPlanType,
        waiverLiabilityAccepted: registrations.waiverLiabilityAccepted,
        waiverLiabilityAcceptedAt: registrations.waiverLiabilityAcceptedAt,
        waiverMedicalAccepted: registrations.waiverMedicalAccepted,
        waiverMedicalAcceptedAt: registrations.waiverMedicalAcceptedAt,
        waiverMediaAccepted: registrations.waiverMediaAccepted,
        waiverMediaAcceptedAt: registrations.waiverMediaAcceptedAt,
        rejectionReason: registrations.rejectionReason,
        playerId: registrations.createdPlayerId,
        createdAt: registrations.createdAt,
        updatedAt: registrations.updatedAt,
      })
      .from(registrations)
      .leftJoin(teams, eq(registrations.teamId, teams.id))
      .leftJoin(seasons, eq(teams.seasonId, seasons.id))
      .orderBy(desc(registrations.createdAt));

    const rows =
      conditions.length > 0
        ? await baseQuery.where(and(...conditions))
        : await baseQuery;

    const result = rows.map((reg) => {
      const waiverAccepted =
        !!reg.waiverLiabilityAccepted &&
        !!reg.waiverMedicalAccepted &&
        !!reg.waiverMediaAccepted;
      const waiverAcceptedAt =
        reg.waiverLiabilityAcceptedAt ||
        reg.waiverMedicalAcceptedAt ||
        reg.waiverMediaAcceptedAt;

      return {
        id: reg.id,
        season_id: reg.seasonId,
        team_id: reg.teamId,
        source: reg.source,
        status: reg.status,
        player_first_name: reg.playerFirstName,
        player_last_name: reg.playerLastName,
        player_date_of_birth: reg.playerDateOfBirth,
        player_current_grade: reg.playerCurrentGrade,
        player_grade: reg.playerCurrentGrade,
        player_gender: reg.playerGender,
        jersey_size: reg.jerseySize,
        position: reg.position,
        medical_notes: reg.medicalNotes,
        desired_jersey_number: reg.desiredJerseyNumber,
        last_team_played_for: reg.lastTeamPlayedFor,
        parent_first_name: reg.parentFirstName,
        parent_last_name: reg.parentLastName,
        parent_email: reg.parentEmail,
        parent_phone: reg.parentPhone,
        parent_relationship: reg.parentRelationship,
        parent_home_phone: reg.parentHomePhone,
        parent2_name: reg.parent2Name,
        parent2_phone: reg.parent2Phone,
        parent2_email: reg.parent2Email,
        parent_address_street: reg.parentAddressStreet,
        parent_address_city: reg.parentAddressCity,
        parent_address_state: reg.parentAddressState,
        parent_address_zip: reg.parentAddressZip,
        emergency_contact_name: reg.emergencyContactName,
        emergency_contact_phone: reg.emergencyContactPhone,
        emergency_contact_relationship: reg.emergencyContactRelationship,
        payment_status: reg.paymentStatus,
        amount_paid: reg.paymentAmount,
        payment_date: reg.paymentDate,
        payment_transaction_id: reg.paymentTransactionId,
        payment_plan_type: reg.paymentPlanType,
        waiver_accepted: waiverAccepted,
        waiver_accepted_at: waiverAcceptedAt,
        waiver_liability: !!reg.waiverLiabilityAccepted,
        waiver_medical: !!reg.waiverMedicalAccepted,
        waiver_media: !!reg.waiverMediaAccepted,
        notes: reg.rejectionReason,
        player_id: reg.playerId,
        created_at: reg.createdAt,
        updated_at: reg.updatedAt,
        season: reg.seasonId
          ? { id: reg.seasonId, name: reg.seasonName }
          : null,
        team: reg.teamId
          ? {
              id: reg.teamId,
              name: reg.teamName,
              grade_level: reg.teamGradeLevel,
            }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const playerGrade = body.player_current_grade ?? body.player_grade;

    if (
      !body.player_first_name ||
      !body.player_last_name ||
      !body.player_date_of_birth ||
      !playerGrade ||
      !body.player_gender ||
      !body.parent_first_name ||
      !body.parent_last_name ||
      !body.parent_email ||
      !body.parent_phone ||
      !body.emergency_contact_name ||
      !body.emergency_contact_phone
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newReg] = await db
      .insert(registrations)
      .values({
        teamId: body.team_id ?? null,
        source: body.source || 'direct',
        status: normalizeStatus(body.status),
        playerFirstName: body.player_first_name,
        playerLastName: body.player_last_name,
        playerDateOfBirth: body.player_date_of_birth,
        playerGraduatingYear:
          body.player_graduating_year ?? calculateGraduatingYear(playerGrade),
        playerCurrentGrade: String(playerGrade),
        playerGender: body.player_gender,
        jerseySize: body.jersey_size ?? null,
        position: body.position ?? null,
        medicalNotes: body.medical_notes ?? null,
        desiredJerseyNumber: body.desired_jersey_number ?? null,
        lastTeamPlayedFor: body.last_team_played_for ?? null,
        parentFirstName: body.parent_first_name,
        parentLastName: body.parent_last_name,
        parentEmail: body.parent_email,
        parentPhone: body.parent_phone,
        parentAddressStreet: body.parent_address_street ?? null,
        parentAddressCity: body.parent_address_city ?? null,
        parentAddressState: body.parent_address_state ?? null,
        parentAddressZip: body.parent_address_zip ?? null,
        parentRelationship: body.parent_relationship ?? null,
        parentHomePhone: body.parent_home_phone ?? null,
        parent2Name: body.parent2_name ?? null,
        parent2Phone: body.parent2_phone ?? null,
        parent2Email: body.parent2_email ?? null,
        emergencyContactName: body.emergency_contact_name,
        emergencyContactPhone: body.emergency_contact_phone,
        emergencyContactRelationship: body.emergency_contact_relationship ?? null,
        waiverLiabilityAccepted: !!body.waiver_liability,
        waiverLiabilityAcceptedAt: body.waiver_liability ? new Date() : null,
        waiverMedicalAccepted: !!body.waiver_medical,
        waiverMedicalAcceptedAt: body.waiver_medical ? new Date() : null,
        waiverMediaAccepted: !!body.waiver_media,
        waiverMediaAcceptedAt: body.waiver_media ? new Date() : null,
        paymentStatus: body.payment_status || 'pending',
        paymentAmount: body.amount_paid ?? body.payment_amount ?? null,
        paymentDate: body.payment_date ?? null,
        paymentTransactionId: body.payment_transaction_id ?? null,
        paymentPlanType: body.payment_plan_type ?? null,
        rejectionReason: body.notes ?? null,
        createdPlayerId: body.player_id ?? null,
      })
      .returning();

    return NextResponse.json(newReg, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    const action = request.nextUrl.searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'Missing registration ID' }, { status: 400 });
    }

    if (action === 'approve') {
      const [reg] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, id))
        .limit(1);

      if (!reg) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }

      let playerId = reg.createdPlayerId;

      if (!playerId) {
        const [newPlayer] = await db
          .insert(players)
          .values({
            firstName: reg.playerFirstName,
            lastName: reg.playerLastName,
            dateOfBirth: reg.playerDateOfBirth,
            graduatingYear: reg.playerGraduatingYear,
            currentGrade: reg.playerCurrentGrade,
            gender: reg.playerGender,
            emergencyContactName: reg.emergencyContactName,
            emergencyContactPhone: reg.emergencyContactPhone,
            emergencyContactRelationship: reg.emergencyContactRelationship,
            medicalNotes: reg.medicalNotes,
            jerseySize: reg.jerseySize,
            position: reg.position,
          })
          .returning({ id: players.id });

        playerId = newPlayer.id;
      }

      if (reg.teamId && playerId) {
        await db
          .insert(teamRoster)
          .values({
            teamId: reg.teamId,
            playerId,
            paymentStatus: reg.paymentStatus,
            paymentAmount: reg.paymentAmount,
            isActive: true,
          })
          .onConflictDoNothing();
      }

      const [updated] = await db
        .update(registrations)
        .set({
          status: 'approved',
          createdPlayerId: playerId,
          updatedAt: new Date(),
        })
        .where(eq(registrations.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    if (action === 'reject') {
      const [updated] = await db
        .update(registrations)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(registrations.id, id))
        .returning();

      return NextResponse.json(updated);
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.team_id !== undefined) updateData.teamId = body.team_id;
    if (body.status !== undefined) updateData.status = normalizeStatus(body.status);
    if (body.payment_status !== undefined) updateData.paymentStatus = body.payment_status;
    if (body.amount_paid !== undefined) updateData.paymentAmount = body.amount_paid;
    if (body.payment_amount !== undefined) updateData.paymentAmount = body.payment_amount;
    if (body.payment_date !== undefined) updateData.paymentDate = body.payment_date;
    if (body.payment_transaction_id !== undefined)
      updateData.paymentTransactionId = body.payment_transaction_id;
    if (body.payment_plan_type !== undefined) updateData.paymentPlanType = body.payment_plan_type;
    if (body.player_id !== undefined) updateData.createdPlayerId = body.player_id;
    if (body.notes !== undefined) updateData.rejectionReason = body.notes;

    if (body.waiver_signed !== undefined) {
      const accepted = !!body.waiver_signed;
      updateData.waiverLiabilityAccepted = accepted;
      updateData.waiverMedicalAccepted = accepted;
      updateData.waiverMediaAccepted = accepted;
      updateData.waiverLiabilityAcceptedAt = accepted ? new Date() : null;
      updateData.waiverMedicalAcceptedAt = accepted ? new Date() : null;
      updateData.waiverMediaAcceptedAt = accepted ? new Date() : null;
    }

    const [updated] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing registration ID' }, { status: 400 });
    }

    await db.delete(registrations).where(eq(registrations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting registration:', error);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}

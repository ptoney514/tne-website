import { db } from '../lib/db';
import { registrations, players, teamRoster, teams, seasons } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, desc, and } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const seasonId = url.searchParams.get('seasonId');
    const teamId = url.searchParams.get('teamId');
    const status = url.searchParams.get('status');

    let whereClause = sql`true`;
    if (seasonId) {
      whereClause = sql`${registrations.seasonId} = ${seasonId}`;
    }
    if (teamId) {
      whereClause = sql`${whereClause} AND ${registrations.teamId} = ${teamId}`;
    }
    if (status) {
      whereClause = sql`${whereClause} AND ${registrations.status} = ${status}`;
    }

    const regsData = await db
      .select({
        id: registrations.id,
        seasonId: registrations.seasonId,
        seasonName: seasons.name,
        teamId: registrations.teamId,
        teamName: teams.name,
        teamGradeLevel: teams.gradeLevel,
        source: registrations.source,
        status: registrations.status,
        playerFirstName: registrations.playerFirstName,
        playerLastName: registrations.playerLastName,
        playerDateOfBirth: registrations.playerDateOfBirth,
        playerGrade: registrations.playerGrade,
        playerGender: registrations.playerGender,
        parentFirstName: registrations.parentFirstName,
        parentLastName: registrations.parentLastName,
        parentEmail: registrations.parentEmail,
        parentPhone: registrations.parentPhone,
        emergencyContactName: registrations.emergencyContactName,
        emergencyContactPhone: registrations.emergencyContactPhone,
        medicalNotes: registrations.medicalNotes,
        paymentStatus: registrations.paymentStatus,
        amountPaid: registrations.amountPaid,
        waiverSigned: registrations.waiverSigned,
        waiverSignedAt: registrations.waiverSignedAt,
        notes: registrations.notes,
        playerId: registrations.playerId,
        createdAt: registrations.createdAt,
        updatedAt: registrations.updatedAt,
      })
      .from(registrations)
      .leftJoin(seasons, eq(registrations.seasonId, seasons.id))
      .leftJoin(teams, eq(registrations.teamId, teams.id))
      .where(whereClause)
      .orderBy(desc(registrations.createdAt));

    const result = regsData.map((reg) => ({
      id: reg.id,
      season_id: reg.seasonId,
      team_id: reg.teamId,
      source: reg.source,
      status: reg.status,
      player_first_name: reg.playerFirstName,
      player_last_name: reg.playerLastName,
      player_date_of_birth: reg.playerDateOfBirth,
      player_grade: reg.playerGrade,
      player_gender: reg.playerGender,
      parent_first_name: reg.parentFirstName,
      parent_last_name: reg.parentLastName,
      parent_email: reg.parentEmail,
      parent_phone: reg.parentPhone,
      emergency_contact_name: reg.emergencyContactName,
      emergency_contact_phone: reg.emergencyContactPhone,
      medical_notes: reg.medicalNotes,
      payment_status: reg.paymentStatus,
      amount_paid: reg.amountPaid,
      waiver_signed: reg.waiverSigned,
      waiver_signed_at: reg.waiverSignedAt,
      notes: reg.notes,
      player_id: reg.playerId,
      created_at: reg.createdAt,
      updated_at: reg.updatedAt,
      season: reg.seasonName
        ? { id: reg.seasonId, name: reg.seasonName }
        : null,
      team: reg.teamId
        ? {
            id: reg.teamId,
            name: reg.teamName,
            grade_level: reg.teamGradeLevel,
          }
        : null,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching registrations:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch registrations' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newReg] = await db
      .insert(registrations)
      .values({
        seasonId: body.season_id,
        teamId: body.team_id,
        source: body.source || 'direct',
        status: body.status || 'pending',
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
        paymentStatus: body.payment_status || 'pending',
        amountPaid: body.amount_paid,
        notes: body.notes,
      })
      .returning();

    return new Response(JSON.stringify(newReg), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating registration:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create registration' }),
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
    const action = url.searchParams.get('action');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing registration ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle special actions
    if (action === 'approve') {
      // Get registration
      const [reg] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, id))
        .limit(1);

      if (!reg) {
        return new Response(JSON.stringify({ error: 'Registration not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Create player if not exists
      let playerId = reg.playerId;
      if (!playerId) {
        const [newPlayer] = await db
          .insert(players)
          .values({
            firstName: reg.playerFirstName,
            lastName: reg.playerLastName,
            dateOfBirth: reg.playerDateOfBirth,
            grade: reg.playerGrade,
            gender: reg.playerGender,
            emergencyContactName: reg.emergencyContactName,
            emergencyContactPhone: reg.emergencyContactPhone,
            medicalNotes: reg.medicalNotes,
            isActive: true,
          })
          .returning();
        playerId = newPlayer.id;
      }

      // Add to team roster if team is assigned
      if (reg.teamId) {
        await db
          .insert(teamRoster)
          .values({
            teamId: reg.teamId,
            playerId: playerId,
            paymentStatus: reg.paymentStatus,
            amountPaid: reg.amountPaid,
            isActive: true,
          })
          .onConflictDoNothing();
      }

      // Update registration
      const [updated] = await db
        .update(registrations)
        .set({
          status: 'approved',
          playerId: playerId,
          updatedAt: new Date(),
        })
        .where(eq(registrations.id, id))
        .returning();

      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
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

      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Regular update
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.team_id !== undefined) updateData.teamId = body.team_id;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.payment_status !== undefined)
      updateData.paymentStatus = body.payment_status;
    if (body.amount_paid !== undefined) updateData.amountPaid = body.amount_paid;
    if (body.waiver_signed !== undefined)
      updateData.waiverSigned = body.waiver_signed;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), {
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
    console.error('Error updating registration:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update registration' }),
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
      return new Response(JSON.stringify({ error: 'Missing registration ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(registrations).where(eq(registrations.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting registration:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete registration' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

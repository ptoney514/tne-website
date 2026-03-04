import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, teamRoster, teams, seasons } from '@/lib/schema';
import { requireAdmin, requireRole, getCoachTeamIds } from '@/lib/auth-middleware';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['admin', 'coach']);
    const isCoach = session.user.role === 'coach';

    let coachTeamIds: string[] = [];
    if (isCoach) {
      coachTeamIds = await getCoachTeamIds(session.user.id);
      if (coachTeamIds.length === 0) return NextResponse.json([]);
    }

    const teamId = request.nextUrl.searchParams.get('teamId');
    const seasonId = request.nextUrl.searchParams.get('seasonId');

    // Fetch all players with their team assignments
    const playersData = await db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        dateOfBirth: players.dateOfBirth,
        currentGrade: players.currentGrade,
        graduatingYear: players.graduatingYear,
        gender: players.gender,
        emergencyContactName: players.emergencyContactName,
        emergencyContactPhone: players.emergencyContactPhone,
        emergencyContactRelationship: players.emergencyContactRelationship,
        medicalNotes: players.medicalNotes,
        jerseyNumber: players.jerseyNumber,
        jerseySize: players.jerseySize,
        position: players.position,
        yearsExperience: players.yearsExperience,
        priorTnePlayer: players.priorTnePlayer,
        notes: players.notes,
        createdAt: players.createdAt,
        updatedAt: players.updatedAt,
      })
      .from(players)
      .orderBy(players.lastName, players.firstName);

    // Get team assignments for all players
    const playerIds = playersData.map((p) => p.id);
    let rosterData: Array<{
      rosterId: string;
      playerId: string;
      teamId: string;
      teamName: string;
      gradeLevel: string;
      gender: string;
      seasonId: string;
      seasonName: string;
      isActive: boolean;
      jerseyNumber: string | null;
      position: string | null;
      notes: string | null;
      paymentStatus: string | null;
      paymentAmount: string | null;
      paymentDate: string | null;
      paymentNotes: string | null;
    }> = [];

    if (playerIds.length > 0) {
      rosterData = await db
        .select({
          rosterId: teamRoster.id,
          playerId: teamRoster.playerId,
          teamId: teamRoster.teamId,
          teamName: teams.name,
          gradeLevel: teams.gradeLevel,
          gender: teams.gender,
          seasonId: teams.seasonId,
          seasonName: seasons.name,
          isActive: teamRoster.isActive,
          jerseyNumber: teamRoster.jerseyNumber,
          position: teamRoster.position,
          notes: teamRoster.notes,
          paymentStatus: teamRoster.paymentStatus,
          paymentAmount: teamRoster.paymentAmount,
          paymentDate: teamRoster.paymentDate,
          paymentNotes: teamRoster.paymentNotes,
        })
        .from(teamRoster)
        .innerJoin(teams, eq(teamRoster.teamId, teams.id))
        .innerJoin(seasons, eq(teams.seasonId, seasons.id))
        .where(sql`${teamRoster.playerId} IN ${playerIds}`);
    }

    // Group roster data by player
    const rosterByPlayer = rosterData.reduce(
      (acc, r) => {
        if (!acc[r.playerId]) acc[r.playerId] = [];
        acc[r.playerId].push({
          roster_id: r.rosterId,
          team_id: r.teamId,
          team_name: r.teamName,
          grade_level: r.gradeLevel,
          gender: r.gender,
          season_id: r.seasonId,
          season_name: r.seasonName,
          is_active: r.isActive,
          jersey_number: r.jerseyNumber,
          position: r.position,
          notes: r.notes,
          payment_status: r.paymentStatus,
          payment_amount: r.paymentAmount,
          payment_date: r.paymentDate,
          payment_notes: r.paymentNotes,
        });
        return acc;
      },
      {} as Record<string, Array<Record<string, unknown>>>
    );

    // Filter by team or season if specified
    let filteredPlayers = playersData;
    if (teamId) {
      const playerIdsOnTeam = rosterData
        .filter((r) => r.teamId === teamId && r.isActive)
        .map((r) => r.playerId);
      filteredPlayers = playersData.filter((p) =>
        playerIdsOnTeam.includes(p.id)
      );
    } else if (seasonId) {
      const playerIdsInSeason = rosterData
        .filter((r) => r.seasonId === seasonId && r.isActive)
        .map((r) => r.playerId);
      filteredPlayers = playersData.filter((p) =>
        playerIdsInSeason.includes(p.id)
      );
    }

    // Scope to coach's teams if coach role
    if (isCoach) {
      const playerIdsOnCoachTeams = rosterData
        .filter((r) => coachTeamIds.includes(r.teamId) && r.isActive)
        .map((r) => r.playerId);
      filteredPlayers = filteredPlayers.filter((p) =>
        playerIdsOnCoachTeams.includes(p.id)
      );
    }

    const result = filteredPlayers.map((player) => ({
      id: player.id,
      first_name: player.firstName,
      last_name: player.lastName,
      date_of_birth: player.dateOfBirth,
      current_grade: player.currentGrade,
      graduating_year: player.graduatingYear,
      gender: player.gender,
      emergency_contact_name: player.emergencyContactName,
      emergency_contact_phone: player.emergencyContactPhone,
      emergency_contact_relationship: player.emergencyContactRelationship,
      medical_notes: player.medicalNotes,
      jersey_number: player.jerseyNumber,
      jersey_size: player.jerseySize,
      position: player.position,
      years_experience: player.yearsExperience,
      prior_tne_player: player.priorTnePlayer,
      notes: player.notes,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
      team_assignments: rosterByPlayer[player.id] || [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newPlayer] = await db
      .insert(players)
      .values({
        firstName: body.first_name,
        lastName: body.last_name,
        dateOfBirth: body.date_of_birth,
        graduatingYear: body.graduating_year,
        currentGrade: body.current_grade ?? body.grade,
        gender: body.gender,
        emergencyContactName: body.emergency_contact_name,
        emergencyContactPhone: body.emergency_contact_phone,
        emergencyContactRelationship: body.emergency_contact_relationship,
        medicalNotes: body.medical_notes,
        jerseyNumber: body.jersey_number,
        jerseySize: body.jersey_size,
        position: body.position,
        yearsExperience: body.years_experience,
        priorTnePlayer: body.prior_tne_player,
        notes: body.notes,
      })
      .returning();

    // If team_id is provided, assign to team
    if (body.team_id) {
      await db.insert(teamRoster).values({
        teamId: body.team_id,
        playerId: newPlayer.id,
        jerseyNumber: body.jersey_number,
        isActive: true,
      });
    }

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing player ID' }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.date_of_birth !== undefined)
      updateData.dateOfBirth = body.date_of_birth;
    if (body.current_grade !== undefined) updateData.currentGrade = body.current_grade;
    if (body.grade !== undefined) updateData.currentGrade = body.grade;
    if (body.graduating_year !== undefined) updateData.graduatingYear = body.graduating_year;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.emergency_contact_name !== undefined)
      updateData.emergencyContactName = body.emergency_contact_name;
    if (body.emergency_contact_phone !== undefined)
      updateData.emergencyContactPhone = body.emergency_contact_phone;
    if (body.medical_notes !== undefined)
      updateData.medicalNotes = body.medical_notes;
    if (body.jersey_number !== undefined)
      updateData.jerseyNumber = body.jersey_number;
    if (body.jersey_size !== undefined)
      updateData.jerseySize = body.jersey_size;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.years_experience !== undefined) updateData.yearsExperience = body.years_experience;
    if (body.prior_tne_player !== undefined) updateData.priorTnePlayer = body.prior_tne_player;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing player ID' }, { status: 400 });
    }

    await db.delete(players).where(eq(players.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}

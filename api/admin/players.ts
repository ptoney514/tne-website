import { db } from '../lib/db';
import { players, teamRoster, teams, seasons } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, and } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const teamId = url.searchParams.get('teamId');
    const seasonId = url.searchParams.get('seasonId');
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    // Fetch all players with their team assignments
    const playersData = await db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        dateOfBirth: players.dateOfBirth,
        grade: players.grade,
        gender: players.gender,
        email: players.email,
        phone: players.phone,
        emergencyContactName: players.emergencyContactName,
        emergencyContactPhone: players.emergencyContactPhone,
        medicalNotes: players.medicalNotes,
        jerseyNumber: players.jerseyNumber,
        position: players.position,
        isActive: players.isActive,
        createdAt: players.createdAt,
        updatedAt: players.updatedAt,
      })
      .from(players)
      .where(includeInactive ? sql`true` : eq(players.isActive, true))
      .orderBy(players.lastName, players.firstName);

    // Get team assignments for all players
    const playerIds = playersData.map((p) => p.id);
    let rosterData: Array<{
      playerId: string;
      teamId: string;
      teamName: string;
      gradeLevel: string;
      gender: string;
      seasonId: string;
      seasonName: string;
      isActive: boolean;
      jerseyNumber: string | null;
    }> = [];

    if (playerIds.length > 0) {
      rosterData = await db
        .select({
          playerId: teamRoster.playerId,
          teamId: teamRoster.teamId,
          teamName: teams.name,
          gradeLevel: teams.gradeLevel,
          gender: teams.gender,
          seasonId: teams.seasonId,
          seasonName: seasons.name,
          isActive: teamRoster.isActive,
          jerseyNumber: teamRoster.jerseyNumber,
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
          team_id: r.teamId,
          team_name: r.teamName,
          grade_level: r.gradeLevel,
          gender: r.gender,
          season_id: r.seasonId,
          season_name: r.seasonName,
          is_active: r.isActive,
          jersey_number: r.jerseyNumber,
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

    const result = filteredPlayers.map((player) => ({
      id: player.id,
      first_name: player.firstName,
      last_name: player.lastName,
      date_of_birth: player.dateOfBirth,
      grade: player.grade,
      gender: player.gender,
      email: player.email,
      phone: player.phone,
      emergency_contact_name: player.emergencyContactName,
      emergency_contact_phone: player.emergencyContactPhone,
      medical_notes: player.medicalNotes,
      jersey_number: player.jerseyNumber,
      position: player.position,
      is_active: player.isActive,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
      team_assignments: rosterByPlayer[player.id] || [],
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching players:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch players' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newPlayer] = await db
      .insert(players)
      .values({
        firstName: body.first_name,
        lastName: body.last_name,
        dateOfBirth: body.date_of_birth,
        grade: body.grade,
        gender: body.gender,
        email: body.email,
        phone: body.phone,
        emergencyContactName: body.emergency_contact_name,
        emergencyContactPhone: body.emergency_contact_phone,
        medicalNotes: body.medical_notes,
        jerseyNumber: body.jersey_number,
        position: body.position,
        isActive: body.is_active ?? true,
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

    return new Response(JSON.stringify(newPlayer), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating player:', error);
    return new Response(JSON.stringify({ error: 'Failed to create player' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing player ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.date_of_birth !== undefined)
      updateData.dateOfBirth = body.date_of_birth;
    if (body.grade !== undefined) updateData.grade = body.grade;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.emergency_contact_name !== undefined)
      updateData.emergencyContactName = body.emergency_contact_name;
    if (body.emergency_contact_phone !== undefined)
      updateData.emergencyContactPhone = body.emergency_contact_phone;
    if (body.medical_notes !== undefined)
      updateData.medicalNotes = body.medical_notes;
    if (body.jersey_number !== undefined)
      updateData.jerseyNumber = body.jersey_number;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const [updated] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Player not found' }), {
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
    console.error('Error updating player:', error);
    return new Response(JSON.stringify({ error: 'Failed to update player' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing player ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.delete(players).where(eq(players.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting player:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete player' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

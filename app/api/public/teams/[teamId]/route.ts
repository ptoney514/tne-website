import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, coaches, seasons, teamRoster, players } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Fetch team with head coach, assistant coach, and season
    const teamData = await db
      .select({
        id: teams.id,
        name: teams.name,
        gradeLevel: teams.gradeLevel,
        gender: teams.gender,
        practiceLocation: teams.practiceLocation,
        practiceDays: teams.practiceDays,
        practiceTime: teams.practiceTime,
        teamFee: teams.teamFee,
        uniformFee: teams.uniformFee,
        isActive: teams.isActive,
        seasonId: teams.seasonId,
        seasonName: seasons.name,
        headCoachId: teams.headCoachId,
        assistantCoachId: teams.assistantCoachId,
        headCoachFirstName: coaches.firstName,
        headCoachLastName: coaches.lastName,
        headCoachBio: coaches.bio,
      })
      .from(teams)
      .leftJoin(seasons, eq(teams.seasonId, seasons.id))
      .leftJoin(coaches, eq(teams.headCoachId, coaches.id))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (teamData.length === 0) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const team = teamData[0];

    // Fetch assistant coach separately if exists
    let assistantCoach = null;
    if (team.assistantCoachId) {
      const asstData = await db
        .select({
          id: coaches.id,
          firstName: coaches.firstName,
          lastName: coaches.lastName,
        })
        .from(coaches)
        .where(eq(coaches.id, team.assistantCoachId))
        .limit(1);

      if (asstData.length > 0) {
        assistantCoach = {
          id: asstData[0].id,
          first_name: asstData[0].firstName,
          last_name: asstData[0].lastName,
        };
      }
    }

    // Fetch roster with player details
    const rosterData = await db
      .select({
        id: teamRoster.id,
        jerseyNumber: teamRoster.jerseyNumber,
        position: teamRoster.position,
        playerId: players.id,
        playerFirstName: players.firstName,
        playerLastName: players.lastName,
        playerJerseyNumber: players.jerseyNumber,
        playerGraduatingYear: players.graduatingYear,
      })
      .from(teamRoster)
      .innerJoin(players, eq(teamRoster.playerId, players.id))
      .where(
        and(
          eq(teamRoster.teamId, teamId),
          eq(teamRoster.isActive, true)
        )
      );

    // Transform result
    const result = {
      id: team.id,
      name: team.name,
      grade_level: team.gradeLevel,
      gender: team.gender,
      tier: team.name.toLowerCase().startsWith('tne') ? 'tne' : 'express',
      practice_location: team.practiceLocation,
      practice_days: team.practiceDays,
      practice_time: team.practiceTime,
      team_fee: team.teamFee,
      uniform_fee: team.uniformFee,
      is_active: team.isActive,
      season: team.seasonName
        ? { id: team.seasonId, name: team.seasonName }
        : null,
      head_coach: team.headCoachId
        ? {
            id: team.headCoachId,
            first_name: team.headCoachFirstName,
            last_name: team.headCoachLastName,
            bio: team.headCoachBio,
          }
        : null,
      assistant_coach: assistantCoach,
      roster: rosterData.map((r) => ({
        id: r.id,
        jersey_number: r.jerseyNumber || r.playerJerseyNumber,
        position: r.position,
        player: {
          id: r.playerId,
          first_name: r.playerFirstName,
          last_name: r.playerLastName,
          jersey_number: r.playerJerseyNumber,
          graduating_year: r.playerGraduatingYear,
        },
      })),
      roster_count: rosterData.length,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching team detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, coaches, seasons } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const seasonId = request.nextUrl.searchParams.get('seasonId');

    // Build query with joins for coaches and seasons
    const teamsData = await db
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
        headCoachFirstName: coaches.firstName,
        headCoachLastName: coaches.lastName,
      })
      .from(teams)
      .leftJoin(seasons, eq(teams.seasonId, seasons.id))
      .leftJoin(coaches, eq(teams.headCoachId, coaches.id))
      .where(
        seasonId
          ? and(eq(teams.isActive, true), eq(teams.seasonId, seasonId))
          : eq(teams.isActive, true)
      )
      .orderBy(teams.gradeLevel);

    // Transform to match frontend expectations
    const result = teamsData.map((team) => ({
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
      season_id: team.seasonId,
      season: team.seasonName
        ? { id: team.seasonId, name: team.seasonName }
        : null,
      head_coach: team.headCoachId
        ? {
            id: team.headCoachId,
            first_name: team.headCoachFirstName,
            last_name: team.headCoachLastName,
          }
        : null,
    }));

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minute cache
      },
    });
  } catch (error) {
    console.error('Error fetching public teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

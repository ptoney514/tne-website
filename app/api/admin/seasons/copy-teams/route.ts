import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { sourceSeasonId, targetSeasonId } = body;

    if (!sourceSeasonId || !targetSeasonId) {
      return NextResponse.json(
        { error: 'Both sourceSeasonId and targetSeasonId are required' },
        { status: 400 }
      );
    }

    if (sourceSeasonId === targetSeasonId) {
      return NextResponse.json(
        { error: 'Source and target seasons must be different' },
        { status: 400 }
      );
    }

    // Fetch teams from source season
    const sourceTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.seasonId, sourceSeasonId));

    if (sourceTeams.length === 0) {
      return NextResponse.json(
        { error: 'No teams found in source season' },
        { status: 404 }
      );
    }

    // Copy team structures to target season (no rosters)
    const newTeams = await db
      .insert(teams)
      .values(
        sourceTeams.map((team) => ({
          seasonId: targetSeasonId,
          name: team.name,
          gradeLevel: team.gradeLevel,
          gender: team.gender,
          headCoachId: team.headCoachId,
          assistantCoachId: team.assistantCoachId,
          practiceLocation: team.practiceLocation,
          practiceDays: team.practiceDays,
          practiceTime: team.practiceTime,
          teamFee: team.teamFee,
          uniformFee: team.uniformFee,
          isActive: true,
        }))
      )
      .returning();

    return NextResponse.json({
      count: newTeams.length,
      teams: newTeams,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error copying teams:', error);
    return NextResponse.json(
      { error: 'Failed to copy teams' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practiceSessions, practiceSessionTeams } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    // Get practice sessions for the team
    const teamPractices = await db
      .select({
        id: practiceSessionTeams.id,
        practiceSession: practiceSessions,
      })
      .from(practiceSessionTeams)
      .innerJoin(practiceSessions, eq(practiceSessionTeams.practiceSessionId, practiceSessions.id))
      .where(
        and(
          eq(practiceSessionTeams.teamId, teamId),
          eq(practiceSessions.isActive, true)
        )
      );

    const practices = teamPractices.map(p => p.practiceSession);

    // Sort by day of week
    const dayOrder: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };

    practices.sort((a, b) => {
      const dayA = dayOrder[a.dayOfWeek?.toLowerCase() || ''] || 8;
      const dayB = dayOrder[b.dayOfWeek?.toLowerCase() || ''] || 8;
      if (dayA !== dayB) return dayA - dayB;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return NextResponse.json(practices);
  } catch (error) {
    console.error('Public practice-schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

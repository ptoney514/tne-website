import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { practiceSessions, practiceSessionTeams } from '../lib/schema';
import { eq, and } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID required' });
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
          eq(practiceSessionTeams.teamId, teamId as string),
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

    return res.status(200).json(practices);
  } catch (error) {
    console.error('Public practice-schedule error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

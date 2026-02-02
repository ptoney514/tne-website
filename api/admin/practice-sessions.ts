import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { practiceSessions, practiceSessionTeams, teams, seasons } from '../lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '../lib/auth-middleware';

export const config = {
  runtime: 'nodejs',
};

async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id, teamId } = req.query;

        // Get practice sessions for a specific team
        if (teamId) {
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

          return res.status(200).json(teamPractices.map(p => p.practiceSession));
        }

        if (id) {
          const practice = await db
            .select()
            .from(practiceSessions)
            .where(eq(practiceSessions.id, id as string))
            .limit(1);

          if (practice.length === 0) {
            return res.status(404).json({ error: 'Practice session not found' });
          }
          return res.status(200).json(practice[0]);
        }

        // Get all practices with their assigned teams and season
        const allPractices = await db
          .select({
            practice: practiceSessions,
            season: seasons,
          })
          .from(practiceSessions)
          .leftJoin(seasons, eq(practiceSessions.seasonId, seasons.id))
          .orderBy(practiceSessions.dayOfWeek);

        // Get team assignments for each practice
        const practiceIds = allPractices.map(p => p.practice.id);
        const assignments = practiceIds.length > 0
          ? await db
              .select({
                practiceSessionId: practiceSessionTeams.practiceSessionId,
                teamId: practiceSessionTeams.teamId,
                team: teams,
              })
              .from(practiceSessionTeams)
              .innerJoin(teams, eq(practiceSessionTeams.teamId, teams.id))
          : [];

        // Group assignments by practice
        const assignmentMap = new Map();
        for (const a of assignments) {
          if (!assignmentMap.has(a.practiceSessionId)) {
            assignmentMap.set(a.practiceSessionId, []);
          }
          assignmentMap.get(a.practiceSessionId).push({
            id: a.teamId,
            team: a.team,
          });
        }

        const result = allPractices.map(p => ({
          ...p.practice,
          season: p.season,
          practice_session_teams: assignmentMap.get(p.practice.id) || [],
        }));

        return res.status(200).json(result);
      }

      case 'POST': {
        const { teamIds, ...practiceData } = req.body;

        // Get active season if not provided
        if (!practiceData.seasonId) {
          const activeSeason = await db
            .select()
            .from(seasons)
            .where(eq(seasons.isActive, true))
            .limit(1);

          if (activeSeason.length === 0) {
            return res.status(400).json({ error: 'No active season found' });
          }
          practiceData.seasonId = activeSeason[0].id;
        }

        const [newPractice] = await db
          .insert(practiceSessions)
          .values(practiceData)
          .returning();

        // Assign teams if provided
        if (teamIds && teamIds.length > 0) {
          const assignmentData = teamIds.map((teamId: string) => ({
            practiceSessionId: newPractice.id,
            teamId,
          }));

          await db.insert(practiceSessionTeams).values(assignmentData);
        }

        return res.status(201).json(newPractice);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Practice session ID required' });
        }

        const { teamIds, ...updates } = req.body;

        const [updated] = await db
          .update(practiceSessions)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(practiceSessions.id, id as string))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: 'Practice session not found' });
        }

        // Update team assignments if provided
        if (teamIds !== undefined) {
          // Delete existing assignments
          await db
            .delete(practiceSessionTeams)
            .where(eq(practiceSessionTeams.practiceSessionId, id as string));

          // Add new assignments
          if (teamIds.length > 0) {
            const assignmentData = teamIds.map((teamId: string) => ({
              practiceSessionId: id as string,
              teamId,
            }));

            await db.insert(practiceSessionTeams).values(assignmentData);
          }
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Practice session ID required' });
        }

        // Delete team assignments first (cascade should handle this but being explicit)
        await db
          .delete(practiceSessionTeams)
          .where(eq(practiceSessionTeams.practiceSessionId, id as string));

        await db.delete(practiceSessions).where(eq(practiceSessions.id, id as string));

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Admin practice-sessions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);

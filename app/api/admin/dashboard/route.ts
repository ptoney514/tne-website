import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  teams,
  players,
  coaches,
  registrations,
  tryoutSignups,
  teamRoster,
  seasons,
} from '@/lib/schema';
import { requireRole, getCoachTeamIds } from '@/lib/auth-middleware';
import { eq, sql, and, gte, lte, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['admin', 'coach']);
    const isCoach = session.user.role === 'coach';

    let coachTeamIds: string[] = [];
    if (isCoach) {
      coachTeamIds = await getCoachTeamIds(session.user.id);
    }

    const seasonId = request.nextUrl.searchParams.get('seasonId');

    // Get current season if not specified
    const today = new Date().toISOString().split('T')[0];
    let currentSeasonId = seasonId;

    if (!currentSeasonId) {
      const [currentSeason] = await db
        .select()
        .from(seasons)
        .where(and(lte(seasons.startDate, today), gte(seasons.endDate, today)))
        .limit(1);

      currentSeasonId = currentSeason?.id;
    }

    if (isCoach) {
      // Scoped stats for coaches
      const teamConditions = [];
      if (currentSeasonId) teamConditions.push(eq(teams.seasonId, currentSeasonId));
      teamConditions.push(eq(teams.isActive, true));
      if (coachTeamIds.length > 0) teamConditions.push(inArray(teams.id, coachTeamIds));

      const [totalTeamsResult, rosterCountResult, registrationsByStatusResult] = await Promise.all([
        coachTeamIds.length > 0
          ? db
              .select({ count: sql<number>`count(*)::int` })
              .from(teams)
              .where(and(...teamConditions))
          : [{ count: 0 }],

        coachTeamIds.length > 0
          ? db
              .select({ count: sql<number>`count(*)::int` })
              .from(teamRoster)
              .where(and(eq(teamRoster.isActive, true), inArray(teamRoster.teamId, coachTeamIds)))
          : [{ count: 0 }],

        coachTeamIds.length > 0
          ? db
              .select({
                status: registrations.status,
                count: sql<number>`count(*)::int`,
              })
              .from(registrations)
              .where(inArray(registrations.teamId, coachTeamIds))
              .groupBy(registrations.status)
          : [],
      ]);

      const regByStatus = registrationsByStatusResult.reduce(
        (acc, r) => {
          acc[r.status] = r.count;
          return acc;
        },
        {} as Record<string, number>
      );

      const stats = {
        teams: {
          total: totalTeamsResult[0]?.count || 0,
          label: 'Active Teams',
        },
        players: {
          total: rosterCountResult[0]?.count || 0,
          onRoster: rosterCountResult[0]?.count || 0,
          label: 'Active Players',
        },
        coaches: {
          total: 0,
          label: 'Active Coaches',
        },
        registrations: {
          pending: regByStatus['pending'] || 0,
          approved: regByStatus['approved'] || 0,
          rejected: regByStatus['rejected'] || 0,
          total:
            (regByStatus['pending'] || 0) +
            (regByStatus['approved'] || 0) +
            (regByStatus['rejected'] || 0),
          label: 'Registrations',
        },
        tryouts: {
          recentSignups: 0,
          label: 'Tryout Signups (30d)',
        },
        current_season_id: currentSeasonId,
      };

      return NextResponse.json(stats);
    }

    // Admin: full stats (unchanged)
    // Run all counts in parallel
    const [
      totalTeamsResult,
      activePlayersResult,
      activeCoachesResult,
      pendingRegistrationsResult,
      tryoutSignupsResult,
      rosterCountResult,
      registrationsByStatusResult,
    ] = await Promise.all([
      // Total teams (in current season if specified)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(teams)
        .where(
          currentSeasonId
            ? and(eq(teams.seasonId, currentSeasonId), eq(teams.isActive, true))
            : eq(teams.isActive, true)
        ),

      // Total players
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(players),

      // Active coaches
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(coaches)
        .where(eq(coaches.isActive, true)),

      // Pending registrations
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(registrations)
        .where(eq(registrations.status, 'pending')),

      // Recent tryout signups (last 30 days)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tryoutSignups)
        .where(
          gte(
            tryoutSignups.createdAt,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          )
        ),

      // Total roster entries (active players on teams)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(teamRoster)
        .where(eq(teamRoster.isActive, true)),

      // Registrations by status
      db
        .select({
          status: registrations.status,
          count: sql<number>`count(*)::int`,
        })
        .from(registrations)
        .groupBy(registrations.status),
    ]);

    // Transform registrations by status
    const regByStatus = registrationsByStatusResult.reduce(
      (acc, r) => {
        acc[r.status] = r.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      teams: {
        total: totalTeamsResult[0]?.count || 0,
        label: 'Active Teams',
      },
      players: {
        total: activePlayersResult[0]?.count || 0,
        onRoster: rosterCountResult[0]?.count || 0,
        label: 'Active Players',
      },
      coaches: {
        total: activeCoachesResult[0]?.count || 0,
        label: 'Active Coaches',
      },
      registrations: {
        pending: pendingRegistrationsResult[0]?.count || 0,
        approved: regByStatus['approved'] || 0,
        rejected: regByStatus['rejected'] || 0,
        total:
          (regByStatus['pending'] || 0) +
          (regByStatus['approved'] || 0) +
          (regByStatus['rejected'] || 0),
        label: 'Registrations',
      },
      tryouts: {
        recentSignups: tryoutSignupsResult[0]?.count || 0,
        label: 'Tryout Signups (30d)',
      },
      current_season_id: currentSeasonId,
    };

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

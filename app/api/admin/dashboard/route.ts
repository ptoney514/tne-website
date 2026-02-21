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
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

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

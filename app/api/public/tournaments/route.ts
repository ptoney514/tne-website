import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, gameTeams, teams, tournamentDetails, tournamentHotels, tournamentNearbyPlaces, hotels, nearbyPlaces, venues } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    // Get single tournament with full details
    if (id) {
      const tournament = await db
        .select()
        .from(games)
        .where(
          and(
            eq(games.id, id),
            eq(games.gameType, 'tournament')
          )
        )
        .limit(1);

      if (tournament.length === 0) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }

      // Get team assignments
      const teamAssignments = await db
        .select({
          gameTeam: gameTeams,
          team: teams,
        })
        .from(gameTeams)
        .innerJoin(teams, eq(gameTeams.teamId, teams.id))
        .where(eq(gameTeams.gameId, id));

      // Get tournament details
      const detail = await db
        .select()
        .from(tournamentDetails)
        .where(eq(tournamentDetails.gameId, id))
        .limit(1);

      let venue = null;
      let hotelData: any[] = [];
      let placeData: any[] = [];

      if (detail.length > 0) {
        const detailId = detail[0].id;

        // Get venue
        if (detail[0].venueId) {
          const venueResult = await db
            .select()
            .from(venues)
            .where(eq(venues.id, detail[0].venueId))
            .limit(1);
          venue = venueResult[0] || null;
        }

        // Get hotels
        const hotelLinks = await db
          .select({
            link: tournamentHotels,
            hotel: hotels,
          })
          .from(tournamentHotels)
          .innerJoin(hotels, eq(tournamentHotels.hotelId, hotels.id))
          .where(eq(tournamentHotels.tournamentDetailId, detailId));

        hotelData = hotelLinks.map(h => ({
          ...h.hotel,
          linkId: h.link.id,
          isTeamRate: h.link.isTeamRate,
          nightlyRate: h.link.nightlyRate,
          originalRate: h.link.originalRate,
          discountPercentage: h.link.discountPercentage,
          teamRateCode: h.link.teamRateCode,
          bookingDeadline: h.link.bookingDeadline,
          specialBookingUrl: h.link.specialBookingUrl,
          distanceMiles: h.link.distanceMiles,
          driveTimeMinutes: h.link.driveTimeMinutes,
          displayOrder: h.link.displayOrder,
        }));

        // Get places
        const placeLinks = await db
          .select({
            link: tournamentNearbyPlaces,
            place: nearbyPlaces,
          })
          .from(tournamentNearbyPlaces)
          .innerJoin(nearbyPlaces, eq(tournamentNearbyPlaces.nearbyPlaceId, nearbyPlaces.id))
          .where(eq(tournamentNearbyPlaces.tournamentDetailId, detailId));

        placeData = placeLinks.map(p => ({
          ...p.place,
          linkId: p.link.id,
          distanceMiles: p.link.distanceMiles,
          hasTeamDiscount: p.link.hasTeamDiscount,
          teamDiscountInfo: p.link.teamDiscountInfo,
          isRecommended: p.link.isRecommended,
          recommendationNote: p.link.recommendationNote,
          displayOrder: p.link.displayOrder,
        }));
      }

      // Sort by display order
      hotelData.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      placeData.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      // Transform to expected format
      const result = {
        tournament: {
          id: tournament[0].id,
          name: tournament[0].name,
          date: tournament[0].date,
          endDate: tournament[0].endDate,
          startTime: tournament[0].startTime,
          endTime: tournament[0].endTime,
          location: tournament[0].location,
          address: tournament[0].address,
          externalUrl: tournament[0].externalUrl,
          isFeatured: tournament[0].isFeatured,
          notes: tournament[0].notes,
        },
        teams: teamAssignments.map(t => ({
          ...t.team,
          result: t.gameTeam.result,
        })),
        venue,
        details: detail[0] ? {
          id: detail[0].id,
          description: detail[0].description,
          divisionCount: detail[0].divisionCount,
          totalTeams: detail[0].totalTeams,
          ageDivisions: detail[0].ageDivisions,
          registrationUrl: detail[0].registrationUrl,
          registrationDeadline: detail[0].registrationDeadline,
          entryFee: detail[0].entryFee,
          schedulePdfUrl: detail[0].schedulePdfUrl,
          rulesPdfUrl: detail[0].rulesPdfUrl,
          bracketUrl: detail[0].bracketUrl,
          teamRateCode: detail[0].teamRateCode,
          teamRateDeadline: detail[0].teamRateDeadline,
          teamRateDescription: detail[0].teamRateDescription,
          driveTime: detail[0].driveTime,
          mapCenter: {
            lat: detail[0].mapCenterLat || venue?.latitude,
            lng: detail[0].mapCenterLng || venue?.longitude,
          },
          mapZoom: detail[0].mapZoomLevel || 13,
          showHotels: detail[0].showHotels,
          showAttractions: detail[0].showAttractions,
          showRestaurants: detail[0].showRestaurants,
        } : null,
        hotels: hotelData,
        nearbyPlaces: placeData,
        attractions: placeData.filter((p: any) => p.placeType === 'attraction' || p.placeType === 'entertainment'),
        restaurants: placeData.filter((p: any) => p.placeType === 'restaurant'),
      };

      return NextResponse.json(result);
    }

    // List ALL tournaments (past + future) for season tabs
    const allTournaments = await db
      .select()
      .from(games)
      .where(eq(games.gameType, 'tournament'))
      .orderBy(games.date);

    if (allTournaments.length === 0) {
      return NextResponse.json([]);
    }

    const gameIds = allTournaments.map((t) => t.id);

    // Batch: get all team assignments
    const allTeamAssignments = await db
      .select({
        gameId: gameTeams.gameId,
        teamId: teams.id,
        teamName: teams.name,
        gender: teams.gender,
        gradeLevel: teams.gradeLevel,
      })
      .from(gameTeams)
      .innerJoin(teams, eq(gameTeams.teamId, teams.id))
      .where(sql`${gameTeams.gameId} IN ${gameIds}`);

    // Build a map: gameId -> teams[]
    const teamsMap = new Map<string, { id: string; name: string; gender: string; gradeLevel: string }[]>();
    for (const row of allTeamAssignments) {
      if (!teamsMap.has(row.gameId)) teamsMap.set(row.gameId, []);
      teamsMap.get(row.gameId)!.push({
        id: row.teamId,
        name: row.teamName,
        gender: row.gender,
        gradeLevel: row.gradeLevel,
      });
    }

    // Batch: get all tournament details
    const allDetails = await db
      .select()
      .from(tournamentDetails)
      .where(sql`${tournamentDetails.gameId} IN ${gameIds}`);

    // Build a map: gameId -> detail
    const detailsMap = new Map<string, typeof allDetails[0]>();
    for (const d of allDetails) {
      detailsMap.set(d.gameId, d);
    }

    // Batch: get venues for details that have venueIds
    const venueIds = allDetails
      .map((d) => d.venueId)
      .filter((id): id is string => id !== null);

    let venuesMap = new Map<string, { name: string | null; city: string | null; state: string | null }>();
    if (venueIds.length > 0) {
      const allVenues = await db
        .select()
        .from(venues)
        .where(sql`${venues.id} IN ${venueIds}`);

      for (const v of allVenues) {
        venuesMap.set(v.id, { name: v.name, city: v.city, state: v.state });
      }
    }

    // Batch: check which tournament details have team rates
    const detailIds = allDetails.map((d) => d.id);
    const hasTeamRateSet = new Set<string>();
    if (detailIds.length > 0) {
      const teamRateRows = await db
        .select({ tournamentDetailId: tournamentHotels.tournamentDetailId })
        .from(tournamentHotels)
        .where(
          and(
            sql`${tournamentHotels.tournamentDetailId} IN ${detailIds}`,
            eq(tournamentHotels.isTeamRate, true)
          )
        );

      for (const row of teamRateRows) {
        hasTeamRateSet.add(row.tournamentDetailId);
      }
    }

    // Build response
    const result = allTournaments.map((t) => {
      const detail = detailsMap.get(t.id);
      const venue = detail?.venueId ? venuesMap.get(detail.venueId) : null;
      const tournamentTeams = teamsMap.get(t.id) || [];
      const hasTeamRate = detail ? hasTeamRateSet.has(detail.id) : false;

      return {
        id: t.id,
        seasonId: t.seasonId,
        name: t.name,
        date: t.date,
        endDate: t.endDate,
        location: t.location,
        isFeatured: t.isFeatured,
        driveTime: detail?.driveTime || null,
        hasTeamRate,
        totalTeams: detail?.totalTeams || null,
        divisionCount: detail?.divisionCount || null,
        ageDivisions: detail?.ageDivisions || null,
        hasDetails: !!detail,
        venue: venue ? { name: venue.name, city: venue.city, state: venue.state } : null,
        teams: tournamentTeams,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Public tournaments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

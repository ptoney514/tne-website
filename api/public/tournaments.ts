import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { games, gameTeams, teams, tournamentDetails, tournamentHotels, tournamentNearbyPlaces, hotels, nearbyPlaces, venues } from '../lib/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { id } = req.query;

    // Get single tournament with full details
    if (id) {
      const tournament = await db
        .select()
        .from(games)
        .where(
          and(
            eq(games.id, id as string),
            eq(games.gameType, 'tournament')
          )
        )
        .limit(1);

      if (tournament.length === 0) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      // Get team assignments
      const teamAssignments = await db
        .select({
          gameTeam: gameTeams,
          team: teams,
        })
        .from(gameTeams)
        .innerJoin(teams, eq(gameTeams.teamId, teams.id))
        .where(eq(gameTeams.gameId, id as string));

      // Get tournament details
      const detail = await db
        .select()
        .from(tournamentDetails)
        .where(eq(tournamentDetails.gameId, id as string))
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
      hotelData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      placeData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
        attractions: placeData.filter(p => p.placeType === 'attraction' || p.placeType === 'entertainment'),
        restaurants: placeData.filter(p => p.placeType === 'restaurant'),
      };

      return res.status(200).json(result);
    }

    // List upcoming tournaments
    const today = new Date().toISOString().split('T')[0];

    const upcomingTournaments = await db
      .select()
      .from(games)
      .where(
        and(
          eq(games.gameType, 'tournament'),
          gte(games.date, today)
        )
      )
      .orderBy(games.date);

    // Get team counts and details for each
    const result = await Promise.all(
      upcomingTournaments.map(async (t) => {
        const teamCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(gameTeams)
          .where(eq(gameTeams.gameId, t.id));

        const detail = await db
          .select()
          .from(tournamentDetails)
          .where(eq(tournamentDetails.gameId, t.id))
          .limit(1);

        let venue = null;
        if (detail[0]?.venueId) {
          const venueResult = await db
            .select()
            .from(venues)
            .where(eq(venues.id, detail[0].venueId))
            .limit(1);
          venue = venueResult[0] || null;
        }

        return {
          id: t.id,
          name: t.name,
          date: t.date,
          endDate: t.endDate,
          location: t.location,
          externalUrl: t.externalUrl,
          isFeatured: t.isFeatured,
          teamsCount: Number(teamCount[0]?.count || 0),
          divisionCount: detail[0]?.divisionCount,
          totalTeams: detail[0]?.totalTeams,
          venue: venue ? { name: venue.name, city: venue.city, state: venue.state } : null,
          hasDetails: !!detail[0],
        };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Public tournaments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

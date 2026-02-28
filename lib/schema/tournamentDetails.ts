import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  date,
  doublePrecision,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { games } from './games';
import { venues } from './venues';
import { hotels } from './hotels';
import { nearbyPlaces } from './nearbyPlaces';

// Main tournament details table
export const tournamentDetails = pgTable(
  'tournament_details',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    venueId: uuid('venue_id').references(() => venues.id, {
      onDelete: 'set null',
    }),
    description: text('description'),
    divisionCount: integer('division_count'),
    totalTeams: integer('total_teams'),
    ageDivisions: text('age_divisions'), // JSON array stored as text
    registrationUrl: text('registration_url'),
    registrationDeadline: date('registration_deadline'),
    entryFee: decimal('entry_fee', { precision: 10, scale: 2 }),
    schedulePdfUrl: text('schedule_pdf_url'),
    rulesPdfUrl: text('rules_pdf_url'),
    bracketUrl: text('bracket_url'),
    teamRateCode: text('team_rate_code'),
    teamRateDeadline: date('team_rate_deadline'),
    teamRateDescription: text('team_rate_description'),
    driveTime: text('drive_time'), // e.g. "15 min", "3 hrs", "Local"
    mapCenterLat: doublePrecision('map_center_lat'),
    mapCenterLng: doublePrecision('map_center_lng'),
    mapZoomLevel: integer('map_zoom_level').default(13),
    showHotels: boolean('show_hotels').notNull().default(true),
    showAttractions: boolean('show_attractions').notNull().default(true),
    showRestaurants: boolean('show_restaurants').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_tournament_details_game').on(table.gameId),
    index('idx_tournament_details_venue').on(table.venueId),
  ]
);

// Junction table for tournament hotels
export const tournamentHotels = pgTable(
  'tournament_hotels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tournamentDetailId: uuid('tournament_detail_id')
      .notNull()
      .references(() => tournamentDetails.id, { onDelete: 'cascade' }),
    hotelId: uuid('hotel_id')
      .notNull()
      .references(() => hotels.id, { onDelete: 'cascade' }),
    isTeamRate: boolean('is_team_rate').notNull().default(false),
    nightlyRate: decimal('nightly_rate', { precision: 10, scale: 2 }),
    originalRate: decimal('original_rate', { precision: 10, scale: 2 }),
    discountPercentage: integer('discount_percentage'),
    teamRateCode: text('team_rate_code'),
    bookingDeadline: date('booking_deadline'),
    specialBookingUrl: text('special_booking_url'),
    distanceMiles: doublePrecision('distance_miles'),
    driveTimeMinutes: integer('drive_time_minutes'),
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_tournament_hotels_detail').on(table.tournamentDetailId),
    index('idx_tournament_hotels_hotel').on(table.hotelId),
  ]
);

// Junction table for tournament nearby places
export const tournamentNearbyPlaces = pgTable(
  'tournament_nearby_places',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tournamentDetailId: uuid('tournament_detail_id')
      .notNull()
      .references(() => tournamentDetails.id, { onDelete: 'cascade' }),
    nearbyPlaceId: uuid('nearby_place_id')
      .notNull()
      .references(() => nearbyPlaces.id, { onDelete: 'cascade' }),
    distanceMiles: doublePrecision('distance_miles'),
    hasTeamDiscount: boolean('has_team_discount').notNull().default(false),
    teamDiscountInfo: text('team_discount_info'),
    isRecommended: boolean('is_recommended').notNull().default(false),
    recommendationNote: text('recommendation_note'),
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_tournament_nearby_places_detail').on(table.tournamentDetailId),
    index('idx_tournament_nearby_places_place').on(table.nearbyPlaceId),
  ]
);

export type TournamentDetail = typeof tournamentDetails.$inferSelect;
export type NewTournamentDetail = typeof tournamentDetails.$inferInsert;

export type TournamentHotel = typeof tournamentHotels.$inferSelect;
export type NewTournamentHotel = typeof tournamentHotels.$inferInsert;

export type TournamentNearbyPlace = typeof tournamentNearbyPlaces.$inferSelect;
export type NewTournamentNearbyPlace = typeof tournamentNearbyPlaces.$inferInsert;

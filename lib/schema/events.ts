import {
  pgTable,
  uuid,
  text,
  date,
  time,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { eventTypeEnum } from './enums';
import { teams } from './teams';
import { seasons } from './seasons';

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    eventType: eventTypeEnum('event_type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time'),
    location: text('location'),
    address: text('address'),
    opponent: text('opponent'),
    isHomeGame: boolean('is_home_game'),
    tournamentName: text('tournament_name'),
    notes: text('notes'),
    isCancelled: boolean('is_cancelled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_events_team').on(table.teamId),
    index('idx_events_date').on(table.date),
    index('idx_events_type').on(table.eventType),
    index('idx_events_season').on(table.seasonId),
  ]
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

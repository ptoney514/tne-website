import {
  pgTable,
  uuid,
  text,
  date,
  time,
  boolean,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { seasons } from './seasons';

// Game type enum
export const gameTypeEnum = pgEnum('game_type', ['game', 'tournament']);

export const games = pgTable(
  'games',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    gameType: gameTypeEnum('game_type').notNull().default('game'),
    name: text('name').notNull(),
    description: text('description'),
    date: date('date').notNull(),
    endDate: date('end_date'), // For multi-day tournaments
    startTime: time('start_time'),
    endTime: time('end_time'),
    location: text('location'),
    address: text('address'),
    externalUrl: text('external_url'),
    isFeatured: boolean('is_featured').notNull().default(false),
    notes: text('notes'),
    isCancelled: boolean('is_cancelled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_games_season').on(table.seasonId),
    index('idx_games_date').on(table.date),
    index('idx_games_type').on(table.gameType),
    index('idx_games_featured').on(table.isFeatured),
  ]
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

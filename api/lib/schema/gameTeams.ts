import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { games } from './games';
import { teams } from './teams';

export const gameTeams = pgTable(
  'game_teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    opponent: text('opponent'),
    isHomeGame: boolean('is_home_game'),
    result: text('result'), // e.g., "W 45-32", "L 28-30"
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_game_teams_game').on(table.gameId),
    index('idx_game_teams_team').on(table.teamId),
    unique('unq_game_team').on(table.gameId, table.teamId),
  ]
);

export type GameTeam = typeof gameTeams.$inferSelect;
export type NewGameTeam = typeof gameTeams.$inferInsert;

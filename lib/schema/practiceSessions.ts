import {
  pgTable,
  uuid,
  text,
  time,
  boolean,
  timestamp,
  index,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { seasons } from './seasons';
import { teams } from './teams';

// Day of week enum
export const dayOfWeekEnum = pgEnum('day_of_week', [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

// Practice sessions - recurring practice schedules
export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    location: text('location').notNull(),
    address: text('address'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_practice_sessions_season').on(table.seasonId),
    index('idx_practice_sessions_day').on(table.dayOfWeek),
    index('idx_practice_sessions_active').on(table.isActive),
  ]
);

// Junction table for teams assigned to practice sessions
export const practiceSessionTeams = pgTable(
  'practice_session_teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    practiceSessionId: uuid('practice_session_id')
      .notNull()
      .references(() => practiceSessions.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_practice_session_teams_session').on(table.practiceSessionId),
    index('idx_practice_session_teams_team').on(table.teamId),
    unique('unq_practice_session_team').on(
      table.practiceSessionId,
      table.teamId
    ),
  ]
);

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type NewPracticeSession = typeof practiceSessions.$inferInsert;

export type PracticeSessionTeam = typeof practiceSessionTeams.$inferSelect;
export type NewPracticeSessionTeam = typeof practiceSessionTeams.$inferInsert;

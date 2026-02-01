import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { genderEnum } from './enums';
import { seasons } from './seasons';
import { coaches } from './coaches';

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    gradeLevel: text('grade_level').notNull(),
    gender: genderEnum('gender').notNull(),
    headCoachId: uuid('head_coach_id').references(() => coaches.id, {
      onDelete: 'set null',
    }),
    assistantCoachId: uuid('assistant_coach_id').references(() => coaches.id, {
      onDelete: 'set null',
    }),
    practiceLocation: text('practice_location'),
    practiceDays: text('practice_days'),
    practiceTime: text('practice_time'),
    teamFee: decimal('team_fee', { precision: 10, scale: 2 }),
    uniformFee: decimal('uniform_fee', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_teams_season').on(table.seasonId),
    index('idx_teams_grade').on(table.gradeLevel),
    index('idx_teams_active').on(table.isActive),
  ]
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

import {
  pgTable,
  uuid,
  text,
  date,
  time,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { genderEnum, tryoutSignupStatusEnum } from './enums';
import { seasons } from './seasons';
import { teams } from './teams';

export const tryoutSessions = pgTable(
  'tryout_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time'),
    location: text('location').notNull(),
    gradeLevels: text('grade_levels').array(),
    gender: genderEnum('gender'),
    maxCapacity: integer('max_capacity'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_tryouts_season').on(table.seasonId),
    index('idx_tryouts_date').on(table.date),
  ]
);

export const tryoutSignups = pgTable(
  'tryout_signups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => tryoutSessions.id, { onDelete: 'cascade' }),
    // Player info
    playerFirstName: text('player_first_name').notNull(),
    playerLastName: text('player_last_name').notNull(),
    playerDateOfBirth: date('player_date_of_birth').notNull(),
    playerGraduatingYear: integer('player_graduating_year').notNull(),
    playerCurrentGrade: text('player_current_grade').notNull(),
    playerGender: genderEnum('player_gender').notNull(),
    yearsExperience: integer('years_experience'),
    priorTnePlayer: boolean('prior_tne_player').default(false),
    // Parent info
    parentFirstName: text('parent_first_name').notNull(),
    parentLastName: text('parent_last_name').notNull(),
    parentEmail: text('parent_email').notNull(),
    parentPhone: text('parent_phone').notNull(),
    // Emergency contact
    emergencyContactName: text('emergency_contact_name').notNull(),
    emergencyContactPhone: text('emergency_contact_phone').notNull(),
    emergencyContactRelationship: text('emergency_contact_relationship'),
    // Status and workflow
    status: tryoutSignupStatusEnum('status').notNull().default('registered'),
    offeredTeamId: uuid('offered_team_id').references(() => teams.id, {
      onDelete: 'set null',
    }),
    offerSentAt: timestamp('offer_sent_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_signups_session').on(table.sessionId),
    index('idx_signups_status').on(table.status),
    index('idx_signups_email').on(table.parentEmail),
  ]
);

export type TryoutSession = typeof tryoutSessions.$inferSelect;
export type NewTryoutSession = typeof tryoutSessions.$inferInsert;
export type TryoutSignup = typeof tryoutSignups.$inferSelect;
export type NewTryoutSignup = typeof tryoutSignups.$inferInsert;

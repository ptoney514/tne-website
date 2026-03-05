import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { genderEnum } from './enums';
import { parents } from './parents';

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    dateOfBirth: date('date_of_birth'),
    graduatingYear: integer('graduating_year').notNull(),
    currentGrade: text('current_grade').notNull(),
    gender: genderEnum('gender').notNull(),
    primaryParentId: uuid('primary_parent_id').references(() => parents.id, {
      onDelete: 'set null',
    }),
    secondaryParentId: uuid('secondary_parent_id').references(() => parents.id, {
      onDelete: 'set null',
    }),
    emergencyContactName: text('emergency_contact_name'),
    emergencyContactPhone: text('emergency_contact_phone'),
    emergencyContactRelationship: text('emergency_contact_relationship'),
    medicalNotes: text('medical_notes'),
    jerseyNumber: text('jersey_number'),
    jerseySize: text('jersey_size'),
    position: text('position'),
    yearsExperience: integer('years_experience'),
    priorTnePlayer: boolean('prior_tne_player').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_players_grade').on(table.currentGrade),
    index('idx_players_graduating').on(table.graduatingYear),
    index('idx_players_parent').on(table.primaryParentId),
  ]
);

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

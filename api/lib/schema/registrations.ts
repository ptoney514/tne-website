import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  boolean,
  timestamp,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import {
  genderEnum,
  registrationStatusEnum,
  registrationSourceEnum,
  paymentStatusEnum,
} from './enums';
import { user } from './auth';
import { teams } from './teams';
import { players } from './players';
import { tryoutSignups } from './tryouts';

export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: registrationSourceEnum('source').notNull(),
    tryoutSignupId: uuid('tryout_signup_id').references(() => tryoutSignups.id, {
      onDelete: 'set null',
    }),
    teamId: uuid('team_id').references(() => teams.id, {
      onDelete: 'set null',
    }),
    // Player info (denormalized for registration form)
    playerFirstName: text('player_first_name').notNull(),
    playerLastName: text('player_last_name').notNull(),
    playerDateOfBirth: date('player_date_of_birth').notNull(),
    playerGraduatingYear: integer('player_graduating_year').notNull(),
    playerCurrentGrade: text('player_current_grade').notNull(),
    playerGender: genderEnum('player_gender').notNull(),
    jerseySize: text('jersey_size'),
    position: text('position'),
    medicalNotes: text('medical_notes'),
    // Parent info
    parentFirstName: text('parent_first_name').notNull(),
    parentLastName: text('parent_last_name').notNull(),
    parentEmail: text('parent_email').notNull(),
    parentPhone: text('parent_phone').notNull(),
    parentAddressStreet: text('parent_address_street'),
    parentAddressCity: text('parent_address_city'),
    parentAddressState: text('parent_address_state'),
    parentAddressZip: text('parent_address_zip'),
    parentRelationship: text('parent_relationship'),
    // Emergency contact
    emergencyContactName: text('emergency_contact_name').notNull(),
    emergencyContactPhone: text('emergency_contact_phone').notNull(),
    emergencyContactRelationship: text('emergency_contact_relationship'),
    // Waivers
    waiverLiabilityAccepted: boolean('waiver_liability_accepted').default(false),
    waiverLiabilityAcceptedAt: timestamp('waiver_liability_accepted_at'),
    waiverMedicalAccepted: boolean('waiver_medical_accepted').default(false),
    waiverMedicalAcceptedAt: timestamp('waiver_medical_accepted_at'),
    waiverMediaAccepted: boolean('waiver_media_accepted').default(false),
    waiverMediaAcceptedAt: timestamp('waiver_media_accepted_at'),
    // Payment
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
    paymentDate: date('payment_date'),
    paymentTransactionId: text('payment_transaction_id'),
    paymentPlanType: text('payment_plan_type'),
    // Workflow
    status: registrationStatusEnum('status').notNull().default('pending'),
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at'),
    rejectionReason: text('rejection_reason'),
    createdPlayerId: uuid('created_player_id').references(() => players.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_registrations_status').on(table.status),
    index('idx_registrations_source').on(table.source),
    index('idx_registrations_team').on(table.teamId),
    index('idx_registrations_payment').on(table.paymentStatus),
  ]
);

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  decimal,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { paymentStatusEnum } from './enums';
import { teams } from './teams';
import { players } from './players';

export const teamRoster = pgTable(
  'team_roster',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    jerseyNumber: text('jersey_number'),
    position: text('position'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
    paymentDate: date('payment_date'),
    paymentNotes: text('payment_notes'),
    notes: text('notes'),
    joinedDate: date('joined_date').notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_roster_team').on(table.teamId),
    index('idx_roster_player').on(table.playerId),
    index('idx_roster_payment').on(table.paymentStatus),
    unique('team_player_unique').on(table.teamId, table.playerId),
  ]
);

export type TeamRoster = typeof teamRoster.$inferSelect;
export type NewTeamRoster = typeof teamRoster.$inferInsert;

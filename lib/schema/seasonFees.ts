import {
  pgTable,
  uuid,
  text,
  decimal,
  boolean,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { seasons } from './seasons';

export const seasonFees = pgTable(
  'season_fees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
    isPublic: boolean('is_public').notNull().default(true),
    displayOrder: integer('display_order').notNull().default(0),
    paymentEnabled: boolean('payment_enabled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_season_fees_season_id').on(table.seasonId),
    index('idx_season_fees_active').on(table.isActive),
  ]
);

export type SeasonFee = typeof seasonFees.$inferSelect;
export type NewSeasonFee = typeof seasonFees.$inferInsert;

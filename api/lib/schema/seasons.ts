import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export const seasons = pgTable(
  'seasons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    // Admin dashboard controls
    tryoutsOpen: boolean('tryouts_open').default(false),
    tryoutsLabel: text('tryouts_label'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // Only one active season at a time (partial unique index)
    uniqueIndex('idx_seasons_active')
      .on(table.isActive)
      .where(eq(table.isActive, true)),
  ]
);

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

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
    // Index for quick active season lookup
    // Note: Enforce single active season in application logic
    index('idx_seasons_active').on(table.isActive),
  ]
);

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

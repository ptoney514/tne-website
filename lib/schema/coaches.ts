import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const coaches = pgTable(
  'coaches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: text('profile_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    bio: text('bio'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('idx_coaches_active').on(table.isActive)]
);

export type Coach = typeof coaches.$inferSelect;
export type NewCoach = typeof coaches.$inferInsert;

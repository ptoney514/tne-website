import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

// App-owned user profile table, keyed by Neon Auth user ID.
// Stores custom fields that Neon Auth doesn't manage (role, name parts, phone).
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(), // = Neon Auth user ID
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('parent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

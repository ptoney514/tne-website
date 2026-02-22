import { pgTable, pgSchema, text, boolean, timestamp } from 'drizzle-orm/pg-core';

// Read-only Drizzle reference to Neon Auth's managed user table.
// Used for admin user listing queries (JOIN with user_profiles).
const neonAuthSchema = pgSchema('neon_auth');

export const neonAuthUsers = neonAuthSchema.table('users_sync', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: boolean('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export type NeonAuthUser = typeof neonAuthUsers.$inferSelect;

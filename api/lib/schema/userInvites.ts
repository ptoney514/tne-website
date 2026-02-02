import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';
import { user } from './auth';

// Invite status enum
export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);

export const userInvites = pgTable(
  'user_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    role: userRoleEnum('role').notNull().default('parent'),
    inviteCode: text('invite_code').notNull().unique(),
    status: inviteStatusEnum('status').notNull().default('pending'),
    // user.id is text (Better Auth), not uuid
    invitedById: text('invited_by_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    acceptedById: text('accepted_by_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_invites_email').on(table.email),
    index('idx_user_invites_code').on(table.inviteCode),
    index('idx_user_invites_status').on(table.status),
    index('idx_user_invites_invited_by').on(table.invitedById),
  ]
);

export type UserInvite = typeof userInvites.$inferSelect;
export type NewUserInvite = typeof userInvites.$inferInsert;

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { userProfiles } from './userProfiles';
import { teams } from './teams';

export const announcements = pgTable(
  'announcements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isPublic: boolean('is_public').notNull().default(false),
    isPinned: boolean('is_pinned').notNull().default(false),
    publishedAt: timestamp('published_at'),
    expiresAt: timestamp('expires_at'),
    createdBy: text('created_by').references(() => userProfiles.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_announcements_team').on(table.teamId),
    index('idx_announcements_public').on(table.isPublic),
  ]
);

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

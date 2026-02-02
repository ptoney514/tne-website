import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const venues = pgTable(
  'venues',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    zipCode: text('zip_code'),
    phone: text('phone'),
    website: text('website'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    description: text('description'),
    amenities: text('amenities'), // JSON array stored as text
    parkingInfo: text('parking_info'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_venues_name').on(table.name),
    index('idx_venues_city').on(table.city),
    index('idx_venues_active').on(table.isActive),
  ]
);

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

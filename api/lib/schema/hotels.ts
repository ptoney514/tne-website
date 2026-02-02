import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';

export const hotels = pgTable(
  'hotels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    brand: text('brand'), // e.g., "Marriott", "Hilton"
    address: text('address'),
    city: text('city'),
    state: text('state'),
    zipCode: text('zip_code'),
    phone: text('phone'),
    website: text('website'),
    bookingUrl: text('booking_url'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    starRating: integer('star_rating'), // 1-5
    amenities: text('amenities'), // JSON array stored as text
    description: text('description'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_hotels_name').on(table.name),
    index('idx_hotels_city').on(table.city),
    index('idx_hotels_brand').on(table.brand),
    index('idx_hotels_active').on(table.isActive),
  ]
);

export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;

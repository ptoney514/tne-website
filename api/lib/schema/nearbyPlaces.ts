import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  boolean,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Place type enum
export const placeTypeEnum = pgEnum('place_type', [
  'restaurant',
  'attraction',
  'entertainment',
  'shopping',
  'other',
]);

export const nearbyPlaces = pgTable(
  'nearby_places',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    placeType: placeTypeEnum('place_type').notNull(),
    category: text('category'), // e.g., "Fast Food", "Theme Park"
    address: text('address'),
    city: text('city'),
    state: text('state'),
    zipCode: text('zip_code'),
    phone: text('phone'),
    website: text('website'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    priceRange: text('price_range'), // $, $$, $$$, $$$$
    description: text('description'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_nearby_places_name').on(table.name),
    index('idx_nearby_places_type').on(table.placeType),
    index('idx_nearby_places_city').on(table.city),
    index('idx_nearby_places_active').on(table.isActive),
  ]
);

export type NearbyPlace = typeof nearbyPlaces.$inferSelect;
export type NewNearbyPlace = typeof nearbyPlaces.$inferInsert;

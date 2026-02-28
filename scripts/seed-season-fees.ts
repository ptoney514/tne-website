/**
 * Seed script: Insert initial season fees for the active season.
 *
 * Usage:
 *   npx tsx scripts/seed-season-fees.ts
 *
 * Requires DATABASE_URL in .env
 */

import 'dotenv/config';
import { guardAgainstProduction } from './lib/db-guard';
guardAgainstProduction();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Seeding season fees...');

  // Find the active season (same pattern as other seed scripts)
  const [activeSeason] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.isActive, true))
    .limit(1);

  if (!activeSeason) {
    console.error('No active season found. Please create one via the admin dashboard.');
    process.exit(1);
  }

  console.log(`Found season: ${activeSeason.name} (${activeSeason.id})`);

  // Check for existing fees
  const existingFees = await db
    .select()
    .from(schema.seasonFees)
    .where(eq(schema.seasonFees.seasonId, activeSeason.id));

  if (existingFees.length > 0) {
    console.log(`Season already has ${existingFees.length} fee(s). Skipping seed.`);
    process.exit(0);
  }

  // Insert fee tiers
  const feesToInsert = [
    {
      seasonId: activeSeason.id,
      name: '3rd-8th Girls',
      description: 'Season fee for 3rd through 8th grade girls teams',
      amount: '450.00',
      displayOrder: 1,
    },
    {
      seasonId: activeSeason.id,
      name: '3rd-8th Boys',
      description: 'Season fee for 3rd through 8th grade boys teams',
      amount: '450.00',
      displayOrder: 2,
    },
    {
      seasonId: activeSeason.id,
      name: '5th-8th Boys Jr 3SSB',
      description: 'Season fee for 5th through 8th grade boys Jr 3SSB teams',
      amount: '1400.00',
      displayOrder: 3,
    },
  ];

  const inserted = await db.insert(schema.seasonFees).values(feesToInsert).returning();

  console.log(`Inserted ${inserted.length} fee(s):`);
  for (const fee of inserted) {
    console.log(`  - ${fee.name}: $${fee.amount}`);
  }

  console.log('Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

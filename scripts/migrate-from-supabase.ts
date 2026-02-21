/**
 * Data Migration Script: Supabase → Neon
 *
 * This script exports data from Supabase and imports it into Neon.
 * Run with: npx tsx scripts/migrate-from-supabase.ts
 *
 * Prerequisites:
 * 1. Set up .env with both Supabase and Neon credentials
 * 2. Run Drizzle migrations first: npm run db:push
 * 3. Review the migration plan in NEON_MIGRATION_PLAN.md
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/schema';

// Supabase client (source)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role to bypass RLS
);

// Neon client (destination)
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

interface MigrationStats {
  table: string;
  exported: number;
  imported: number;
  errors: string[];
}

const stats: MigrationStats[] = [];

async function migrateTable<T>(
  tableName: string,
  supabaseTable: string,
  drizzleTable: any,
  transform?: (row: any) => T
): Promise<void> {
  console.log(`\n📦 Migrating ${tableName}...`);
  const stat: MigrationStats = { table: tableName, exported: 0, imported: 0, errors: [] };

  try {
    // Export from Supabase
    const { data, error } = await supabase.from(supabaseTable).select('*');

    if (error) {
      stat.errors.push(`Export error: ${error.message}`);
      stats.push(stat);
      return;
    }

    stat.exported = data?.length || 0;
    console.log(`  ✓ Exported ${stat.exported} rows from Supabase`);

    if (!data || data.length === 0) {
      stats.push(stat);
      return;
    }

    // Transform data if needed
    const transformedData = transform ? data.map(transform) : data;

    // Import to Neon (in batches to avoid timeout)
    const batchSize = 100;
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      try {
        await db.insert(drizzleTable).values(batch as any);
        stat.imported += batch.length;
      } catch (err: any) {
        stat.errors.push(`Import batch ${i / batchSize + 1}: ${err.message}`);
      }
    }

    console.log(`  ✓ Imported ${stat.imported} rows to Neon`);
  } catch (err: any) {
    stat.errors.push(`General error: ${err.message}`);
  }

  stats.push(stat);
}

async function main() {
  console.log('🚀 Starting Supabase → Neon Migration');
  console.log('=====================================\n');

  // Verify connections
  console.log('Verifying connections...');

  try {
    const { data: testData, error: testError } = await supabase.from('seasons').select('count');
    if (testError) throw testError;
    console.log('✓ Supabase connection OK');
  } catch (err: any) {
    console.error('✗ Supabase connection failed:', err.message);
    process.exit(1);
  }

  try {
    await sql`SELECT 1`;
    console.log('✓ Neon connection OK');
  } catch (err: any) {
    console.error('✗ Neon connection failed:', err.message);
    process.exit(1);
  }

  // Migration order matters due to foreign keys
  // 1. Independent tables first
  await migrateTable('seasons', 'seasons', schema.seasons);
  await migrateTable('coaches', 'coaches', schema.coaches);

  // 2. Tables with FK to seasons/coaches
  await migrateTable('teams', 'teams', schema.teams);
  await migrateTable('tryout_sessions', 'tryout_sessions', schema.tryoutSessions);

  // 3. Parents and players
  await migrateTable('parents', 'parents', schema.parents);
  await migrateTable('players', 'players', schema.players);

  // 4. Join tables and dependent tables
  await migrateTable('team_roster', 'team_roster', schema.teamRoster);
  await migrateTable('tryout_signups', 'tryout_signups', schema.tryoutSignups);
  await migrateTable('registrations', 'registrations', schema.registrations);
  await migrateTable('events', 'events', schema.events);
  await migrateTable('announcements', 'announcements', schema.announcements);
  await migrateTable('contact_submissions', 'contact_submissions', schema.contactSubmissions);

  // Print summary
  console.log('\n=====================================');
  console.log('📊 Migration Summary');
  console.log('=====================================\n');

  let totalExported = 0;
  let totalImported = 0;
  let totalErrors = 0;

  for (const stat of stats) {
    const status = stat.errors.length === 0 ? '✓' : '⚠';
    console.log(`${status} ${stat.table}: ${stat.imported}/${stat.exported} rows`);
    if (stat.errors.length > 0) {
      stat.errors.forEach((e) => console.log(`    Error: ${e}`));
    }
    totalExported += stat.exported;
    totalImported += stat.imported;
    totalErrors += stat.errors.length;
  }

  console.log('\n-------------------------------------');
  console.log(`Total: ${totalImported}/${totalExported} rows migrated`);
  console.log(`Errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Migration completed with errors. Review above.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

// User migration note
console.log(`
⚠️  USER MIGRATION NOTE
=======================
This script does NOT migrate users from Supabase Auth.
Supabase passwords are hashed and cannot be exported.

After data migration:
1. Export user emails from Supabase
2. Create users in Better Auth
3. Send password reset emails to all users

Or implement a "first login" flow with magic links.
`);

main().catch(console.error);

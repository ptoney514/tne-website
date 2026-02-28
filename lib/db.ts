import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { DATABASE_URL } from './env';

// Create Neon SQL client (DATABASE_URL validated at import time)
const sql = neon(DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export types
export type Database = typeof db;

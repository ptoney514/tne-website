import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './api/lib/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

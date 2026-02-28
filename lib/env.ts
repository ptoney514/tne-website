/**
 * Environment variable validation.
 *
 * Validates required env vars at import time so missing config surfaces
 * as a clear startup error instead of a cryptic runtime crash deep in
 * a request handler.
 *
 * Usage: import '@/lib/env' in lib/db.ts or root layout.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `See .env.example for the full list of required variables.`
    );
  }
  return value.trim();
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

// ── Required ────────────────────────────────────────────────────────
export const DATABASE_URL = requireEnv('DATABASE_URL');

// ── Optional (graceful degradation if missing) ──────────────────────
export const RESEND_API_KEY = optionalEnv('RESEND_API_KEY');
export const ANTHROPIC_API_KEY = optionalEnv('ANTHROPIC_API_KEY');
export const NEON_AUTH_BASE_URL = optionalEnv('NEON_AUTH_BASE_URL');
export const BETTER_AUTH_SECRET = optionalEnv('BETTER_AUTH_SECRET');
export const APP_URL = optionalEnv('APP_URL') ?? 'http://localhost:3000';
export const NEXT_PUBLIC_APP_URL = optionalEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000';
export const ADMIN_NOTIFICATION_EMAILS = optionalEnv('ADMIN_NOTIFICATION_EMAILS');
export const NEON_PRODUCTION_ENDPOINT = optionalEnv('NEON_PRODUCTION_ENDPOINT');

// Sentry (optional — error tracking degrades gracefully)
export const SENTRY_DSN = optionalEnv('NEXT_PUBLIC_SENTRY_DSN');
export const SENTRY_AUTH_TOKEN = optionalEnv('SENTRY_AUTH_TOKEN');
export const SENTRY_ORG = optionalEnv('SENTRY_ORG');
export const SENTRY_PROJECT = optionalEnv('SENTRY_PROJECT');

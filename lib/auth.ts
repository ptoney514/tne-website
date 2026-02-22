import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './schema';

/**
 * Resolve the canonical base URL for Better Auth.
 * Checks (in order): APP_URL -> BETTER_AUTH_URL -> Vercel auto-vars -> localhost fallback.
 */
function resolveBaseURL(): string {
  if (process.env.APP_URL) return process.env.APP_URL.trim();
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.trim();
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.trim()}`;
  return 'http://localhost:3000';
}

/**
 * Build a deduplicated list of trusted origins.
 */
function buildTrustedOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://localhost:5173',
  ]);

  if (process.env.APP_URL) origins.add(process.env.APP_URL.trim());
  if (process.env.BETTER_AUTH_URL) origins.add(process.env.BETTER_AUTH_URL.trim());
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL.trim()}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`);

  return [...origins];
}

export const auth = betterAuth({
  baseURL: resolveBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET?.trim(),

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production when email service is set up
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending (Resend, SendGrid, etc.)
      console.log(`Password reset requested for ${user.email}: ${url}`);
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minute cache
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  // Custom user fields
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'parent',
        input: false, // Don't allow setting role during signup
      },
    },
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute window
    max: 10, // 10 requests per window
  },

  // Trusted origins
  trustedOrigins: buildTrustedOrigins(),
});

// Export types for use in API routes
export type Auth = typeof auth;

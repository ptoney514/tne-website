import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './schema';

export const auth = betterAuth({
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
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.VITE_APP_URL || '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
  ].filter(Boolean),
});

// Export types for use in API routes
export type Auth = typeof auth;

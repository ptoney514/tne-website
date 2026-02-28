import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
};

export default withSentryConfig(nextConfig, {
  // Upload source maps for better stack traces, then delete them
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Sentry project configuration (from env vars)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only log upload details in CI
  silent: !process.env.CI,

  // Disable Sentry telemetry
  telemetry: false,
});

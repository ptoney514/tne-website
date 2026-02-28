import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Trace sampling: 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay: only capture replays when an error occurs
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Filter out noise
  ignoreErrors: [
    'ResizeObserver loop',
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
    'AbortError',
    'Failed to fetch',
    'NetworkError',
    'Load failed',
  ],

  // Only capture errors from our own domains
  allowUrls: [
    /https?:\/\/(www\.)?tnebasketball\.com/,
    /https?:\/\/localhost/,
  ],
});

// Instrument client-side navigation transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

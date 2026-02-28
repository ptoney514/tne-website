import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Trace sampling: 100% in dev, 20% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Drop expected Neon Auth session errors (e.g. expired/invalid sessions)
  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value ?? '';
    if (message.includes('session') && message.includes('expired')) {
      return null;
    }
    return event;
  },
});

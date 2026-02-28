'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Inline styles because Tailwind isn't loaded when this error boundary renders
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0a09',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <div
            style={{
              width: '5rem',
              height: '5rem',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            Something Went Wrong
          </h1>
          <p style={{ color: '#a8a29e', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            We&apos;re sorry, but something unexpected happened. Please try again or return to the
            homepage.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#1c1917',
                fontWeight: 600,
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#292524',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

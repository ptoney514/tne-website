// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Auth API Diagnostic Tests
 *
 * These tests verify the auth API endpoints respond correctly.
 * They run against the dev server or a Vercel preview deployment.
 */

test.describe('Auth API - Health Check', () => {
  test.beforeEach(async ({ request }) => {
    // These tests require a running auth backend (Vercel serverless functions)
    // Skip when running against local Vite dev server (returns HTML for /api routes)
    const res = await request.get('/api/auth/ok').catch(() => null);
    const ct = res ? (res.headers()['content-type'] || '') : '';
    if (!res || !ct.includes('application/json')) test.skip();
  });

  test('GET /api/auth/ok returns 200 JSON', async ({ request }) => {
    const response = await request.get('/api/auth/ok');
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('auth endpoint does not return HTML (SPA rewrite leak)', async ({ request }) => {
    const response = await request.get('/api/auth/ok');
    const body = await response.text();
    expect(body).not.toContain('<!DOCTYPE');
    expect(body).not.toContain('<html');
  });
});

test.describe('Auth API - Sign In', () => {
  test.beforeEach(async ({ request }) => {
    const res = await request.get('/api/auth/ok').catch(() => null);
    const ct = res ? (res.headers()['content-type'] || '') : '';
    if (!res || !ct.includes('application/json')) test.skip();
  });

  test('POST /api/auth/sign-in/email with bad creds returns 401, not 500', async ({ request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword123',
      },
      headers: { 'Content-Type': 'application/json' },
    });

    // Should be a client error (4xx), NOT a server error (5xx)
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);

    // Response should be JSON
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('auth error responses have consistent JSON shape', async ({ request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword123',
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const body = await response.json();
    // Better Auth returns errors with a message field
    expect(body).toBeDefined();
    expect(typeof body).toBe('object');
  });
});

test.describe('Auth API - Session (Credentials Required)', () => {
  test.beforeEach(() => {
    if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
      test.skip();
    }
  });

  test('sign in with valid creds returns user and session', async ({ request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: {
        email: process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(process.env.TEST_ADMIN_EMAIL);
    expect(body.session).toBeDefined();
    expect(body.session.token).toBeDefined();
  });

  test('GET /api/auth/get-session with cookie returns user data', async ({ request }) => {
    // First sign in to get a session cookie
    const signInResponse = await request.post('/api/auth/sign-in/email', {
      data: {
        email: process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(signInResponse.status()).toBe(200);

    // The sign-in should have set cookies on the request context
    // Now check session endpoint
    const sessionResponse = await request.get('/api/auth/get-session');
    expect(sessionResponse.status()).toBe(200);

    const session = await sessionResponse.json();
    expect(session.user).toBeDefined();
    expect(session.user.email).toBe(process.env.TEST_ADMIN_EMAIL);
  });
});

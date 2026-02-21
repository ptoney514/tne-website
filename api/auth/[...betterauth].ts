import { auth } from '../lib/auth';

// Force Node.js runtime — Better Auth + Drizzle require Node APIs
// that are not available in the Edge runtime.
export const config = { runtime: 'nodejs' };

async function handler(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('[Auth Handler] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: { message: 'Internal server error' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const GET = handler;
export const POST = handler;

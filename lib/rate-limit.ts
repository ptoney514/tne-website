/**
 * In-memory rate limiter for API routes.
 *
 * Note: In serverless environments (Vercel), each function instance has its
 * own memory, so limits reset on cold starts. This still provides meaningful
 * protection against rapid-fire abuse within a warm instance. For stricter
 * guarantees, upgrade to a Redis-backed store (e.g. Upstash).
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  /** Max requests allowed per window (default: 5) */
  max: number;
  /** Window duration in milliseconds (default: 60000 = 1 minute) */
  windowMs: number;
}

// Each limiter instance gets its own Map so routes can have independent limits
const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup to prevent memory leaks from stale entries
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [, store] of stores) {
      for (const [key, entry] of store) {
        if (now - entry.windowStart > 5 * 60 * 1000) {
          store.delete(key);
        }
      }
    }
  }, CLEANUP_INTERVAL);
  // Don't keep the process alive just for cleanup
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Extract client IP from a Next.js request.
 * Checks x-forwarded-for (set by Vercel/proxies), then falls back to
 * x-real-ip, and finally 'unknown'.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; first is the client
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Create a rate limiter for a specific route/purpose.
 *
 * @example
 * const limiter = createRateLimiter('chat', { max: 10, windowMs: 60_000 });
 *
 * export async function POST(request: NextRequest) {
 *   const limited = limiter.check(request);
 *   if (limited) return limited; // 429 response
 *   // ... handle request
 * }
 */
export function createRateLimiter(name: string, config: Partial<RateLimitConfig> = {}) {
  const max = config.max ?? 5;
  const windowMs = config.windowMs ?? 60_000;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;
  ensureCleanup();

  return {
    /**
     * Check if the request is within the rate limit.
     * Returns null if allowed, or a 429 NextResponse if blocked.
     */
    check(request: NextRequest): NextResponse | null {
      const ip = getClientIp(request);
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now - entry.windowStart > windowMs) {
        // New window
        store.set(ip, { count: 1, windowStart: now });
        return null;
      }

      if (entry.count < max) {
        entry.count++;
        return null;
      }

      // Rate limited
      const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    },
  };
}

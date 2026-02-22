import { NextRequest, NextResponse } from 'next/server';
import { neonAuthMiddleware } from '@neondatabase/auth/next/server';

// Lazy-initialize to avoid build-time errors when NEON_AUTH_BASE_URL isn't set.
let _authMiddleware: ((request: NextRequest) => Promise<NextResponse>) | null = null;

function getAuthMiddleware() {
  if (!_authMiddleware) {
    _authMiddleware = neonAuthMiddleware({ loginUrl: '/login' });
  }
  return _authMiddleware;
}

export function middleware(request: NextRequest) {
  return getAuthMiddleware()(request);
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};

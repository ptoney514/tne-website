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

export async function middleware(request: NextRequest) {
  const response = await getAuthMiddleware()(request);

  // Append ?from=<original path> so LoginPage can redirect back after sign-in
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      const redirectUrl = new URL(location, request.url);
      if (
        redirectUrl.pathname === '/login' &&
        !redirectUrl.searchParams.has('from')
      ) {
        redirectUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl, {
          status: response.status,
          headers: response.headers,
        });
      }
    }
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};

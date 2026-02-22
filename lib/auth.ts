import { createAuthServer } from '@neondatabase/auth/next/server';

// Lazy-initialized server-side Neon Auth client.
// Deferred to avoid build-time errors when NEON_AUTH_BASE_URL isn't set.
let _authServer: ReturnType<typeof createAuthServer> | null = null;

export function getAuthServer() {
  if (!_authServer) {
    _authServer = createAuthServer();
  }
  return _authServer;
}

// Convenience export for callers that prefer `authServer.method()` style.
// Uses a Proxy so `authServer` can be imported at module level but only
// initializes on first method call.
export const authServer = new Proxy({} as ReturnType<typeof createAuthServer>, {
  get(_, prop) {
    return (getAuthServer() as Record<string | symbol, unknown>)[prop];
  },
});

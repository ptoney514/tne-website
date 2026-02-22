import { authApiHandler } from '@neondatabase/auth/next/server';

// Lazy-initialize to avoid build-time errors when NEON_AUTH_BASE_URL isn't set.
type Handler = (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;
let _handler: ReturnType<typeof authApiHandler> | null = null;

function getHandler(): ReturnType<typeof authApiHandler> {
  if (!_handler) {
    _handler = authApiHandler();
  }
  return _handler;
}

export const GET: Handler = (req, ctx) => getHandler().GET(req, ctx);
export const POST: Handler = (req, ctx) => getHandler().POST(req, ctx);
export const PUT: Handler = (req, ctx) => getHandler().PUT(req, ctx);
export const DELETE: Handler = (req, ctx) => getHandler().DELETE(req, ctx);
export const PATCH: Handler = (req, ctx) => getHandler().PATCH(req, ctx);

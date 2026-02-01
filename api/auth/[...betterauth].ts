import { auth } from '../lib/auth';

// Better Auth handler for Vercel Edge/Serverless
// This handles all auth routes: /api/auth/*
export const GET = auth.handler;
export const POST = auth.handler;

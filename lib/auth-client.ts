'use client';

import { createAuthClient } from '@neondatabase/auth/next';

// Client-side auth — routes through /api/auth/[...path] proxy to Neon Auth.
export const authClient = createAuthClient();

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

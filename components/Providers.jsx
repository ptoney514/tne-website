'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import PostHogProvider from '@/components/PostHogProvider';

export default function Providers({ children }) {
  return (
    <PostHogProvider>
      <AuthProvider>{children}</AuthProvider>
    </PostHogProvider>
  );
}

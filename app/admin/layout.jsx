'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SeasonProvider } from '@/contexts/SeasonContext';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SeasonProvider>
        {children}
      </SeasonProvider>
    </ProtectedRoute>
  );
}

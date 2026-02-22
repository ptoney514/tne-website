'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminOnlyLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

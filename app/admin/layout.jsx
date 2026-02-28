'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SeasonProvider } from '@/contexts/SeasonContext';
import { DashboardStatsProvider } from '@/contexts/DashboardStatsContext';
import { AdminSidebarProvider } from '@/contexts/AdminSidebarContext';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'coach']}>
      <SeasonProvider>
        <DashboardStatsProvider>
          <AdminSidebarProvider>
            <AdminShell>
              {children}
            </AdminShell>
          </AdminSidebarProvider>
        </DashboardStatsProvider>
      </SeasonProvider>
    </ProtectedRoute>
  );
}

'use client';

import AdminSidebar from './AdminSidebar';
import AdminTopHeader from './AdminTopHeader';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';

export default function AdminShell({ children }) {
  const { isCollapsed } = useAdminSidebar();

  return (
    <div className="flex h-screen overflow-hidden font-admin">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <AdminTopHeader />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto admin-content bg-admin-content-bg">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

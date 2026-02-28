'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminSidebarContext = createContext(null);

const STORAGE_KEY = 'tne-admin-sidebar-collapsed';

export function AdminSidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setIsCollapsed(true);
    } catch {
      // SSR or localStorage unavailable
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <AdminSidebarContext.Provider
      value={{ isCollapsed, toggleCollapsed, isMobileOpen, openMobile, closeMobile }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider');
  }
  return context;
}

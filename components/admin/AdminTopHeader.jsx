'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { Settings, Menu, Search, LogOut, Home } from 'lucide-react';

function UserDropdown({ profile, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials =
    `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B1F3A] to-admin-red flex items-center justify-center text-white text-xs font-bold hover:shadow-md transition-shadow"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-admin-card-border shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-admin-card-border">
            <p className="text-sm font-medium text-admin-text truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-admin-text-secondary truncate">{profile?.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-admin-text-secondary hover:bg-stone-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Public Site
            </Link>
          </div>
          <div className="border-t border-admin-card-border py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-admin-red hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTopHeader() {
  const router = useRouter();
  const { profile, signOut, loading: authLoading } = useAuth();
  const { openMobile } = useAdminSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdmin = !authLoading && profile?.role === 'admin';

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      // local state already cleared
    }
    window.location.replace('/login');
  };

  return (
    <header
      className="sticky top-0 z-10 bg-white border-b border-admin-card-border"
      style={{ padding: '14px 24px' }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: hamburger (mobile only) */}
        <button
          onClick={openMobile}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-admin-text-secondary hover:bg-stone-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Right: search + settings + avatar */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* Search — desktop: pill input, mobile: icon toggle */}
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm rounded-full border border-admin-card-border bg-admin-content-bg text-admin-text placeholder:text-admin-text-muted focus:outline-none focus:border-admin-red/40 focus:ring-1 focus:ring-admin-red/20 w-48 transition-all"
              />
            </div>
          </div>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-lg text-admin-text-secondary hover:bg-stone-100 transition-colors"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Settings gear (admin only) */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/settings')}
              className="p-2 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-stone-100 transition-colors"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
          )}

          {/* User avatar dropdown */}
          <UserDropdown profile={profile} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Mobile search expanded */}
      {searchOpen && (
        <div className="sm:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-admin-card-border bg-admin-content-bg text-admin-text placeholder:text-admin-text-muted focus:outline-none focus:border-admin-red/40"
            />
          </div>
        </div>
      )}
    </header>
  );
}

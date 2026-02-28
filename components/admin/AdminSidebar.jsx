'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSeason } from '@/contexts/SeasonContext';
import { useDashboardStats } from '@/contexts/DashboardStatsContext';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';

// Navigation structure with unicode icons per spec
const NAV_GROUPS = [
  {
    id: 'main',
    label: null, // No header for dashboard
    items: [
      { href: '/admin', label: 'Dashboard', icon: '◫', exact: true },
    ],
  },
  {
    id: 'roster',
    label: 'ROSTER MANAGEMENT',
    items: [
      { href: '/admin/teams', label: 'Teams', icon: '⊞' },
      { href: '/admin/players', label: 'Players', icon: '◉', badgeKey: 'players' },
      { href: '/admin/coaches', label: 'Coaches', icon: '◈', adminOnly: true },
    ],
  },
  {
    id: 'events',
    label: 'EVENTS & SCHEDULING',
    items: [
      { href: '/admin/tryouts', label: 'Tryouts', icon: '▷', adminOnly: true, badgeKey: 'tryoutSignups' },
      { href: '/admin/tournaments', label: 'Tournaments', icon: '◆' },
      { href: '/admin/games', label: 'Games', icon: '▣' },
      { href: '/admin/practices', label: 'Practices', icon: '▣' },
      { href: '/admin/seasons', label: 'Seasons', icon: '↻', adminOnly: true },
    ],
  },
  {
    id: 'enrollment',
    label: 'ENROLLMENT',
    items: [
      { href: '/admin/registrations', label: 'Registrations', icon: '☰', badgeKey: 'pendingRegistrations' },
      { href: '/admin/venues', label: 'Venues', icon: '⌂', adminOnly: true },
      { href: '/admin/hotels', label: 'Hotels', icon: '$', adminOnly: true },
    ],
  },
];

function SidebarNavItem({ item, isActive, isCollapsed, badge, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={`
        relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all
        ${isActive
          ? 'bg-[rgba(198,40,40,0.14)] text-white border-l-[3px] border-admin-red pl-[13px]'
          : 'text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
        }
        ${isCollapsed ? 'justify-center px-0 mx-1' : ''}
      `}
    >
      <span className={`text-base leading-none shrink-0 ${isCollapsed ? 'text-lg' : ''}`}>
        {item.icon}
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
      {badge > 0 && (
        isCollapsed ? (
          <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-admin-red" />
        ) : (
          <span className="ml-auto min-w-[20px] h-[20px] px-1.5 rounded-full bg-admin-red text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )
      )}
    </Link>
  );
}

function NavGroup({ group, isCollapsed, isAdmin, stats, pathname, onItemClick }) {
  const [isOpen, setIsOpen] = useState(true);

  const visibleItems = group.items.filter(
    (item) => !item.adminOnly || isAdmin
  );

  if (visibleItems.length === 0) return null;

  const isItemActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const getBadge = (item) => {
    if (!item.badgeKey || !stats) return 0;
    return stats[item.badgeKey] || 0;
  };

  return (
    <div className="mb-1">
      {group.label && !isCollapsed && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 pt-4 pb-2"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.25)]">
            {group.label}
          </span>
          <span
            className={`text-[rgba(255,255,255,0.25)] text-[10px] transition-transform duration-200 ${
              isOpen ? '' : '-rotate-90'
            }`}
          >
            ▾
          </span>
        </button>
      )}
      {isCollapsed && group.label && (
        <div className="mx-3 my-3 border-t border-[rgba(255,255,255,0.06)]" />
      )}
      {(isOpen || isCollapsed) && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={isItemActive(item)}
              isCollapsed={isCollapsed}
              badge={getBadge(item)}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SeasonSelector({ isCollapsed }) {
  const { seasons, selectedSeasonId, selectedSeason, setSelectedSeasonId } = useSeason();
  const [isOpen, setIsOpen] = useState(false);

  if (isCollapsed) {
    return (
      <div className="mx-2 mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={selectedSeason?.name || 'Season'}
          className="w-full flex items-center justify-center p-2.5 rounded-lg bg-[rgba(198,40,40,0.1)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(198,40,40,0.18)] transition-colors"
        >
          <span className="text-base">📅</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[rgba(198,40,40,0.1)] hover:bg-[rgba(198,40,40,0.18)] transition-colors"
      >
        <span className="text-base">📅</span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[rgba(255,255,255,0.35)]">
            SEASON
          </p>
          <p className="text-sm font-medium text-white truncate">
            {selectedSeason?.name || 'Select Season'}
          </p>
        </div>
        <span className="text-[rgba(255,255,255,0.3)] text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 rounded-lg bg-[#26262B] border border-[rgba(255,255,255,0.08)] shadow-xl overflow-hidden z-50">
          <div className="py-1 max-h-48 overflow-y-auto">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => {
                  setSelectedSeasonId(season.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                  season.id === selectedSeasonId
                    ? 'bg-[rgba(198,40,40,0.14)] text-white font-medium'
                    : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                }`}
              >
                <span>{season.name}</span>
                {season.is_active && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-admin-success/20 text-green-400">
                    ACTIVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, loading: authLoading } = useAuth();
  const { stats } = useDashboardStats();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useAdminSidebar();
  const isAdmin = !authLoading && profile?.role === 'admin';

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-admin-sidebar">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="flex bg-gradient-to-tr from-[#8B1F3A] to-[#C62828] w-9 h-9 rounded-xl shadow-sm items-center justify-center shrink-0">
          <span className="font-bebas font-bold text-white text-[11px] leading-none pt-0.5">
            TNE
          </span>
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">TNE Basketball</p>
            <p className="text-[10px] text-[rgba(255,255,255,0.35)] leading-tight">Admin Console</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[rgba(255,255,255,0.06)]" />

      {/* Season Selector */}
      <div className="pt-3">
        <SeasonSelector isCollapsed={isCollapsed} />
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[rgba(255,255,255,0.06)]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 hide-scroll">
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            isCollapsed={isCollapsed}
            isAdmin={isAdmin}
            stats={stats}
            pathname={pathname}
            onItemClick={isMobileOpen ? closeMobile : undefined}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[rgba(255,255,255,0.06)]" />

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center gap-3 px-4 py-4 text-sm text-[rgba(255,255,255,0.35)] hover:text-white transition-colors"
        >
          <span className="text-base">{isCollapsed ? '▶' : '◀'}</span>
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:block shrink-0 h-screen sticky top-0 admin-sidebar-transition overflow-hidden ${
          isCollapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-[4px]"
          onClick={closeMobile}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-screen w-[280px] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

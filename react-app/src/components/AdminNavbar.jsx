import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSeason } from '../contexts/SeasonContext';
import { useDashboardStats } from '../hooks/useDashboardStats';

// Icons as inline SVGs
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Badge component for notification counts
function Badge({ count }) {
  if (!count || count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-tne-red text-white text-[10px] font-bold flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Season Dropdown
function SeasonDropdown() {
  const { seasons, selectedSeasonId, selectedSeason, setSelectedSeasonId } = useSeason();
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50 transition-colors text-sm"
      >
        <CalendarIcon />
        <span className="max-w-[120px] truncate">{selectedSeason?.name || 'Select Season'}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-lg overflow-hidden z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => {
                  setSelectedSeasonId(season.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 transition-colors flex items-center justify-between ${
                  season.id === selectedSeasonId ? 'bg-stone-50 text-tne-red font-medium' : 'text-stone-700'
                }`}
              >
                <span>{season.name}</span>
                {season.is_active && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
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

// User Avatar Dropdown
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

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-white text-xs font-bold hover:shadow-md transition-shadow"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-stone-200 shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-900 truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-stone-500 truncate">{profile?.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <HomeIcon />
              Public Site
            </Link>
          </div>
          <div className="border-t border-stone-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOutIcon />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Nav Link with optional badge
function AdminNavLink({ to, children, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-tne-red text-white'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }`
      }
    >
      {children}
      <Badge count={badge} />
    </NavLink>
  );
}

export default function AdminNavbar() {
  const { profile, signOut } = useAuth();
  const { stats } = useDashboardStats();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-6">
            {/* Brand */}
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="flex bg-gradient-to-tr from-tne-maroon to-tne-red w-9 h-9 rounded-xl shadow-sm items-center justify-center">
                <span className="font-bebas font-bold text-white text-[11px] leading-none pt-0.5">
                  TNE
                </span>
              </div>
              <span className="text-base font-semibold text-stone-900">
                TNE Admin
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <AdminNavLink to="/admin/teams">Teams</AdminNavLink>
              <AdminNavLink to="/admin/players">Players</AdminNavLink>
              <AdminNavLink to="/admin/coaches">Coaches</AdminNavLink>
              <AdminNavLink to="/admin/tryouts" badge={stats.tryoutSignups}>
                Tryouts
              </AdminNavLink>
              <AdminNavLink to="/admin/registrations" badge={stats.pendingRegistrations}>
                Registrations
              </AdminNavLink>
              <AdminNavLink to="/admin/tournaments">Tournaments</AdminNavLink>
            </div>
          </div>

          {/* Right: Season + Settings + User */}
          <div className="hidden md:flex items-center gap-3">
            <SeasonDropdown />
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <SettingsIcon />
            </button>
            <UserDropdown profile={profile} onSignOut={handleSignOut} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/admin/teams"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Teams
            </NavLink>
            <NavLink
              to="/admin/players"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Players
            </NavLink>
            <NavLink
              to="/admin/coaches"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Coaches
            </NavLink>
            <NavLink
              to="/admin/tryouts"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Tryouts
              {stats.tryoutSignups > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-tne-red text-white text-xs font-bold">
                  {stats.tryoutSignups}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/admin/registrations"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Registrations
              {stats.pendingRegistrations > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-tne-red text-white text-xs font-bold">
                  {stats.pendingRegistrations}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/admin/tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Tournaments
            </NavLink>
            <NavLink
              to="/admin/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-tne-red text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              Settings
            </NavLink>
          </div>
          <div className="px-4 py-3 border-t border-stone-100">
            <SeasonDropdown />
          </div>
          <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-900">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-stone-500">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

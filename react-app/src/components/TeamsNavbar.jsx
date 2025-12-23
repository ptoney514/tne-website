import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';

function UserDropdown({ profile, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.first_name || 'User';
  const initials = (profile?.first_name?.[0] || 'U').toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-[10px] font-bebas">
          {initials}
        </div>
        <span className="text-xs font-medium max-w-[100px] truncate">{displayName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium truncate">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs text-white/50 truncate">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/10 text-white/60">
              {profile?.role}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-white/10 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

export default function TeamsNavbar() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky supports-[backdrop-filter]:bg-black/80 bg-black/90 w-full z-50 border-white/5 border-b top-0 backdrop-blur-md">
      <div className="sm:px-6 flex h-14 max-w-6xl mx-auto px-4 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img
            src={tneLogoWhite}
            alt="TNE United Express"
            className="h-12 w-12 object-contain"
          />
          <span className="text-sm font-medium tracking-tight text-white/90 hidden sm:inline">
            TNE United Express
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-[11px] font-medium font-mono uppercase tracking-wider">
          <Link
            to="/"
            className="hover:text-white transition-colors text-stone-300"
          >
            Home
          </Link>
          <Link to="/teams" className="text-white">
            Teams
          </Link>
          <Link
            to="/schedule"
            className="hover:text-white transition-colors text-stone-300"
          >
            Schedule
          </Link>
          <Link
            to="/tryouts"
            className="text-stone-300 hover:text-white transition-colors"
          >
            Tryouts
          </Link>
          <Link
            to="/about"
            className="text-stone-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-stone-300 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserDropdown profile={profile} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-[11px] font-medium font-mono uppercase tracking-wider rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-[11px] font-medium font-mono uppercase tracking-wider rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

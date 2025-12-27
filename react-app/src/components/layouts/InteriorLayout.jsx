import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, User, ChevronDown, Settings, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRegistrationStatus } from '../../hooks/useRegistrationStatus';
import tneLogoWhite from '../../assets/tne-logo-white-transparent.png';
import { navLinks } from '../../constants/navigation';
import HomeFooter from '../HomeFooter';

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

  const displayName = profile?.first_name || 'User';
  const initials = (profile?.first_name?.[0] || 'U').toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center text-xs font-bebas">
          {initials}
        </div>
        <span className="text-sm font-medium max-w-[100px] truncate hidden sm:inline">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium truncate">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs text-white/50 truncate">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/10 text-white/60">
              {profile?.role}
            </span>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-white/10 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const { isTryoutsOpen, isRegistrationOpen } = useRegistrationStatus();

  if (!isOpen) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-white/10 shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-sm font-semibold text-white uppercase tracking-wider">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`block px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors ${
                isActive(link.path) ? 'bg-tne-red/20 text-tne-red' : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-3">
          {isTryoutsOpen ? (
            <Link
              to="/tryouts"
              onClick={onClose}
              className="block w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-lg bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
            >
              Tryouts
            </Link>
          ) : isRegistrationOpen ? (
            <Link
              to="/register"
              onClick={onClose}
              className="block w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-lg bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
            >
              Register
            </Link>
          ) : null}
          <Link
            to="/login"
            onClick={onClose}
            className="block w-full py-3 text-center text-sm font-medium uppercase tracking-wider rounded-lg border border-white/20 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

function InteriorNavbar() {
  const { user, profile, signOut } = useAuth();
  const { isTryoutsOpen, isRegistrationOpen } = useRegistrationStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky supports-[backdrop-filter]:bg-black/80 bg-black/90 w-full z-50 border-white/5 border-b top-0 backdrop-blur-md">
        <div className="sm:px-6 flex h-20 max-w-7xl mx-auto px-4 items-center justify-between relative">
          {/* Left: Logo + Brand Text */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity z-10">
            <img
              src={tneLogoWhite}
              alt="TNE United Express"
              className="h-[88px] w-[88px] object-contain"
            />
            <span className="hidden lg:block text-white font-bebas text-xl tracking-wide">
              TNE <span className="text-tne-red">United</span> Express
            </span>
          </Link>

          {/* Nav Links - Centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[13px] font-semibold font-mono uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
                  isActive(link.path)
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 z-10">
            {user ? (
              <UserDropdown profile={profile} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-semibold font-mono uppercase tracking-wider px-5 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
                >
                  Login
                </Link>
                {isTryoutsOpen ? (
                  <Link
                    to="/tryouts"
                    className="text-[13px] font-semibold font-mono uppercase tracking-wider px-5 py-2 rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/25"
                  >
                    Tryouts
                  </Link>
                ) : isRegistrationOpen ? (
                  <Link
                    to="/register"
                    className="text-[13px] font-semibold font-mono uppercase tracking-wider px-5 py-2 rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/25"
                  >
                    Register
                  </Link>
                ) : null}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

export default function InteriorLayout({ children }) {
  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">
      <InteriorNavbar />
      {children}
      <HomeFooter />
    </div>
  );
}

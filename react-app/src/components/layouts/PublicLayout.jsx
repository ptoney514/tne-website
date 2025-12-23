import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import MobileDrawer from '../MobileDrawer';
import tneLogoWhite from '../../assets/tne-logo-white-transparent.png';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/teams', label: 'Teams' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/tryouts', label: 'Tryouts' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <>
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

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-stone-300 hover:text-white transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse" />
              ) : user ? (
                <Link
                  to="/profile"
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
                >
                  My Account
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/tryouts"
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/45">
        <div className="flex items-center gap-3">
          <img
            src={tneLogoWhite}
            alt="TNE"
            className="h-12 w-12 object-contain"
          />
          <span className="font-semibold tracking-tight text-white text-base">
            UNITED <span className="text-white/40">EXPRESS</span>
          </span>
          <span className="hidden sm:inline text-white/30">&middot;</span>
          <span className="hidden sm:inline text-white/40">
            &copy; 2025 TNE United Express. All rights reserved.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/60">
              Registration Open
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/teamnebraskaexpressunited"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/TNEBasketball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';
import MobileDrawer from './MobileDrawer';

export default function HomeNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="-translate-x-1/2 z-30 w-[95%] max-w-6xl absolute top-8 left-1/2">
        {/* Floating Center Logo */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 hover:scale-105 transition-transform duration-200"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-black/40 rounded-full blur-xl scale-90" />
            <img
              src={tneLogoWhite}
              alt="TNE United Express"
              className="relative h-[72px] w-[72px] object-contain drop-shadow-2xl"
            />
          </div>
        </Link>

        <div className="glass-nav flex max-w-4xl border-white/10 border rounded-full mx-auto px-3 py-1.5 shadow-2xl items-center justify-between">
          {/* Left Links */}
          <div className="hidden md:flex items-center gap-1 pl-2">
            <Link
              to="/teams"
              className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5"
            >
              Teams
            </Link>
            <Link
              to="/schedule"
              className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5"
            >
              Schedule
            </Link>
            <Link
              to="/tryouts"
              className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5"
            >
              Tryouts
            </Link>
            <Link
              to="/about"
              className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5"
            >
              About
            </Link>
          </div>

          {/* Center Spacer for Logo */}
          <div className="flex-1 flex justify-center items-center">
            <div className="w-20" />
          </div>

          {/* Right Links */}
          <div className="hidden md:flex items-center gap-1 pr-2">
            <Link
              to="/login"
              className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              to="/tryouts"
              className="text-[11px] uppercase transition-all font-medium text-white tracking-wider font-mono bg-tne-red hover:bg-tne-red-dark rounded-full px-4 py-1.5"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

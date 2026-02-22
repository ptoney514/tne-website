import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import tneLogoWhite from '@/assets/tne-logo-white-transparent.png';
import { navLinks } from '@/constants/navigation';
import HomeFooter from '../HomeFooter';

function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname();
  const { isTryoutsOpen, isRegistrationOpen } = useRegistrationStatus();

  if (!isOpen) return null;

  const isActive = (path) => pathname === path;

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
              href={link.path}
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
              href="/tryouts"
              onClick={onClose}
              className="block w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-lg bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
            >
              Tryouts
            </Link>
          ) : isRegistrationOpen ? (
            <Link
              href="/register"
              onClick={onClose}
              className="block w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-lg bg-tne-red text-white hover:bg-tne-red-dark transition-colors"
            >
              Register
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InteriorNavbar() {
  const { isTryoutsOpen, isRegistrationOpen } = useRegistrationStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav className="sticky supports-[backdrop-filter]:bg-black/80 bg-black/90 w-full z-50 border-white/5 border-b top-0 backdrop-blur-md">
        <div className="sm:px-6 flex h-20 max-w-7xl mx-auto px-4 items-center justify-between relative">
          {/* Left: Logo + Brand Text */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity z-10">
            <img
              src={tneLogoWhite.src}
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
                href={link.path}
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

          {/* Right: CTA Buttons */}
          <div className="hidden md:flex items-center gap-3 z-10">
            {isTryoutsOpen ? (
              <Link
                href="/tryouts"
                className="text-[13px] font-semibold font-mono uppercase tracking-wider px-5 py-2 rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/25"
              >
                Tryouts
              </Link>
            ) : isRegistrationOpen ? (
              <Link
                href="/register"
                className="text-[13px] font-semibold font-mono uppercase tracking-wider px-5 py-2 rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/25"
              >
                Register
              </Link>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
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

export default function InteriorLayout({ children, hideStatusBadge = false }) {
  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">
      <InteriorNavbar />
      {children}
      <HomeFooter hideStatusBadge={hideStatusBadge} />
    </div>
  );
}

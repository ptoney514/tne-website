import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import tneLogoWhite from '@/assets/tne-logo-white-transparent.png';
import MobileDrawer from './MobileDrawer';

export default function HomeNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="-translate-x-1/2 z-30 w-[95%] max-w-6xl absolute top-8 left-1/2">
        {/* Floating Center Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 hover:scale-105 transition-transform duration-200"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-black/40 rounded-full blur-xl scale-90" />
            <Image
              src={tneLogoWhite}
              alt="TNE United Express"
              width={88}
              height={88}
              className="relative object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </Link>

        <div className="glass-nav flex max-w-4xl border-white/10 border rounded-full mx-auto px-4 py-2 shadow-2xl items-center justify-between">
          {/* Left Links - Teams, Tournaments & Tryouts */}
          <div className="hidden md:flex items-center gap-2 pl-2">
            <Link
              href="/teams"
              className="text-[13px] hover:text-white uppercase hover:bg-white/10 transition-all font-semibold text-white/90 tracking-wider font-mono rounded-full px-4 py-2"
            >
              Teams
            </Link>
            <Link
              href="/schedule"
              className="text-[13px] hover:text-white uppercase hover:bg-white/10 transition-all font-semibold text-white/90 tracking-wider font-mono rounded-full px-4 py-2"
            >
              Tournaments
            </Link>
            <Link
              href="/tryouts"
              className="text-[13px] hover:text-white uppercase hover:bg-white/10 transition-all font-semibold text-white/90 tracking-wider font-mono rounded-full px-4 py-2"
            >
              Tryouts
            </Link>
          </div>

          {/* Center Spacer for Logo */}
          <div className="flex-1 flex justify-center items-center">
            <div className="w-28" />
          </div>

          {/* Right Links - Payments, About & Register */}
          <div className="hidden md:flex items-center gap-2 pr-2">
            <Link
              href="/payments"
              className="text-[13px] hover:text-white uppercase hover:bg-white/10 transition-all font-semibold text-white/90 tracking-wider font-mono rounded-full px-4 py-2"
            >
              Payments
            </Link>
            <Link
              href="/about"
              className="text-[13px] hover:text-white uppercase hover:bg-white/10 transition-all font-semibold text-white/90 tracking-wider font-mono rounded-full px-4 py-2"
            >
              About
            </Link>
            <Link
              href="/register"
              className="text-[13px] uppercase transition-all font-semibold text-white tracking-wider font-mono bg-tne-red hover:bg-tne-red-dark rounded-full px-5 py-2 shadow-lg shadow-tne-red/25"
            >
              Register Now
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
        showPayLink={true}
      />
    </>
  );
}

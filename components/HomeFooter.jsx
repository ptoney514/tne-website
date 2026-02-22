import Link from 'next/link';
import { Instagram, Youtube, Twitter, LogIn, Calendar } from 'lucide-react';
import tneLogoWhite from '@/assets/tne-logo-white-transparent.png';

export default function HomeFooter({ hideStatusBadge = false }) {
  return (
    <footer className="bg-[#050505] w-full border-t border-white/10 pt-20 pb-10 relative overflow-hidden text-[#8A8F98]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link href="/" className="inline-block mb-6">
              <img
                src={tneLogoWhite.src}
                alt="TNE United Express"
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="text-sm leading-7 text-[#8A8F98] max-w-xs mb-8">
              Developing elite players and building character in Omaha's youth. The road to the next level starts here.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs text-white uppercase tracking-widest mb-6">Program</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/teams" className="hover:text-white transition-colors">Teams</Link></li>
              <li><Link href="/schedule" className="hover:text-white transition-colors">Tournaments</Link></li>
              <li><Link href="/skills-academy" className="hover:text-white transition-colors">Skills Academy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-white uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><a href="../../src/pages/merch.html" className="hover:text-white transition-colors">Merch Store</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-white uppercase tracking-widest mb-6">Account</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/tryouts" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tryout Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-white/30 font-mono">
            &copy; 2025 TNE United Express Basketball. All rights reserved.
          </div>
          {!hideStatusBadge && (
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">
                Registration Open
              </span>
            </div>
          )}
        </div>

        <div className="absolute -bottom-12 -right-10 pointer-events-none select-none opacity-[0.03] overflow-hidden">
          <span className="text-[180px] font-bebas font-bold leading-none tracking-tighter text-white whitespace-nowrap uppercase">
            United
          </span>
        </div>
      </div>
    </footer>
  );
}

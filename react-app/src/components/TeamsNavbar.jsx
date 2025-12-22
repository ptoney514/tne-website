import { Menu } from 'lucide-react';

export default function TeamsNavbar() {
  return (
    <nav className="sticky supports-[backdrop-filter]:bg-black/80 bg-black/90 w-full z-50 border-white/5 border-b top-0 backdrop-blur-md">
      <div className="sm:px-6 flex h-14 max-w-6xl mx-auto px-4 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex bg-gradient-to-tr from-tne-maroon to-tne-red w-7 h-7 rounded-full shadow-[0_0_24px_rgba(227,24,55,0.5)] items-center justify-center">
            <span className="font-bebas font-bold text-white text-[10px] leading-none pt-0.5">TNE</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-white/90">TNE United Express</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em]">
          <a href="/" className="hover:text-white transition-colors text-stone-300">Home</a>
          <a href="/teams" className="text-white">Teams</a>
          <a href="#" className="hover:text-white transition-colors text-stone-300">Schedule</a>
          <a href="#" className="text-stone-300 hover:text-white transition-colors">Tryouts</a>
          <a href="#" className="text-stone-300 hover:text-white transition-colors">About</a>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <a href="#" className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors">
              Login
            </a>
            <a href="#" className="px-3 py-1.5 text-xs font-medium rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors">
              Register
            </a>
          </div>
          <button className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

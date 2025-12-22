import { Menu } from 'lucide-react';

export default function HomeNavbar() {
  return (
    <nav className="-translate-x-1/2 z-30 w-[95%] max-w-6xl absolute top-6 left-1/2">
      <div className="glass-nav flex max-w-4xl border-white/10 border rounded-full mx-auto p-2 shadow-2xl items-center justify-between">
        {/* Left Links */}
        <div className="hidden md:flex items-center gap-1 px-4">
          <a href="#" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Teams</a>
          <a href="#" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Schedule</a>
        </div>

        {/* Center Brand */}
        <div className="flex-1 text-center">
          <span className="uppercase text-lg font-semibold text-white tracking-[0.12em] font-bebas px-6">
            TNE <span className="text-tne-red">UNITED EXPRESS</span>
          </span>
        </div>

        {/* Right Links */}
        <div className="hidden md:flex items-center gap-1 px-4">
          <a href="#" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Login</a>
          <a href="#" className="text-[11px] uppercase transition-all font-medium text-white tracking-wider font-mono bg-tne-red hover:bg-tne-red-dark rounded-full px-4 py-1.5">
            Register
          </a>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden p-2 text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

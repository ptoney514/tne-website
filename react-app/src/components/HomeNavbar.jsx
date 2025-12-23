import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';

export default function HomeNavbar() {
  return (
    <nav className="-translate-x-1/2 z-30 w-[95%] max-w-6xl absolute top-6 left-1/2">
      <div className="glass-nav flex max-w-4xl border-white/10 border rounded-full mx-auto p-2 shadow-2xl items-center justify-between">
        {/* Left Links */}
        <div className="hidden md:flex items-center gap-1 px-4">
          <Link to="/teams" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Teams</Link>
          <Link to="/schedule" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Schedule</Link>
        </div>

        {/* Center Brand */}
        <Link to="/" className="flex-1 flex justify-center">
          <img
            src={tneLogoWhite}
            alt="TNE United Express"
            className="h-10 w-10 object-contain"
          />
        </Link>

        {/* Right Links */}
        <div className="hidden md:flex items-center gap-1 px-4">
          <Link to="/login" className="text-[11px] hover:text-white uppercase hover:bg-white/10 transition-all font-medium text-white/80 tracking-wider font-mono rounded-full px-3 py-1.5">Login</Link>
          <Link to="/tryouts" className="text-[11px] uppercase transition-all font-medium text-white tracking-wider font-mono bg-tne-red hover:bg-tne-red-dark rounded-full px-4 py-1.5">
            Register
          </Link>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden p-2 text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

import { Instagram, Twitter } from 'lucide-react';

export default function TeamsFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-8 sm:py-10 mt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/45">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center">
            <span className="font-bebas font-semibold text-white text-[0.5rem] leading-none pt-[1px]">TNE</span>
          </div>
          <span className="font-semibold tracking-tight text-white text-base">
            UNITED <span className="text-white/40">EXPRESS</span>
          </span>
          <span className="hidden sm:inline text-white/30">&middot;</span>
          <span className="hidden sm:inline text-white/40">&copy; 2025 TNE United Express. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/60">
              Registration Open
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/tneunitedexpress" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com/TNEBasketball" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

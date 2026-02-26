import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col antialiased selection:bg-tne-red selection:text-white">
      {/* Simplified Static Navbar */}
      <nav className="w-full border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center">
              <span className="font-bebas font-semibold text-white text-xs leading-none pt-[1px]">TNE</span>
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">
              UNITED <span className="text-white/40">EXPRESS</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono text-white/50 hover:text-white transition-colors uppercase tracking-widest"
          >
            Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Basketball SVG */}
          <div className="flex justify-center mb-10" data-testid="basketball-visual">
            <div className="relative">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-tne-red opacity-80"
              >
                {/* Ball outline */}
                <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="2.5" />
                {/* Horizontal seam */}
                <path d="M4 60 H116" stroke="currentColor" strokeWidth="1.5" />
                {/* Vertical seam */}
                <path d="M60 4 V116" stroke="currentColor" strokeWidth="1.5" />
                {/* Left curve */}
                <path
                  d="M44 5 C30 30, 30 90, 44 115"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Right curve */}
                <path
                  d="M76 5 C90 30, 90 90, 76 115"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-tne-red/10 rounded-full blur-2xl -z-10 scale-150" />
            </div>
          </div>

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tne-red/30 bg-tne-red/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-tne-red" />
            <span className="text-[10px] font-mono font-medium text-tne-red uppercase tracking-widest">
              Out of Bounds
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-bebas text-6xl sm:text-7xl text-white uppercase tracking-tight leading-none mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-white/50 text-sm sm:text-base font-mono leading-relaxed mb-10 max-w-sm mx-auto">
            Looks like this play was called out of bounds. Let&apos;s get you back in the game.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-3 bg-tne-red text-white text-sm font-semibold uppercase tracking-wider hover:bg-tne-red-dark transition-all"
            >
              Back to Home Court
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-white/20 text-white text-sm font-semibold uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-mono text-white/20">
            &copy; 2025 TNE United Express Basketball
          </span>
        </div>
      </div>
    </div>
  );
}

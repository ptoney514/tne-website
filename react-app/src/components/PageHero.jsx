export default function PageHero({
  title,
  subtitle,
  backgroundImage,
}) {
  return (
    <header className="relative border-b border-white/5 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />

      {/* Background image if provided */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

      <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
        <div className="flex flex-col gap-6 animate-enter">
          {/* Season Badge */}
          <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
              2025-2026 Fall/Winter Season
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

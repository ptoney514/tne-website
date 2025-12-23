import { Link } from 'react-router-dom';

export default function PageHero({
  title,
  subtitle,
  badgeText,
  breadcrumb,
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
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="inline-flex items-center gap-2">
              <Link
                to="/"
                className="text-[0.7rem] font-mono text-white/50 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-[0.7rem] font-mono text-tne-red uppercase tracking-[0.2em]">
                {breadcrumb}
              </span>
            </div>
          )}

          {/* Badge */}
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-tne-red/30 bg-tne-red/10 px-3 py-1 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-tne-red shadow-[0_0_12px_rgba(227,24,55,0.9)]" />
              <span className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-red-300">
                {badgeText}
              </span>
            </div>
          )}

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

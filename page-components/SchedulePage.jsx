import InteriorLayout from '@/components/layouts/InteriorLayout';
import SeasonBadge from '@/components/SeasonBadge';
import TournamentsTab from '@/components/schedule/TournamentsTab';

export default function SchedulePage() {
  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 mix-blend-screen">
          <img
            src="https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <SeasonBadge />

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Tournaments
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                View upcoming tournaments for TNE teams. Find dates, locations, and participating teams.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <TournamentsTab />
        </section>
      </main>
    </InteriorLayout>
  );
}

import { Link } from 'react-router-dom';
import { CalendarDays, Search, Trophy, ChevronRight } from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';

// Team types determine logo styling
const TEAM_TYPES = {
  EXPRESS: 'Boys Express',
  TNE: 'Boys TNE',
  GIRLS: 'Girls Program'
};

const teamData = [
  {
    id: 'foster-4th',
    grade: '4th Grade',
    name: 'Express United',
    coach: 'Coach Foster',
    type: TEAM_TYPES.EXPRESS
  },
  {
    id: 'grisby-evans-4th',
    grade: '4th Grade',
    name: 'Express United',
    coach: 'Coaches Grisby & Evans',
    type: TEAM_TYPES.EXPRESS
  },
  {
    id: 'perry-5th',
    grade: '5th Grade',
    name: 'Express United',
    coach: 'Coach Perry',
    type: TEAM_TYPES.EXPRESS
  },
  {
    id: 'todd-6th',
    grade: '6th Grade',
    name: 'Express United',
    coach: 'Coach Todd',
    type: TEAM_TYPES.EXPRESS
  },
  {
    id: 'mitchell-7th',
    grade: '7th Grade',
    name: 'TNE United',
    coach: 'Coach Mitchell',
    type: TEAM_TYPES.TNE
  },
  {
    id: 'johnson-8th',
    grade: '8th Grade',
    name: 'TNE United',
    coach: 'Coach Johnson',
    type: TEAM_TYPES.TNE
  }
];

function TeamCard({ team, index }) {
  // Different logo styling based on team type
  const isTNE = team.type === TEAM_TYPES.TNE;
  const isGirls = team.type === TEAM_TYPES.GIRLS;

  return (
    <Link
      to={`/teams/${team.id}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="rounded-lg bg-white border border-neutral-200 overflow-hidden transition-all duration-300 hover:border-neutral-300 hover:shadow-lg hover:-translate-y-1">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-5 py-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Grade Badge */}
            <div className="inline-flex items-center rounded-sm bg-white/10 border border-white/10 px-2 py-0.5 mb-2">
              <span className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-white/80">
                {team.grade}
              </span>
            </div>

            {/* Team Name */}
            <h2 className="text-xl font-semibold tracking-tight truncate group-hover:text-tne-red transition-colors">
              {team.name}
            </h2>

            {/* Coach */}
            <p className="text-sm text-white/50 truncate mt-0.5">
              {team.coach}
            </p>
          </div>

          {/* Logo */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
            isTNE ? 'bg-tne-red/20 border border-tne-red/30' : isGirls ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-white/10 border border-white/10'
          }`}>
            <img
              src={tneLogoWhite}
              alt="TNE"
              className={`w-8 h-8 object-contain ${
                isTNE ? 'brightness-100' : isGirls ? 'brightness-100' : 'opacity-60'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          {/* Team Type Badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-mono uppercase tracking-wider ${
            isTNE
              ? 'bg-tne-red/10 text-tne-red border border-tne-red/20'
              : isGirls
                ? 'bg-pink-500/10 text-pink-600 border border-pink-500/20'
                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
          }`}>
            {team.type}
          </span>

          {/* View Link */}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-tne-red transition-colors">
            View Team
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function TeamsPage() {
  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-20 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
                2025-2026 Fall/Winter Season
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Teams
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Select a team to view roster, schedule, and coach information.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

          {/* Controls Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button className="px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium whitespace-nowrap transition-colors">
                All Teams
              </button>
              <button className="px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs text-neutral-600 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Boys Express
              </button>
              <button className="px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs text-neutral-600 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Boys TNE
              </button>
              <button className="px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs text-neutral-600 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Girls Program
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                className="block w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/30 focus:border-tne-red/50 transition-colors"
              />
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamData.map((team, index) => (
              <TeamCard key={team.id} team={team} index={index} />
            ))}
          </div>

          {/* OSA League Info */}
          <div className="rounded-lg bg-white border border-neutral-200 overflow-hidden">
            <div className="bg-neutral-900 text-white px-6 py-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-white/10 border border-white/10">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">OSA League Games</h2>
                <p className="text-sm text-white/60">Omaha Sports Academy Winter League</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <span className="block text-[0.65rem] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Season
                  </span>
                  <span className="font-medium text-neutral-900">Jan 3 – Mar 1, 2026</span>
                </div>
                <div>
                  <span className="block text-[0.65rem] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Game Days
                  </span>
                  <span className="font-medium text-neutral-900">Saturdays & Sundays</span>
                </div>
              </div>

              <p className="text-sm text-neutral-500 leading-relaxed">
                League schedules are managed through TourneyMachine. Check below for game times, locations, and opponents.
              </p>

              <a
                href="https://tourneymachine.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                View on TourneyMachine
              </a>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

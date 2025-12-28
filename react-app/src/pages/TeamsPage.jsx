import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Trophy, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';
import { usePublicTeams } from '../hooks/usePublicTeams';

// Team type display labels
const TEAM_TYPES = {
  EXPRESS: 'Boys Express',
  TNE: 'Boys TNE',
  GIRLS: 'Girls Program'
};

// Derive team type from tier + gender
function getTeamType(team) {
  if (team.gender === 'female') return TEAM_TYPES.GIRLS;
  if (team.tier === 'tne') return TEAM_TYPES.TNE;
  return TEAM_TYPES.EXPRESS;
}

// Format coach name for display
function formatCoachName(coach) {
  if (!coach) return 'Coach TBD';
  if (coach.first_name === 'Coach') {
    return `Coach ${coach.last_name}`;
  }
  return `Coach ${coach.last_name}`;
}

// Transform Supabase team data for display
function transformTeam(team) {
  return {
    id: team.id,
    grade: team.grade_level.includes('th') ? `${team.grade_level} Grade` : team.grade_level,
    name: team.name,
    coach: formatCoachName(team.head_coach),
    type: getTeamType(team),
    playerCount: team.player_count || 0
  };
}

function TeamCard({ team, index }) {
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

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-tne-red animate-spin mb-4" />
      <p className="text-neutral-500">Loading teams...</p>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <p className="text-neutral-700 font-medium mb-2">Failed to load teams</p>
      <p className="text-neutral-500 text-sm">{error}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-neutral-500">No teams found matching your criteria.</p>
    </div>
  );
}

export default function TeamsPage() {
  const { teams, loading, error } = usePublicTeams();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Transform and filter teams
  const filteredTeams = teams
    .map(transformTeam)
    .filter(team => {
      // Apply type filter
      if (filter === 'all') return true;
      if (filter === 'express') return team.type === TEAM_TYPES.EXPRESS;
      if (filter === 'tne') return team.type === TEAM_TYPES.TNE;
      if (filter === 'girls') return team.type === TEAM_TYPES.GIRLS;
      return true;
    })
    .filter(team => {
      // Apply search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        team.name.toLowerCase().includes(q) ||
        team.coach.toLowerCase().includes(q) ||
        team.grade.toLowerCase().includes(q)
      );
    });

  const filterButtons = [
    { key: 'all', label: 'All Teams' },
    { key: 'express', label: 'Boys Express' },
    { key: 'tne', label: 'Boys TNE' },
    { key: 'girls', label: 'Girls Program' }
  ];

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
                2024-25 Winter Season
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
              {filterButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setFilter(btn.key)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === btn.key
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/30 focus:border-tne-red/50 transition-colors"
              />
            </div>
          </div>

          {/* Content States */}
          {loading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!loading && !error && filteredTeams.length === 0 && <EmptyState />}

          {/* Team Grid */}
          {!loading && !error && filteredTeams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeams.map((team, index) => (
                <TeamCard key={team.id} team={team} index={index} />
              ))}
            </div>
          )}

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
                  <span className="font-medium text-neutral-900">Jan 3 – Mar 1, 2025</span>
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

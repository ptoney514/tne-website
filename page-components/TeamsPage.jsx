import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, ChevronDown, Loader2, AlertCircle, X } from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import { usePublicTeams } from '@/hooks/usePublicTeams';
import { usePublicSeasons } from '@/hooks/usePublicSeasons';

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
  if (!coach) return 'Coach: TBD';
  return `Coach: ${coach.last_name}`;
}

// Extract raw grade (e.g., "4th" from "4th Grade" or "4th")
function extractGrade(gradeLevel) {
  if (!gradeLevel) return null;
  const match = gradeLevel.match(/(\d+)(st|nd|rd|th)?/i);
  return match ? `${match[1]}${match[2] || 'th'}` : null;
}

// Transform Supabase team data for display
function transformTeam(team) {
  const rawGrade = extractGrade(team.grade_level);
  return {
    id: team.id,
    grade: rawGrade ? `${rawGrade} Grade` : team.grade_level,
    rawGrade: rawGrade,
    name: team.name,
    coach: formatCoachName(team.head_coach),
    type: getTeamType(team),
    playerCount: team.player_count || 0
  };
}

// Debounce hook for search
function useDebounce(value, delay = 200) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Group teams by grade for display
function groupTeamsByGrade(teams) {
  const groups = {};
  teams.forEach(team => {
    const grade = team.rawGrade || 'Other';
    if (!groups[grade]) groups[grade] = [];
    groups[grade].push(team);
  });

  return Object.keys(groups)
    .sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      const numA = parseInt(a) || 99;
      const numB = parseInt(b) || 99;
      return numA - numB;
    })
    .map(grade => ({ grade, teams: groups[grade] }));
}

// Format lastUpdated date
function formatLastUpdated(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function TeamCard({ team, index }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article
        data-testid="team-card"
        className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1"
      >
        {/* Team Info */}
        <div className="space-y-1 mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-tne-red transition-colors">
            {team.name}
          </h2>
          <p className="text-sm text-neutral-500">
            {team.grade}
          </p>
          <p className="text-sm text-neutral-500">
            {team.coach}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          {team.playerCount > 0 ? (
            <span className="text-sm text-neutral-500">
              {team.playerCount} player{team.playerCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span />
          )}
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-tne-red group-hover:translate-x-0.5 transition-all" />
        </div>
      </article>
    </Link>
  );
}

function LoadingState() {
  return (
    <div data-testid="loading-spinner" className="flex flex-col items-center justify-center py-20">
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

function EmptyState({ hasFilters, onClearFilters, isGirlsProgram }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Search className="w-8 h-8 text-neutral-300 mb-4" />
      {isGirlsProgram ? (
        <>
          <p className="text-neutral-700 font-medium mb-1">Girls teams are being formed</p>
          <p className="text-neutral-500 text-sm mb-4">Check back soon for updates!</p>
        </>
      ) : (
        <>
          <p className="text-neutral-700 font-medium mb-1">No teams found</p>
          <p className="text-neutral-500 text-sm mb-4">Try adjusting your filters or search terms.</p>
        </>
      )}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 font-medium cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-tne-red/30 focus:border-tne-red/50 transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
}

export default function TeamsPage() {
  const { seasons, selectedSeasonId, selectedSeason, setSelectedSeasonId, loading: seasonsLoading, ready: seasonsReady } = usePublicSeasons();
  const { teams, loading: teamsLoading, error, lastUpdated } = usePublicTeams(seasonsReady ? selectedSeasonId : undefined);
  const loading = seasonsLoading || teamsLoading;
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Check if any filters are active
  const hasFilters = debouncedSearch.trim() !== '' || programFilter !== 'all' || gradeFilter !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setProgramFilter('all');
    setGradeFilter('all');
  };

  // Transform and filter teams
  const filteredTeams = teams
    .map(transformTeam)
    .filter(team => {
      // Apply program filter
      if (programFilter !== 'all') {
        if (programFilter === 'express' && team.type !== TEAM_TYPES.EXPRESS) return false;
        if (programFilter === 'tne' && team.type !== TEAM_TYPES.TNE) return false;
        if (programFilter === 'girls' && team.type !== TEAM_TYPES.GIRLS) return false;
      }
      return true;
    })
    .filter(team => {
      // Apply grade filter
      if (gradeFilter !== 'all') {
        const gradeNum = team.rawGrade ? parseInt(team.rawGrade) : null;
        if (gradeNum !== parseInt(gradeFilter)) return false;
      }
      return true;
    })
    .filter(team => {
      // Apply search filter
      if (!debouncedSearch.trim()) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        team.name.toLowerCase().includes(q) ||
        team.coach.toLowerCase().includes(q) ||
        team.grade.toLowerCase().includes(q)
      );
    });

  // Group filtered teams by grade
  const groupedTeams = groupTeamsByGrade(filteredTeams);

  // Grade options
  const gradeOptions = [
    { value: 'all', label: 'All Grades' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' }
  ];

  // Program options
  const programOptions = [
    { value: 'all', label: 'All Programs' },
    { value: 'express', label: 'Boys Express' },
    { value: 'tne', label: 'Boys TNE' },
    { value: 'girls', label: 'Girls Program' }
  ];

  return (
    <InteriorLayout hideStatusBadge>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-20 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-4 animate-enter">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {selectedSeason ? selectedSeason.name : 'Teams'}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                View current team rosters and coach assignments.
              </p>
            </div>
            {lastUpdated && (
              <p className="text-sm text-white/50">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

          {/* Controls Bar */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Find your team
            </p>
            {/* Search - full width on mobile, flex-grow on desktop */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search team or player"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/30 focus:border-tne-red/50 transition-colors"
              />
            </div>

            {/* Dropdowns and Clear button */}
            <div className="flex flex-wrap items-center gap-3">
              {seasons.length > 1 && (
                <Dropdown
                  label="Season filter"
                  value={selectedSeasonId || ''}
                  onChange={setSelectedSeasonId}
                  options={seasons.map(s => ({ value: s.id, label: s.name }))}
                />
              )}
              <Dropdown
                label="Program filter"
                value={programFilter}
                onChange={setProgramFilter}
                options={programOptions}
              />
              <Dropdown
                label="Grade filter"
                value={gradeFilter}
                onChange={setGradeFilter}
                options={gradeOptions}
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Content States */}
          {loading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!loading && !error && filteredTeams.length === 0 && (
            <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} isGirlsProgram={programFilter === 'girls'} />
          )}

          {/* Grouped Team Grid */}
          {!loading && !error && filteredTeams.length > 0 && (
            <div className="space-y-10">
              {groupedTeams.map(({ grade, teams: gradeTeams }) => (
                <div key={grade} className="border-t border-neutral-200 pt-8 first:border-t-0 first:pt-0">
                  {/* Grade Heading */}
                  <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide mb-5">
                    {grade === 'Other' ? 'Other' : `${grade} Grade`}
                  </h2>

                  {/* Team Grid */}
                  <div data-testid="teams-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {gradeTeams.map((team, index) => (
                      <TeamCard key={team.id} team={team} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </InteriorLayout>
  );
}

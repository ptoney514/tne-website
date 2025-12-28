import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Trophy, Medal, ExternalLink, CalendarDays, Info } from 'lucide-react';
import { usePublicGames } from '../../hooks/useGames';

// Fallback sample data when no tournaments in database
const sampleTournaments = [
  {
    id: 'sample-1',
    name: 'New Year Classic Invitational',
    date: '2026-01-04',
    location: 'Gateway Sports Complex',
    is_featured: true,
    game_teams: [],
  },
  {
    id: 'sample-2',
    name: 'MLK Weekend Showcase',
    date: '2026-01-18',
    location: 'Central Sports Arena',
    is_featured: false,
    game_teams: [],
  },
];

const pastResults = [
  {
    id: '1',
    tournament: 'Holiday Hoops Classic',
    date: 'Dec 21-22',
    team: '7th Grade - Mitchell',
    result: 'champions',
  },
  {
    id: '2',
    tournament: 'Thanksgiving Showdown',
    date: 'Nov 29-30',
    team: '6th Grade - Todd',
    result: 'runner-up',
  },
  {
    id: '3',
    tournament: 'Thanksgiving Showdown',
    date: 'Nov 29-30',
    team: '5th Grade - Perry',
    result: 'champions',
  },
  {
    id: '4',
    tournament: 'Fall Classic Tournament',
    date: 'Oct 12-13',
    team: '4th Grade - Foster',
    result: '3rd',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ResultBadge({ result }) {
  if (result === 'champions') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-xs font-medium">
        <Trophy className="w-3.5 h-3.5" />
        Champions
      </span>
    );
  }
  if (result === 'runner-up') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200 text-neutral-700 px-2.5 py-1 text-xs font-medium">
        <Medal className="w-3.5 h-3.5" />
        Runner-up
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-2.5 py-1 text-xs font-medium">
      {result}
    </span>
  );
}

function FeaturedTournamentCard({ tournament }) {
  const teams = tournament.game_teams || [];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white border border-neutral-700/50 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tne-red/5 to-transparent pointer-events-none" />

      <div className="px-5 py-6 sm:px-8 sm:py-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-500/20 text-amber-400 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide border border-amber-500/20">
                Featured
              </span>
              <span className="text-[0.7rem] font-mono text-white/50">
                {formatDate(tournament.date)}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {tournament.name}
            </h3>

            {tournament.notes && (
              <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                {tournament.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-1">
              {tournament.location && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span>{tournament.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Users className="w-4 h-4 text-white/40" />
                <span>{teams.length} TNE Teams Registered</span>
              </div>
            </div>

            {teams.length > 0 && (
              <div className="pt-4 border-t border-white/10 mt-2">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                  TNE Teams Participating
                </p>
                <div className="flex flex-wrap gap-2">
                  {teams.map((gt) => (
                    <span
                      key={gt.id}
                      className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors"
                    >
                      {gt.team?.name || 'Team'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:items-end lg:min-w-[180px]">
            <Link
              to={`/tournaments/${tournament.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-all hover:scale-[1.02] shadow-lg shadow-tne-red/20"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
            {tournament.external_url && (
              <a
                href={tournament.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium hover:bg-white/20 transition-all"
              >
                Tournament Site
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentCard({ tournament }) {
  const teams = tournament.game_teams || [];

  return (
    <article className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-neutral-300 transition-all">
      <div className="bg-neutral-900 text-white px-5 py-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
            Tournament
          </span>
          <span className="text-[0.7rem] font-mono text-white/50">
            {formatDate(tournament.date)}
          </span>
        </div>
        <h3 className="text-xl font-semibold tracking-tight">
          {tournament.name}
        </h3>
      </div>

      <div className="px-5 py-4 space-y-3 flex-1">
        <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
          {tournament.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-400" />
              {tournament.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-400" />
            {teams.length} team{teams.length !== 1 ? 's' : ''}
          </span>
        </div>

        {teams.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Participating Teams
            </p>
            <div className="flex flex-wrap gap-1.5">
              {teams.map((gt) => (
                <span
                  key={gt.id}
                  className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[0.65rem] font-mono text-neutral-600"
                >
                  {gt.team?.name?.split(' ').slice(-1)[0] || 'Team'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <span className="text-[0.7rem] sm:text-xs text-neutral-500">
          {tournament.start_time && `Starts at ${tournament.start_time}`}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tne-red text-white text-xs font-medium hover:bg-tne-red-dark transition-colors"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {tournament.external_url && (
            <a
              href={tournament.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 p-1.5 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
              title="Tournament Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TournamentsTab() {
  const { games, loading, error } = usePublicGames();

  // Filter to only show tournaments
  const tournaments = games.filter(g => g.game_type === 'tournament');

  // Use sample data if no tournaments in database
  const displayTournaments = tournaments.length > 0 ? tournaments : sampleTournaments;
  const featuredTournament = displayTournaments.find(t => t.is_featured);
  const otherTournaments = displayTournaments.filter(t => !t.is_featured);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-200 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
        <p className="text-neutral-500">Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white border border-neutral-200 p-8 text-center">
        <CalendarDays className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Unable to load tournaments
        </h3>
        <p className="text-neutral-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-neutral-900">
          Upcoming Tournaments
        </h2>
        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
          {displayTournaments.length} Events
        </span>
      </div>

      {/* Featured Tournament */}
      {featuredTournament && (
        <FeaturedTournamentCard tournament={featuredTournament} />
      )}

      {/* Tournament Grid */}
      {otherTournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {otherTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {displayTournaments.length === 0 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-8 text-center">
          <CalendarDays className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No upcoming tournaments
          </h3>
          <p className="text-neutral-500">
            Check back later for tournament announcements
          </p>
        </div>
      )}

      {/* Past Results */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Past Results
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            2024-25 Season
          </span>
        </div>

        <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="bg-neutral-100 border-b border-neutral-200 px-5 py-3 hidden sm:block">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="col-span-4">Tournament</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Team</div>
              <div className="col-span-2">Result</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            {pastResults.map((result) => (
              <div
                key={result.id}
                className="px-5 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-4">
                    <p className="font-medium text-neutral-900">
                      {result.tournament}
                    </p>
                    <p className="text-xs text-neutral-500 sm:hidden">
                      {result.date}
                    </p>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-sm text-neutral-600">
                      {result.date}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[0.7rem] font-mono text-neutral-700">
                      {result.team}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <ResultBadge result={result.result} />
                  </div>
                  <div className="col-span-1 text-right">
                    <button className="text-xs text-tne-red hover:text-tne-red-dark font-medium">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 text-center">
            <button className="text-sm font-medium text-tne-red hover:text-tne-red-dark">
              View all past results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { MapPin, Users, Ticket, ArrowRight, Trophy, Medal } from 'lucide-react';

// Sample tournament data - will be replaced with Supabase data
const upcomingTournaments = [
  {
    id: '1',
    name: 'New Year Classic Invitational',
    dates: 'Jan 4-5, 2026',
    location: 'Gateway Sports Complex',
    price: '$250 per team',
    status: 'open',
    featured: true,
    deadline: 'Dec 28',
    description:
      'Kick off 2026 with one of the premier youth basketball tournaments in the region. Multiple TNE teams competing across all age divisions with full bracket play.',
    teamsRegistered: 4,
    participatingTeams: [
      '4th Grade - Foster',
      '5th Grade - Perry',
      '6th Grade - Todd',
      '7th Grade - Mitchell',
    ],
  },
  {
    id: '2',
    name: 'MLK Weekend Showcase',
    dates: 'Jan 18-19, 2026',
    location: 'Central Sports Arena',
    price: '$200 per team',
    status: 'open',
    deadline: 'Jan 10',
    description: '8-team bracket format with guaranteed 3 games',
    divisions: ['4th', '5th', '6th', '7th', '8th'],
  },
  {
    id: '3',
    name: 'Presidents Day Classic',
    dates: 'Feb 15-16, 2026',
    location: 'Metro Convention Center',
    price: '$275 per team',
    status: 'coming_soon',
    opens: 'Jan 15',
    description: 'Premier regional tournament with top programs',
    divisions: ['5th', '6th', '7th', '8th'],
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
  {
    id: '5',
    tournament: 'Labor Day Shootout',
    date: 'Aug 31 - Sep 1',
    team: '8th Grade - Johnson',
    result: 'champions',
  },
];

const seasonStats = {
  tournaments: 12,
  championships: 5,
  wins: 38,
  winRate: '76%',
};

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

export default function TournamentsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-neutral-900">
          Upcoming Tournaments
        </h2>
        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
          {upcomingTournaments.length} Events
        </span>
      </div>

      {/* Featured Tournament */}
      {upcomingTournaments
        .filter((t) => t.featured)
        .map((tournament) => (
          <div
            key={tournament.id}
            className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white border border-neutral-700/50 shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tne-red/5 to-transparent pointer-events-none" />

            <div className="px-5 py-6 sm:px-8 sm:py-8 relative">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-amber-500/20 text-amber-400 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide border border-amber-500/20">
                      Featured
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide border border-emerald-500/20">
                      Registration Open
                    </span>
                    <span className="text-[0.7rem] font-mono text-white/50">
                      {tournament.dates}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {tournament.name}
                  </h3>

                  <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                    {tournament.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Users className="w-4 h-4 text-white/40" />
                      <span>
                        {tournament.teamsRegistered} TNE Teams Registered
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Ticket className="w-4 h-4 text-white/40" />
                      <span>{tournament.price}</span>
                    </div>
                  </div>

                  {tournament.participatingTeams && (
                    <div className="pt-4 border-t border-white/10 mt-2">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                        TNE Teams Participating
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tournament.participatingTeams.map((team) => (
                          <span
                            key={team}
                            className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors"
                          >
                            {team}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 lg:items-end lg:min-w-[180px]">
                  <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[0.65rem] text-white/40 uppercase tracking-wider mb-1">
                      Registration Deadline
                    </span>
                    <span className="font-bebas text-3xl text-white tracking-wide">
                      {tournament.deadline}
                    </span>
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-all hover:scale-[1.02] shadow-lg shadow-tne-red/20">
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="text-xs text-white/50 hover:text-white transition-colors text-center">
                    View tournament details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {upcomingTournaments
          .filter((t) => !t.featured)
          .map((tournament) => (
            <article
              key={tournament.id}
              className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-neutral-300 transition-all"
            >
              <div className="bg-neutral-900 text-white px-5 py-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${
                      tournament.status === 'open'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {tournament.status === 'open' ? 'Open' : 'Coming Soon'}
                  </span>
                  <span className="text-[0.7rem] font-mono text-white/50">
                    {tournament.dates}
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  {tournament.name}
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {tournament.description}
                </p>
              </div>

              <div className="px-5 py-4 space-y-3 flex-1">
                <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {tournament.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-neutral-400" />
                    {tournament.price}
                  </span>
                </div>

                {tournament.divisions && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Age Divisions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tournament.divisions.map((div) => (
                        <span
                          key={div}
                          className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[0.65rem] font-mono text-neutral-600"
                        >
                          {div} Grade
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <span className="text-[0.7rem] sm:text-xs text-neutral-500">
                  {tournament.status === 'open'
                    ? `Deadline: ${tournament.deadline}`
                    : `Opens: ${tournament.opens}`}
                </span>
                {tournament.status === 'open' ? (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tne-red text-white text-xs font-medium hover:bg-tne-red-dark transition-colors">
                    Register
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-neutral-400">
                    Registration opens soon
                  </span>
                )}
              </div>
            </article>
          ))}
      </div>

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

      {/* Season Stats */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white border border-neutral-700/50 shadow-xl overflow-hidden">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <h3 className="text-lg font-semibold mb-5">
            2024-25 Season Highlights
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <span className="font-bebas text-4xl text-white tracking-wide">
                {seasonStats.tournaments}
              </span>
              <span className="block text-[0.65rem] text-white/50 uppercase tracking-wider mt-1">
                Tournaments
              </span>
            </div>
            <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <span className="font-bebas text-4xl text-amber-400 tracking-wide">
                {seasonStats.championships}
              </span>
              <span className="block text-[0.65rem] text-white/50 uppercase tracking-wider mt-1">
                Championships
              </span>
            </div>
            <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <span className="font-bebas text-4xl text-white tracking-wide">
                {seasonStats.wins}
              </span>
              <span className="block text-[0.65rem] text-white/50 uppercase tracking-wider mt-1">
                Wins
              </span>
            </div>
            <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <span className="font-bebas text-4xl text-white tracking-wide">
                {seasonStats.winRate}
              </span>
              <span className="block text-[0.65rem] text-white/50 uppercase tracking-wider mt-1">
                Win Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

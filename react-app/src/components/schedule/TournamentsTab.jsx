import { MapPin, CalendarDays } from 'lucide-react';

// Winter 2025 Tournament Schedules
const boysTournaments = [
  {
    id: 'boys-1',
    dateRange: 'Dec 27-28',
    name: "New Year's Tip-Off",
    location: 'Council Bluffs, IA',
    venue: 'IWFH',
  },
  {
    id: 'boys-2',
    dateRange: 'Jan 2-4',
    name: 'I Have A Dream Classic',
    location: 'Council Bluffs, IA',
    venue: 'IWFH',
  },
  {
    id: 'boys-3',
    dateRange: 'Jan 23-25',
    name: 'Tri-State Showdown',
    location: 'Council Bluffs, IA',
    venue: 'IWFH',
  },
  {
    id: 'boys-4',
    dateRange: 'Jan 30-Feb 1',
    name: 'February Frenzy',
    location: 'Elkhorn, NE',
    venue: 'UBT',
  },
  {
    id: 'boys-5',
    dateRange: 'Feb 20-22',
    name: 'AMP IT UP',
    location: 'Omaha, NE',
    venue: null,
  },
  {
    id: 'boys-6',
    dateRange: 'Mar 6-8',
    name: 'Midwest Regional Hoops Championship',
    location: 'Elkhorn, NE',
    venue: 'UBT',
  },
];

const girlsTournaments = [
  {
    id: 'girls-1',
    dateRange: 'Jan 2-4',
    name: 'I Have A Dream Classic',
    location: 'Council Bluffs, IA',
    venue: 'IWFH',
  },
  {
    id: 'girls-2',
    dateRange: 'Jan 30-Feb 1',
    name: 'February Frenzy',
    location: 'Elkhorn, NE',
    venue: 'UBT',
  },
  {
    id: 'girls-3',
    dateRange: 'Feb 20-22',
    name: 'AMP IT UP',
    location: 'Omaha, NE',
    venue: null,
  },
  {
    id: 'girls-4',
    dateRange: 'Mar 6-8',
    name: 'Midwest Regional Hoops Championship',
    location: 'Elkhorn, NE',
    venue: 'UBT',
  },
];

function TournamentRow({ tournament }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors">
      {/* Date */}
      <div className="sm:w-28 flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900">
          <CalendarDays className="w-4 h-4 text-neutral-400 sm:hidden" />
          {tournament.dateRange}
        </span>
      </div>

      {/* Tournament Name */}
      <div className="flex-1">
        <span className="text-sm font-semibold text-neutral-900">
          {tournament.name}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-neutral-600">
        <MapPin className="w-4 h-4 text-neutral-400" />
        <span>
          {tournament.location}
          {tournament.venue && (
            <span className="text-neutral-400 ml-1">({tournament.venue})</span>
          )}
        </span>
      </div>
    </div>
  );
}

function TournamentSection({ title, tournaments, accentColor }) {
  return (
    <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className={`px-5 py-4 border-b border-neutral-200 ${accentColor}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <span className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-0.5 text-xs font-medium">
            {tournaments.length} tournaments
          </span>
        </div>
      </div>

      {/* Table Header (Desktop) */}
      <div className="bg-neutral-50 border-b border-neutral-100 px-5 py-2.5 hidden sm:block">
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
          <div className="w-28">Date</div>
          <div className="flex-1">Tournament</div>
          <div className="w-48 text-right">Location</div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="divide-y divide-neutral-100">
        {tournaments.map((tournament) => (
          <TournamentRow key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  );
}

export default function TournamentsTab() {
  return (
    <div className="space-y-8">
      {/* Boys Section */}
      <TournamentSection
        title="Boys Winter Schedule"
        tournaments={boysTournaments}
        accentColor="bg-gradient-to-r from-blue-50 to-white"
      />

      {/* Girls Section */}
      <TournamentSection
        title="Girls Winter Schedule"
        tournaments={girlsTournaments}
        accentColor="bg-gradient-to-r from-pink-50 to-white"
      />

      {/* Info Note */}
      <div className="rounded-2xl bg-neutral-100 border border-neutral-200 px-5 py-4">
        <p className="text-sm text-neutral-600">
          <span className="font-medium text-neutral-800">Note:</span> Tournament
          schedules are subject to change. Check back for updates or contact
          your coach for the latest information.
        </p>
      </div>
    </div>
  );
}

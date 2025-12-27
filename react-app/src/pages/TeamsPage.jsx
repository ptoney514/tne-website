import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Search,
  Zap,
  Rocket,
  Trophy,
  Flame,
  Target,
  Medal as MedalIcon,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';

const teamData = [
  {
    id: 'foster-4th',
    grade: '4th Grade',
    name: 'Express United',
    coaches: 'Foster · Express United 4th · Boys',
    coachInfo: 'Coach Foster',
    icon: Zap,
    events: [
      { title: 'Team Practice · Monroe MS Gym', time: 'Mon · 6:00 PM', location: 'Court 1' },
      { title: 'League Game vs Metro Elite', time: 'Sat · 2:15 PM', location: 'Central Fieldhouse' }
    ],
    roster: 'Roster Active · 7 players'
  },
  {
    id: 'grisby-evans-4th',
    grade: '4th Grade',
    name: 'Express United',
    coaches: 'Grisby / Evans · Boys',
    coachInfo: 'Coaches Grisby & Evans',
    icon: Rocket,
    events: [
      { title: 'Practice · Northwest HS', time: 'Tue · 6:00 PM', location: null },
      { title: 'League Game vs Rocket Stars', time: 'Sat · 4:30 PM', location: null }
    ],
    roster: 'Roster: 8 players · Northwest HS'
  },
  {
    id: 'perry-5th',
    grade: '5th Grade',
    name: 'Express United',
    coaches: 'Perry · Boys',
    coachInfo: 'Coach Perry',
    icon: Trophy,
    events: [
      { title: 'Practice · Northwest HS', time: 'Tue · 6:00 PM', location: null }
    ],
    roster: 'Roster: 11 players · Northwest HS'
  },
  {
    id: 'todd-6th',
    grade: '6th Grade',
    name: 'Express United',
    coaches: 'Todd · Boys',
    coachInfo: 'Coach Todd',
    icon: Flame,
    events: [
      { title: 'Practice · McMillan MS', time: 'Tue · 6:00 PM', location: null }
    ],
    roster: 'Roster: 10 players · McMillan MS'
  },
  {
    id: 'mitchell-7th',
    grade: '7th Grade',
    name: 'Express United',
    coaches: 'Mitchell · Boys',
    coachInfo: 'Coach Mitchell',
    icon: Target,
    events: [
      { title: 'Practice · Central HS', time: 'Mon · 6:00 PM', location: null }
    ],
    roster: 'Roster: 7 players · Central HS'
  },
  {
    id: 'johnson-8th',
    grade: '8th Grade',
    name: 'Express United',
    coaches: 'Johnson · Boys',
    coachInfo: 'Coach Johnson',
    icon: MedalIcon,
    events: [
      { title: 'Practice · Gateway HS', time: 'Wed · 6:30 PM', location: null }
    ],
    roster: 'Roster: 9 players · Gateway HS'
  }
];

function TeamCard({ team }) {
  const IconComponent = team.icon;

  return (
    <article className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
            <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em]">{team.grade}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{team.name}</h2>
          <p className="text-xs sm:text-sm text-white/60">
            {team.coaches}
          </p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-tne-red text-white shadow-md">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="px-5 py-4 sm:py-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-800">
            <span className="inline-flex h-3 w-3 rounded-full border border-neutral-400"></span>
            <span className="font-medium">Coach Information</span>
          </div>
          <p className="text-sm text-neutral-600 ml-5">{team.coachInfo}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
            <Calendar className="w-4 h-4" />
            <span>Upcoming Games & Practices</span>
          </div>

          <div className="space-y-2">
            {team.events.map((event, index) => (
              <div key={index} className="rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-xs sm:text-sm">
                <p className="font-medium text-neutral-900 mb-1">{event.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[0.7rem] sm:text-xs text-neutral-600">
        <span className="inline-flex items-center gap-1">
          {team.roster.includes('Active') && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
          {team.roster}
        </span>
        <Link to={`/teams/${team.id}`} className="font-medium text-tne-red hover:text-tne-red-dark">Open team details</Link>
      </div>
    </article>
  );
}

export default function TeamsPage() {
  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">2025-2026 Fall/Winter Season</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Teams & Rosters
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Browse every team's coach information, practice details, and upcoming games for the 2025‑26 season.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-12 sm:pb-16 space-y-6 sm:space-y-8">

          {/* Controls Bar */}
          <div className="animate-enter delay-100 rounded-2xl bg-white border border-neutral-200 shadow-sm px-3 py-2 sm:px-4 sm:py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium whitespace-nowrap">
                All Teams
              </button>
              <button className="px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Boys Express
              </button>
              <button className="px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Boys TNE
              </button>
              <button className="px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Girls Program
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Search className="w-4 h-4" />
                </div>
                <input type="text" placeholder="Search by coach, grade, or team…" className="block w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50" />
              </div>
            </div>
          </div>

          {/* Team Grid */}
          <div className="animate-enter delay-200 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {teamData.map((team, index) => (
              <TeamCard key={index} team={team} />
            ))}
          </div>

          {/* OSA League Games Info */}
          <div className="animate-enter delay-300 rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 text-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight">OSA League Games</h2>
                  <p className="text-sm text-white/70">Omaha Sports Academy Winter League</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">Season Period</span>
                  <span className="font-medium text-neutral-900">Jan 3 – Mar 1, 2026</span>
                  <span className="text-neutral-500 ml-1">(9 weeks)</span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">Game Days</span>
                  <span className="font-medium text-neutral-900">Saturdays & Sundays</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                League game schedules are managed through TourneyMachine and are typically finalized the week before each game.
                Check the link below for up-to-date game times, locations, and opponents.
              </p>
              <a
                href="https://tourneymachine.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors shadow-sm"
              >
                <CalendarDays className="w-4 h-4" />
                View League Schedule on TourneyMachine
              </a>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

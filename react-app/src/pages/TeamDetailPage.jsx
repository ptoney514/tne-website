import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Award,
  ExternalLink
} from 'lucide-react';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

// Sample team data
const teamsData = {
  'foster-4th': {
    id: 'foster-4th',
    grade: '4th Grade',
    program: 'Boys Express',
    name: 'Express United',
    coach: 'Coach Foster',
    location: 'Monroe MS Gym',
    practiceDays: 'Mon/Wed 6:00 PM',
    coachInfo: {
      name: 'Coach Foster',
      experience: '10 years coaching youth basketball',
      certifications: 'USA Basketball Gold License'
    },
    roster: [
      { number: 3, name: 'Marcus Johnson', position: 'Point Guard', grade: '4th' },
      { number: 7, name: 'Tyler Smith', position: 'Shooting Guard', grade: '4th' },
      { number: 12, name: 'David Williams', position: 'Small Forward', grade: '4th' },
      { number: 21, name: 'Chris Brown', position: 'Power Forward', grade: '4th' },
      { number: 34, name: 'James Davis', position: 'Center', grade: '4th' },
      { number: 5, name: 'Michael Wilson', position: 'Guard', grade: '4th' },
      { number: 10, name: 'Andre Taylor', position: 'Forward', grade: '4th' }
    ],
    schedule: [
      { date: 'Mon Dec 23', type: 'practice', title: 'Team Practice', time: '6:00 PM', location: 'Monroe MS Gym' },
      { date: 'Wed Dec 25', type: 'off', title: 'No Practice (Holiday)', time: null, location: null },
      { date: 'Sat Dec 28', type: 'game', title: 'League Game vs Metro Elite', time: '2:15 PM', location: 'Central Fieldhouse' },
      { date: 'Mon Dec 30', type: 'practice', title: 'Team Practice', time: '6:00 PM', location: 'Monroe MS Gym' },
      { date: 'Sat Jan 4', type: 'tournament', title: 'New Year Classic', time: '8:00 AM', location: 'Ralston Arena' }
    ]
  }
};

function PlayerCard({ player }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex items-center gap-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-tne-red text-white font-semibold text-lg">
        #{player.number}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-neutral-900 truncate">{player.name}</h4>
        <p className="text-sm text-neutral-500">{player.position} · {player.grade}</p>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const typeStyles = {
    practice: { accent: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Practice' },
    game: { accent: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Game' },
    tournament: { accent: 'bg-tne-maroon', badge: 'bg-red-100 text-tne-maroon', label: 'Tournament' },
    off: { accent: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-500', label: 'Off' }
  };

  const style = typeStyles[event.type] || typeStyles.practice;

  return (
    <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors">
      <div className={`h-1 ${style.accent}`}></div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="font-mono text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            {event.date}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-medium uppercase tracking-wider ${style.badge}`}>
            {style.label}
          </span>
        </div>
        <h4 className="font-semibold text-neutral-900 mb-2">{event.title}</h4>
        {(event.time || event.location) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500">
            {event.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { teamId } = useParams();

  // Get team data (fallback to foster-4th for demo)
  const team = teamsData[teamId] || teamsData['foster-4th'];

  const playerCount = team.roster.length;
  const weeklyPractices = team.schedule.filter(e => e.type === 'practice').length > 0 ? '2x' : '0';
  const upcomingEvents = team.schedule.filter(e => e.type !== 'off').length;

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">
      {/* Navbar */}
      <TeamsNavbar />

      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>

        <div className="sm:px-6 sm:pt-10 sm:pb-12 max-w-6xl mx-auto pt-8 px-4 pb-8 relative">
          <div className="flex flex-col gap-6 animate-enter">
            {/* Back Link */}
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Teams
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/80">{team.grade}</span>
              </div>
              <div className="inline-flex items-center rounded-full border border-tne-red/30 bg-tne-red/10 px-2.5 py-0.5">
                <span className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-red-300">{team.program}</span>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {team.name}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/60">
                {team.coach} · {team.location} · {team.practiceDays}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bebas text-white">{playerCount}</div>
                <div className="text-[0.7rem] font-mono text-white/50 uppercase tracking-wider">Players</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bebas text-white">{weeklyPractices}</div>
                <div className="text-[0.7rem] font-mono text-white/50 uppercase tracking-wider">Weekly</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bebas text-white">{upcomingEvents}</div>
                <div className="text-[0.7rem] font-mono text-white/50 uppercase tracking-wider">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

            {/* Roster Panel (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-neutral-400" />
                  <h2 className="text-lg font-semibold text-neutral-900">Roster</h2>
                  <span className="text-sm text-neutral-500">({playerCount} players)</span>
                </div>
              </div>

              {team.roster.length > 0 ? (
                <div className="space-y-3">
                  {team.roster.map((player, index) => (
                    <PlayerCard key={index} player={player} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center">
                  <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Roster coming soon</p>
                </div>
              )}
            </div>

            {/* Schedule Panel (40%) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-neutral-400" />
                    <h2 className="text-lg font-semibold text-neutral-900">Upcoming Schedule</h2>
                  </div>
                  <Link
                    to="/schedule"
                    className="inline-flex items-center gap-1 text-sm font-medium text-tne-red hover:text-tne-red-dark transition-colors"
                  >
                    View Full Schedule
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {team.schedule.map((event, index) => (
                    <EventCard key={index} event={event} />
                  ))}
                </div>
              </div>

              {/* Coach Info Box */}
              <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-900 text-white">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-tne-red" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Coach Info</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{team.coachInfo.name}</h4>
                    <p className="text-sm text-neutral-600 mt-1">{team.coachInfo.experience}</p>
                  </div>
                  <div className="pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-tne-red" />
                      <span className="text-sm text-neutral-600">{team.coachInfo.certifications}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <TeamsFooter />
    </div>
  );
}

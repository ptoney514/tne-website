import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Award,
  ChevronRight,
  Instagram,
  Twitter
} from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';

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
      { number: 3, name: 'Marcus Johnson', gradYear: 2033, instagram: 'marcusj_hoops', twitter: 'marcusj3' },
      { number: 7, name: 'Tyler Smith', gradYear: 2033, instagram: 'tsmith_bball' },
      { number: 12, name: 'David Williams', gradYear: 2033 },
      { number: 21, name: 'Chris Brown', gradYear: 2033, twitter: 'cb21hoops' },
      { number: 34, name: 'James Davis', gradYear: 2033, instagram: 'jdavis34' },
      { number: 5, name: 'Michael Wilson', gradYear: 2033 },
      { number: 10, name: 'Andre Taylor', gradYear: 2033, instagram: 'dretaylor10', twitter: 'andre_t10' }
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

function PlayerRow({ player, index, isLast }) {
  const hasSocial = player.instagram || player.twitter;

  return (
    <div
      className={`group flex items-center gap-4 py-4 ${!isLast ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50/50 -mx-4 px-4 transition-colors`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Jersey Number */}
      <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white font-bebas text-lg tracking-wide">
        {player.number}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 group-hover:text-tne-red transition-colors">
          {player.name}
        </h4>
        <p className="text-[0.7rem] font-mono text-neutral-400 uppercase tracking-wider">
          Class of {player.gradYear}
        </p>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-1">
        {player.instagram && (
          <a
            href={`https://instagram.com/${player.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-300 hover:text-pink-500 hover:bg-pink-50 transition-colors"
            title={`@${player.instagram}`}
          >
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {player.twitter && (
          <a
            href={`https://twitter.com/${player.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-300 hover:text-sky-500 hover:bg-sky-50 transition-colors"
            title={`@${player.twitter}`}
          >
            <Twitter className="w-4 h-4" />
          </a>
        )}
        {!hasSocial && (
          <div className="w-16" />
        )}
      </div>
    </div>
  );
}

function ScheduleItem({ event, index, isLast }) {
  const typeConfig = {
    practice: {
      color: 'bg-emerald-500',
      label: 'Practice',
      labelColor: 'text-emerald-600'
    },
    game: {
      color: 'bg-blue-500',
      label: 'Game',
      labelColor: 'text-blue-600'
    },
    tournament: {
      color: 'bg-tne-red',
      label: 'Tournament',
      labelColor: 'text-tne-red'
    },
    off: {
      color: 'bg-neutral-300',
      label: 'Off',
      labelColor: 'text-neutral-400'
    }
  };

  const config = typeConfig[event.type] || typeConfig.practice;

  return (
    <div
      className="relative pl-6 group"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 group-first:top-3 group-last:bottom-auto group-last:h-3" />

      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 w-2 h-2 -translate-x-[3px] rounded-full ${config.color} ring-4 ring-white`} />

      <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
        {/* Date & Type */}
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[0.7rem] font-mono font-semibold text-neutral-900 uppercase tracking-wider">
            {event.date}
          </span>
          <span className={`text-[0.6rem] font-mono uppercase tracking-widest ${config.labelColor}`}>
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-medium text-neutral-800 mb-1.5 leading-snug">
          {event.title}
        </h4>

        {/* Details */}
        {(event.time || event.location) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-neutral-500">
            {event.time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
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
  const team = teamsData[teamId] || teamsData['foster-4th'];
  const playerCount = team.roster.length;

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-10 sm:pb-12 max-w-6xl mx-auto pt-8 px-4 pb-8 relative">
          <div className="flex flex-col gap-5 animate-enter">
            {/* Back Link */}
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Teams
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-sm bg-white/5 border border-white/10 px-2.5 py-1">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-white/70">{team.grade}</span>
              </div>
              <div className="inline-flex items-center rounded-sm border border-tne-red/30 bg-tne-red/10 px-2.5 py-1">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-red-300">{team.program}</span>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {team.name}
              </h1>
              <p className="mt-3 text-base text-white/50 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{team.coach}</span>
                <span className="text-white/20">·</span>
                <span>{team.location}</span>
                <span className="text-white/20">·</span>
                <span>{team.practiceDays}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Roster Panel */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <h2 className="font-semibold text-neutral-900">Roster</h2>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    {playerCount} players
                  </span>
                </div>

                {/* Player List */}
                <div className="px-5 py-2">
                  {team.roster.length > 0 ? (
                    team.roster.map((player, index) => (
                      <PlayerRow
                        key={index}
                        player={player}
                        index={index}
                        isLast={index === team.roster.length - 1}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Users className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm">Roster coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule & Coach Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Upcoming Schedule */}
              <div className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-neutral-400" />
                    <h2 className="font-semibold text-neutral-900">Schedule</h2>
                  </div>
                  <Link
                    to="/schedule"
                    className="inline-flex items-center gap-1 text-xs font-medium text-tne-red hover:text-tne-red-dark transition-colors group"
                  >
                    Full Schedule
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Timeline */}
                <div className="px-5 py-5">
                  {team.schedule.map((event, index) => (
                    <ScheduleItem
                      key={index}
                      event={event}
                      index={index}
                      isLast={index === team.schedule.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Coach Info */}
              <div className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-neutral-900 flex items-center gap-3">
                  <Award className="w-4 h-4 text-tne-red" />
                  <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Coach</h2>
                </div>

                {/* Content */}
                <div className="px-5 py-5">
                  <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                    {team.coachInfo.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    {team.coachInfo.experience}
                  </p>

                  <div className="pt-4 border-t border-neutral-100 flex items-start gap-3">
                    <Trophy className="w-4 h-4 text-tne-red flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-600 leading-relaxed">
                      {team.coachInfo.certifications}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

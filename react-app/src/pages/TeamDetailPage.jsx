import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';
import { usePublicTeamDetail } from '../hooks/usePublicTeamDetail';
import { usePracticeSchedule, formatPracticeSession } from '../hooks/usePracticeSchedule';

// Format date for display (e.g., "Sat Dec 28")
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Format time for display (e.g., "2:15 PM")
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Derive team type from tier + gender
function getTeamType(team) {
  if (team.gender === 'female') return 'Girls Program';
  if (team.tier === 'tne') return 'Boys TNE';
  return 'Boys Express';
}

// Format coach display name
function formatCoachName(coach) {
  if (!coach) return 'Coach TBD';
  if (coach.first_name === 'Coach') {
    return `Coach ${coach.last_name}`;
  }
  return `Coach ${coach.first_name} ${coach.last_name}`;
}

function PlayerRow({ player, rosterEntry, index, isLast }) {
  const jerseyNumber = rosterEntry.jersey_number || player.jersey_number || '—';
  const playerName = `${player.first_name} ${player.last_name}`;
  const gradYear = player.graduating_year;

  return (
    <div
      className={`group flex items-center gap-4 py-4 ${!isLast ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50/50 -mx-4 px-4 transition-colors`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Jersey Number */}
      <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white font-bebas text-lg tracking-wide">
        {jerseyNumber}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 group-hover:text-tne-red transition-colors">
          {playerName}
        </h4>
        {gradYear && (
          <p className="text-[0.7rem] font-mono text-neutral-400 uppercase tracking-wider">
            Class of {gradYear}
          </p>
        )}
      </div>
    </div>
  );
}

function ScheduleItem({ gameTeam, index, isLast }) {
  const game = gameTeam.game;

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
    league: {
      color: 'bg-purple-500',
      label: 'League',
      labelColor: 'text-purple-600'
    }
  };

  const config = typeConfig[game.game_type] || typeConfig.game;

  // Build title
  let title = game.name;
  if (game.game_type === 'game' && gameTeam.opponent) {
    title = `vs ${gameTeam.opponent}`;
  }

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
            {formatDate(game.date)}
          </span>
          <span className={`text-[0.6rem] font-mono uppercase tracking-widest ${config.labelColor}`}>
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-medium text-neutral-800 mb-1.5 leading-snug">
          {title}
        </h4>

        {/* Details */}
        {(game.start_time || game.location) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-neutral-500">
            {game.start_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {formatTime(game.start_time)}
              </span>
            )}
            {game.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {game.location}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <InteriorLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-tne-red animate-spin mb-4" />
        <p className="text-neutral-500">Loading team...</p>
      </div>
    </InteriorLayout>
  );
}

function NotFoundState() {
  return (
    <InteriorLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">Team Not Found</h2>
        <p className="text-neutral-500 mb-6">The team you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Link>
      </div>
    </InteriorLayout>
  );
}

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { team, roster, schedule, loading, error } = usePublicTeamDetail(teamId);
  const { practices } = usePracticeSchedule(teamId);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !team) {
    return <NotFoundState />;
  }

  const playerCount = roster.length;
  const teamType = getTeamType(team);
  const coachName = formatCoachName(team.head_coach);

  // Format grade for display
  const gradeDisplay = team.grade_level.includes('th')
    ? `${team.grade_level} Grade`
    : team.grade_level;

  // Practice info
  const practiceInfo = [
    team.practice_days,
    team.practice_time
  ].filter(Boolean).join(' ');

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
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-white/70">{gradeDisplay}</span>
              </div>
              <div className="inline-flex items-center rounded-sm border border-tne-red/30 bg-tne-red/10 px-2.5 py-1">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-red-300">{teamType}</span>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {team.name}
              </h1>
              <p className="mt-3 text-base text-white/50 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{coachName}</span>
                {team.practice_location && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{team.practice_location}</span>
                  </>
                )}
                {practiceInfo && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{practiceInfo}</span>
                  </>
                )}
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
                    {playerCount} player{playerCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Player List */}
                <div className="px-5 py-2">
                  {roster.length > 0 ? (
                    roster.map((entry, index) => (
                      <PlayerRow
                        key={entry.id}
                        player={entry.player}
                        rosterEntry={entry}
                        index={index}
                        isLast={index === roster.length - 1}
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
                  {schedule.length > 0 ? (
                    schedule.map((gameTeam, index) => (
                      <ScheduleItem
                        key={gameTeam.id}
                        gameTeam={gameTeam}
                        index={index}
                        isLast={index === schedule.length - 1}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <CalendarDays className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Practice Schedule */}
              {practices.length > 0 && (
                <div className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <h2 className="font-semibold text-neutral-900">Practice Schedule</h2>
                  </div>

                  {/* Practice List */}
                  <div className="px-5 py-4 space-y-3">
                    {practices.map((practice) => (
                      <div key={practice.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">
                            {formatPracticeSession(practice)}
                          </p>
                          {practice.notes && (
                            <p className="text-xs text-neutral-500 mt-0.5">{practice.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    {coachName}
                  </h3>
                  {team.head_coach?.bio && (
                    <p className="text-sm text-neutral-500 mb-4">
                      {team.head_coach.bio}
                    </p>
                  )}

                  {!team.head_coach?.bio && (
                    <p className="text-sm text-neutral-400 italic">
                      Coach information coming soon
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle,
  Dumbbell,
  Trophy,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import { usePublicTeamDetail } from '@/hooks/usePublicTeamDetail';

// Format date for display (e.g., "Sat Dec 28")
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
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
  if (!coach) return null;
  if (coach.first_name === 'Coach') {
    return `Coach ${coach.last_name}`;
  }
  return `Coach ${coach.first_name} ${coach.last_name}`;
}

// Capitalize day of week
function formatDay(day) {
  if (!day) return '';
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

/* ─── Empty State ─── */
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-neutral-300" />
      </div>
      <p className="text-sm text-neutral-400 text-center max-w-[240px] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function SectionCard({ children }) {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden">
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-neutral-400" />
        <h2 className="font-semibold text-neutral-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ─── Player Row ─── */
function PlayerRow({ player, rosterEntry, index, isLast }) {
  const jerseyNumber = rosterEntry.jersey_number || player.jersey_number || '—';
  const playerName = `${player.first_name} ${player.last_name}`;
  const gradYear = player.graduating_year;
  const hasNote = !!rosterEntry.notes;

  return (
    <div
      className={`group flex items-center gap-4 py-4 ${!isLast ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50/50 -mx-4 px-4 transition-colors`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white font-bebas text-lg tracking-wide rounded-lg">
        {jerseyNumber}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 group-hover:text-tne-red transition-colors">
          {hasNote && <span className="text-tne-red">* </span>}
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

/* ─── Practice Item ─── */
function PracticeItem({ practice, isLast }) {
  return (
    <div className={`flex items-start gap-4 py-4 ${!isLast ? 'border-b border-neutral-100' : ''}`}>
      <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-2xl flex-shrink-0">
        <Dumbbell className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 text-sm">
          {formatDay(practice.dayOfWeek || practice.day_of_week)}
        </h4>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[0.8rem] text-neutral-500">
          {(practice.startTime || practice.start_time) && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatTime(practice.startTime || practice.start_time)}
              {(practice.endTime || practice.end_time) && ` – ${formatTime(practice.endTime || practice.end_time)}`}
            </span>
          )}
          {practice.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {practice.location}
            </span>
          )}
        </div>
        {practice.notes && (
          <p className="mt-1 text-xs text-neutral-400">{practice.notes}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Schedule Item ─── */
function ScheduleItem({ item, index, isLast }) {
  // Handle both event and game formats from the schedule API
  const isTournament = item.type === 'tournament' || item.event_type === 'tournament';
  const isGame = item.type === 'game' || item.event_type === 'game';

  const typeConfig = {
    practice: { color: 'bg-emerald-500', label: 'Practice', labelColor: 'text-emerald-600' },
    game: { color: 'bg-blue-500', label: 'Game', labelColor: 'text-blue-600' },
    tournament: { color: 'bg-tne-red', label: 'Tournament', labelColor: 'text-tne-red' },
    league: { color: 'bg-purple-500', label: 'League', labelColor: 'text-purple-600' },
    event: { color: 'bg-amber-500', label: 'Event', labelColor: 'text-amber-600' },
  };

  const eventType = item.event_type || item.type || 'event';
  const config = typeConfig[eventType] || typeConfig.event;

  const title = item.title || item.name;
  const location = item.location;
  const startTime = item.start_time;

  const content = (
    <div
      className={`relative pl-6 group ${isTournament ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 group-first:top-3 group-last:bottom-auto group-last:h-3" />
      {/* Timeline dot */}
      <div className={`absolute left-0 top-3 w-2 h-2 -translate-x-[3px] rounded-full ${config.color} ring-4 ring-white`} />

      <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[0.7rem] font-mono font-semibold text-neutral-900 uppercase tracking-wider">
            {formatDate(item.date)}
          </span>
          <span className={`text-[0.6rem] font-mono uppercase tracking-widest ${config.labelColor}`}>
            {config.label}
          </span>
        </div>

        <h4 className={`font-medium text-neutral-800 mb-1.5 leading-snug ${isTournament ? 'group-hover:text-tne-red transition-colors' : ''}`}>
          {title}
          {isTournament && (
            <ChevronRight className="inline w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </h4>

        {(startTime || location) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-neutral-500">
            {startTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {formatTime(startTime)}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Tournaments link to their detail page
  if (isTournament) {
    return (
      <Link href={`/tournaments/${item.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

/* ─── Loading State ─── */
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

/* ─── Not Found State ─── */
function NotFoundState() {
  return (
    <InteriorLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">Team Not Found</h2>
        <p className="text-neutral-500 mb-6">The team you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Link>
      </div>
    </InteriorLayout>
  );
}

/* ─── Main Component ─── */
export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { team, roster, schedule, practices, loading, error } = usePublicTeamDetail(teamId);

  if (loading) return <LoadingState />;
  if (error || !team) return <NotFoundState />;

  const teamType = getTeamType(team);
  const coachName = formatCoachName(team.head_coach);
  const rosterCount = team.roster_count || roster.length;

  const gradeDisplay = team.grade_level?.includes('th')
    ? `${team.grade_level} Grade`
    : team.grade_level;

  return (
    <InteriorLayout>
      {/* ─── Hero Header ─── */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-10 sm:pb-12 max-w-6xl mx-auto pt-8 px-4 pb-8 relative">
          <div className="flex flex-col gap-5 animate-enter">
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Teams
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-sm bg-white/5 border border-white/10 px-2.5 py-1">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-white/70">{gradeDisplay}</span>
              </div>
              <div className="inline-flex items-center rounded-sm border border-tne-red/30 bg-tne-red/10 px-2.5 py-1">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-red-300">{teamType}</span>
              </div>
              {team.season && (
                <div className="inline-flex items-center rounded-sm bg-white/5 border border-white/10 px-2.5 py-1">
                  <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-white/70">{team.season.name}</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                {team.name}
              </h1>
              <p className="mt-3 text-base text-white/50 flex flex-wrap items-center gap-x-3 gap-y-1">
                {coachName && <span>{coachName}</span>}
                {!coachName && <span className="italic">Coach TBA</span>}
                {team.practice_location && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{team.practice_location}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* ─── Left Column ─── */}
            <div className="lg:col-span-7 space-y-8">
              {/* Roster */}
              <SectionCard>
                <SectionHeader
                  icon={Users}
                  title="Roster"
                  action={
                    rosterCount > 0 && (
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                        {rosterCount} player{rosterCount !== 1 ? 's' : ''}
                      </span>
                    )
                  }
                />
                <div className="px-5 py-2">
                  {roster.length > 0 ? (
                    <>
                      {roster.map((entry, index) => (
                        <PlayerRow
                          key={entry.id}
                          player={entry.player}
                          rosterEntry={entry}
                          index={index}
                          isLast={index === roster.length - 1}
                        />
                      ))}
                      {/* Roster footnotes */}
                      {(() => {
                        const uniqueNotes = [...new Set(roster.filter(e => e.notes).map(e => e.notes))];
                        if (uniqueNotes.length === 0) return null;
                        return (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            {uniqueNotes.map((note, i) => (
                              <p key={i} className="text-xs text-neutral-400 leading-relaxed">
                                <span className="text-tne-red font-medium">*</span> {note}
                              </p>
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <EmptyState
                      icon={Users}
                      message="Roster will be announced soon"
                    />
                  )}
                </div>
              </SectionCard>

              {/* Tournament & Game Schedule */}
              <SectionCard>
                <SectionHeader
                  icon={CalendarDays}
                  title="Schedule"
                  action={
                    <Link
                      href="/schedule"
                      className="inline-flex items-center gap-1 text-xs font-medium text-tne-red hover:text-tne-red-dark transition-colors group"
                    >
                      Full Schedule
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  }
                />
                <div className="px-5 py-5">
                  {schedule.length > 0 ? (
                    schedule.map((item, index) => (
                      <ScheduleItem
                        key={item.id}
                        item={item}
                        index={index}
                        isLast={index === schedule.length - 1}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Trophy}
                      message="Tournament schedule coming soon — check back as the season approaches"
                    />
                  )}
                </div>
              </SectionCard>
            </div>

            {/* ─── Right Column ─── */}
            <div className="lg:col-span-5 space-y-8">
              {/* Practice Schedule */}
              <SectionCard>
                <SectionHeader icon={Dumbbell} title="Practice Schedule" />
                <div className="px-5 py-2">
                  {practices.length > 0 ? (
                    practices.map((practice, index) => (
                      <PracticeItem
                        key={practice.id}
                        practice={practice}
                        isLast={index === practices.length - 1}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Dumbbell}
                      message="Practice schedule will be posted once the season begins"
                    />
                  )}
                </div>
              </SectionCard>

              {/* Coach */}
              <SectionCard>
                <div className="px-5 py-4 bg-neutral-900 flex items-center gap-3 rounded-t-3xl">
                  <Award className="w-4 h-4 text-tne-red" />
                  <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Coach</h2>
                </div>
                <div className="px-5 py-5">
                  {team.head_coach ? (
                    <>
                      <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                        {coachName}
                      </h3>
                      {team.head_coach.bio ? (
                        <p className="text-sm text-neutral-500 leading-relaxed">
                          {team.head_coach.bio}
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-400 italic">
                          Coach bio coming soon
                        </p>
                      )}
                      {team.assistant_coach && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                          <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                            Assistant Coach
                          </p>
                          <p className="text-sm font-medium text-neutral-700">
                            {formatCoachName(team.assistant_coach)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      icon={Award}
                      message="Coach assignment coming soon"
                    />
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

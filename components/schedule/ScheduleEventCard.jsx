import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}.${Math.round(mins / 6)} hours`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${mins} min`;
}

export default function ScheduleEventCard({ event }) {
  const { event_type, start_time, end_time, location, opponent, team } = event;

  const isGame = event_type === 'game';

  const typeStyles = {
    practice: 'bg-blue-100 text-blue-700',
    game: 'bg-tne-red/10 text-tne-red',
    tournament: 'bg-amber-100 text-amber-700',
  };

  const typeLabel = event_type.charAt(0).toUpperCase() + event_type.slice(1);
  const gradeLabel = team?.grade_level ? `${team.grade_level}th Grade` : '';

  return (
    <div className="px-5 py-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors">
      <div className="flex-shrink-0 w-16 text-center">
        <span className="text-sm font-semibold text-neutral-900">
          {formatTime(start_time)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${typeStyles[event_type] || 'bg-neutral-100 text-neutral-700'}`}
          >
            {typeLabel}
          </span>
          {gradeLabel && (
            <span className="text-[0.7rem] font-mono text-neutral-500">
              {gradeLabel}
            </span>
          )}
        </div>

        <p className="font-medium text-neutral-900">
          {team?.name}
          {isGame && opponent && ` vs ${opponent}`}
        </p>

        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          )}
          {start_time && end_time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {calculateDuration(start_time, end_time)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <Link
          href={`/teams/${team?.id}`}
          className="text-xs font-medium text-tne-red hover:text-tne-red-dark"
        >
          View team
        </Link>
      </div>
    </div>
  );
}

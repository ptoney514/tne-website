'use client';

import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { parseSessionGrades, getGradeColor } from '@/lib/tryout-utils';

const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthAbbrevs = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function TryoutSessionRow({ session, onClick }) {
  const [hovered, setHovered] = useState(false);

  const sessionDate = session.date || session.session_date || null;
  const startTime = session.start_time || session.startTime || null;
  const endTime = session.end_time || session.endTime || null;
  const gradeLevels = session.grade_levels || session.grades || [];

  const parsedDate = sessionDate ? new Date(`${sessionDate}T00:00:00`) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const dayName = hasValidDate ? dayAbbrevs[parsedDate.getDay()] : '--';
  const shortMonth = hasValidDate ? monthAbbrevs[parsedDate.getMonth()] : '--';
  const dayNum = hasValidDate ? parsedDate.getDate() : '--';

  const { grades, genderLabel } = parseSessionGrades(gradeLevels, session.gender);
  const isFull = session.is_full;
  const isAllGrades = grades.length > 4;

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(session)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(session)}
      className={`grid grid-cols-[64px_1fr] sm:grid-cols-[72px_1fr_auto] items-center gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-[18px] rounded-2xl border border-neutral-200 bg-white cursor-pointer transition-all ${
        hovered ? 'shadow-md -translate-y-px' : 'shadow-sm'
      }`}
    >
      {/* Date block */}
      <div className="flex flex-col items-center justify-center bg-neutral-900 rounded-xl py-2.5 px-2 min-w-[56px] sm:min-w-[64px]">
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider font-mono">
          {shortMonth}
        </span>
        <span className="text-2xl sm:text-[26px] font-extrabold text-white leading-tight">
          {dayNum}
        </span>
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">
          {dayName}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isAllGrades ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              All Grades (3rd – 8th){genderLabel ? ` ${genderLabel}` : ''}
            </span>
          ) : (
            grades.map((grade) => {
              const color = getGradeColor(grade);
              return (
                <span
                  key={grade}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}
                >
                  {grade} Grade{genderLabel ? ` ${genderLabel}` : ''}
                </span>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-4 text-[13px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {formatTime(startTime)} – {formatTime(endTime)}
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{session.location}</span>
          </span>
        </div>

        {/* Mobile action row */}
        <div className="flex items-center gap-3 sm:hidden mt-1">
          {isFull ? (
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Full
            </span>
          ) : (
            <span className="text-xs font-medium text-tne-red">
              Register →
            </span>
          )}
        </div>
      </div>

      {/* Desktop action */}
      <div className="hidden sm:flex items-center">
        {isFull ? (
          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Full
          </span>
        ) : (
          <span
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
              hovered
                ? 'bg-red-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            Register
          </span>
        )}
      </div>
    </div>
  );
}

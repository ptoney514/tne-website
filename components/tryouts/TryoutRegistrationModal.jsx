'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import TryoutRegistrationForm from './TryoutRegistrationForm';
import { parseSessionGrades, getGradeColor } from '@/lib/tryout-utils';

const monthAbbrevs = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function TryoutRegistrationModal({
  isOpen,
  session,
  onClose,
  onSubmit,
  submitting,
  submitSuccess,
  submitError,
  onReset,
}) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sessionDate = session?.date || session?.session_date || null;
  const startTime = session?.start_time || session?.startTime || null;
  const endTime = session?.end_time || session?.endTime || null;
  const gradeLevels = session?.grade_levels || session?.grades || [];

  const parsedDate = sessionDate ? new Date(`${sessionDate}T00:00:00`) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const shortMonth = hasValidDate ? monthAbbrevs[parsedDate.getMonth()] : '--';
  const dayNum = hasValidDate ? parsedDate.getDate() : '--';
  const dayName = hasValidDate ? dayAbbrevs[parsedDate.getDay()] : '--';

  const { grades, genderLabel } = parseSessionGrades(gradeLevels, session?.gender);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark header with session info */}
        <div className="bg-neutral-900 px-6 sm:px-7 py-6 rounded-t-3xl flex justify-between items-start">
          <div>
            <p className="text-[11px] font-bold text-red-500 tracking-[0.12em] uppercase mb-2">
              {genderLabel ? `${genderLabel} Tryouts` : 'Tryouts'}
              {session?.season?.name ? ` · ${session.season.name}` : ''}
            </p>
            <h3 className="text-xl font-bold text-white mb-1">
              {shortMonth} {dayNum} · {dayName}
            </h3>
            <p className="text-[13px] text-white/50">
              {formatTime(startTime)} – {formatTime(endTime)} · {session?.location}
            </p>
            {grades.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {grades.length > 4 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                    All Grades (3rd – 8th){genderLabel ? ` ${genderLabel}` : ''}
                  </span>
                ) : (
                  grades.map((grade) => {
                    const color = getGradeColor(grade);
                    return (
                      <span
                        key={grade}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}
                      >
                        {grade} Grade
                      </span>
                    );
                  })
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0 ml-4"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div>
          <TryoutRegistrationForm
            selectedSession={session}
            onSubmit={onSubmit}
            submitting={submitting}
            submitSuccess={submitSuccess}
            submitError={submitError}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  );
}

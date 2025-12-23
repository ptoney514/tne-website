import { MapPin, ArrowRight } from 'lucide-react';

const fullDayNames = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const monthNames = [
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

export default function TryoutSessionCard({ session, onRegister }) {
  const date = new Date(session.session_date + 'T00:00:00');
  const dayName = fullDayNames[date.getDay()];
  const shortMonth = monthNames[date.getMonth()];
  const dayNum = date.getDate();

  const isSpecialGrade = session.grades === '8th';
  const bgColor = isSpecialGrade ? 'bg-neutral-800' : 'bg-tne-red';

  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className={`${bgColor} text-white px-5 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
              <div className="text-center">
                <span className="block text-[0.6rem] font-mono uppercase tracking-wider">
                  {shortMonth}
                </span>
                <span className="block text-lg font-bold leading-none">
                  {dayNum}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold">{dayName}</p>
              <p className="text-xs text-white/80">
                {formatTime(session.start_time)} - {formatTime(session.end_time)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
            {session.grades === '8th' ? '8th Grade' : 'Open'}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="font-medium text-neutral-900">{session.description}</p>
          <p className="text-sm text-neutral-600">{session.notes}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{session.location}</span>
        </div>
        <button
          onClick={() => onRegister(session)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-tne-red hover:text-tne-red-dark"
        >
          Register Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import ScheduleEventCard from './ScheduleEventCard';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateHeader(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[date.getMonth()];
  const dayNum = date.getDate();
  return {
    shortDay: dayName,
    dayNum,
    fullDate: `${dayName === 'Sun' ? 'Sunday' : dayName === 'Mon' ? 'Monday' : dayName === 'Tue' ? 'Tuesday' : dayName === 'Wed' ? 'Wednesday' : dayName === 'Thu' ? 'Thursday' : dayName === 'Fri' ? 'Friday' : 'Saturday'}, ${monthName} ${dayNum}`,
  };
}

function hasGameDay(events) {
  return events.some((e) => e.event_type === 'game');
}

export default function ScheduleDayGroup({ date, events }) {
  const { shortDay, dayNum, fullDate } = formatDateHeader(date);
  const isGameDay = hasGameDay(events);

  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="bg-neutral-100 border-b border-neutral-200 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-white ${
              isGameDay ? 'bg-tne-red' : 'bg-neutral-900'
            }`}
          >
            <div className="text-center">
              <span className="block text-[0.6rem] font-mono uppercase tracking-wider">
                {shortDay}
              </span>
              <span className="block text-sm font-bold leading-none">
                {dayNum}
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {fullDate}
          </span>
          {isGameDay && (
            <span className="inline-flex items-center rounded-full bg-tne-red/10 text-tne-red px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
              Game Day
            </span>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="divide-y divide-neutral-100">
        {events.map((event) => (
          <ScheduleEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

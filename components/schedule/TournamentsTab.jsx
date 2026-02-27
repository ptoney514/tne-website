import { CalendarDays } from 'lucide-react';

export default function TournamentsTab() {
  return (
    <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
      <div className="px-8 py-16 sm:py-20 text-center">
        <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
          <CalendarDays className="w-7 h-7 text-neutral-400" />
        </div>
        <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
          Tournament Schedule Coming Soon
        </h3>
        <p className="text-base text-neutral-500 max-w-md mx-auto">
          The tournament schedule will be updated soon. Check back for upcoming events and details.
        </p>
      </div>
    </div>
  );
}

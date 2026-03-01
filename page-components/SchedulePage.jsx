import { Suspense } from 'react';
import TournamentHub from '@/page-components/TournamentHub';

function ScheduleLoading() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero skeleton */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="h-10 w-64 bg-white/10 rounded-lg mx-auto animate-pulse" />
          <div className="h-5 w-96 bg-white/5 rounded-lg mx-auto animate-pulse" />
        </div>
      </div>

      {/* List skeleton */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          >
            <div className="w-[52px] h-14 rounded-lg bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="h-3 w-64 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<ScheduleLoading />}>
      <TournamentHub />
    </Suspense>
  );
}

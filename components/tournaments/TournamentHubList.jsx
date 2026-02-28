'use client';

import { Search, Info } from 'lucide-react';
import TournamentCard from './TournamentCard';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-200">
      <div className="w-12 h-14 rounded-lg bg-neutral-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
      </div>
      <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
    </div>
  );
}

export default function TournamentHubList({ tournaments, loading, onTournamentClick }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div>
        <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-8 py-16 sm:py-20 text-center">
            <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <Search className="w-7 h-7 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
              No tournaments found
            </h3>
            <p className="text-base text-neutral-500 max-w-md mx-auto">
              Try adjusting your filters to see more tournaments.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {tournaments.map((tournament, index) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            index={index}
            onClick={onTournamentClick}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-xs text-neutral-400 mt-6">
      <Info className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Schedules and tournament details are subject to change. Check back for updates.</span>
    </div>
  );
}

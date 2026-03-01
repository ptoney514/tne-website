'use client';

import { ArrowLeft, Trophy } from 'lucide-react';
import TournamentHubDetailHero from './TournamentHubDetailHero';
import TournamentDetailContent from './TournamentDetailContent';
import { useTournamentDetail } from '@/hooks/useTournamentDetail';

export default function TournamentHubDetail({ id, onBack }) {
  const { data, loading, error } = useTournamentDetail(id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
          <p className="text-neutral-500">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Tournament Not Found</h2>
          <p className="text-neutral-500 mb-6">
            This tournament doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tne-red text-white rounded-lg hover:bg-tne-red-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const { tournament, teams, venue, details, hotels, attractions, restaurants } = data;

  return (
    <>
      <TournamentHubDetailHero
        tournament={tournament}
        details={details}
        venue={venue}
        teams={teams}
        onBack={onBack}
      />

      <main className="flex-1 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <TournamentDetailContent
            tournament={tournament}
            teams={teams}
            venue={venue}
            details={details}
            hotels={hotels}
            attractions={attractions}
            restaurants={restaurants}
          />
        </div>
      </main>
    </>
  );
}

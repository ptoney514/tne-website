'use client';

import { ArrowLeft, MapPin, Users, Trophy } from 'lucide-react';
import { formatDateRange } from '@/lib/tournament-utils';

export default function TournamentHubDetailHero({ tournament, details, venue, teams, onBack }) {
  const locationDisplay = venue?.city
    ? `${venue.city}, ${venue.state || ''}`
    : tournament.location || '';

  const teamCount = details?.totalTeams || teams?.length || 0;

  return (
    <header className="relative border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 relative">
        {/* Back link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        {/* Date */}
        <p className="text-tne-red uppercase text-sm font-bold tracking-wider mb-3">
          {formatDateRange(tournament.date, tournament.endDate)}
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
          {tournament.name}
        </h1>

        {/* Subtitle */}
        {(details?.divisionCount || teamCount > 0) && (
          <p className="text-white/70 text-lg mb-0">
            {[
              details?.divisionCount && `${details.divisionCount} Divisions`,
              teamCount > 0 && `${teamCount} Teams`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 text-white/80 pt-6 mt-6 border-t border-white/10">
          {locationDisplay && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white/50" />
              <span>{locationDisplay}</span>
            </div>
          )}
          {teamCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/50" />
              <span>{teamCount} Teams</span>
            </div>
          )}
          {details?.divisionCount && (
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-white/50" />
              <span>{details.divisionCount} Divisions</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

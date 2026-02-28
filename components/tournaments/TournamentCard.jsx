'use client';

import { MapPin, Car, Users, ChevronRight } from 'lucide-react';
import { formatShortDate, derivePrograms } from '@/lib/tournament-utils';

export default function TournamentCard({ tournament, index, onClick }) {
  const { month, day, endDay } = formatShortDate(tournament.date, tournament.endDate);
  const programs = derivePrograms(tournament.teams || []);

  const programLabel =
    programs.length === 2
      ? 'Boys & Girls'
      : programs[0] === 'boys'
        ? 'Boys'
        : programs[0] === 'girls'
          ? 'Girls'
          : null;

  const location =
    tournament.venue
      ? `${tournament.venue.city}, ${tournament.venue.state}`
      : tournament.location;

  const teamsCount = tournament.teams?.length || tournament.totalTeams || 0;

  return (
    <button
      type="button"
      onClick={() => onClick(tournament.id)}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-200 cursor-pointer transition-all hover:pl-6 hover:shadow-md group text-left w-full animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Date block */}
      <div className="w-[52px] flex-shrink-0 text-center">
        <div className="text-tne-red uppercase text-[10px] font-bold tracking-wide">
          {month}
        </div>
        <div className="text-2xl font-extrabold text-neutral-900 leading-none">
          {day}
        </div>
        {endDay && (
          <div className="text-xs text-neutral-400">- {endDay}</div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Flags */}
        <div className="flex gap-2 mb-1">
          {tournament.isFeatured && (
            <span className="px-2 py-0.5 rounded-full bg-tne-red text-white text-[10px] font-bold uppercase tracking-wider">
              Featured
            </span>
          )}
          {programLabel && (
            <span className="px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-500 text-[10px] font-medium uppercase tracking-wider">
              {programLabel}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="text-[15px] font-bold text-neutral-900 truncate">
          {tournament.name}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
          {tournament.driveTime && (
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />
              {tournament.driveTime}
            </span>
          )}
          {teamsCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {teamsCount} {teamsCount === 1 ? 'team' : 'teams'}
            </span>
          )}
          {tournament.hasTeamRate && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-medium">
              Team rate
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-tne-red flex items-center justify-center transition-colors flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  );
}

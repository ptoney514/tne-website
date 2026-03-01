import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Users,
  Trophy,
  Ticket,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import TournamentDetailContent from '@/components/tournaments/TournamentDetailContent';
import { useTournamentDetail } from '@/hooks/useTournamentDetail';
import { formatDateRange } from '@/lib/tournament-utils';

export default function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const { data, loading, error } = useTournamentDetail(tournamentId);

  if (loading) {
    return (
      <InteriorLayout>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
            <p className="text-neutral-500">Loading tournament details...</p>
          </div>
        </div>
      </InteriorLayout>
    );
  }

  if (error || !data) {
    return (
      <InteriorLayout>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Tournament Not Found</h2>
            <p className="text-neutral-500 mb-6">This tournament doesn&apos;t exist or has been removed.</p>
            <Link
              href="/schedule#tournaments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tne-red text-white rounded-lg hover:bg-tne-red-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </Link>
          </div>
        </div>
      </InteriorLayout>
    );
  }

  const { tournament, teams, venue, details, hotels, attractions, restaurants } = data;

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 relative">
          {/* Back Link */}
          <Link
            href="/schedule#tournaments"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-tne-red text-white text-xs font-medium uppercase tracking-wide">
              {formatDateRange(tournament.date, tournament.endDate)}
            </span>
            {tournament.isFeatured && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium uppercase tracking-wide border border-amber-500/20">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
            {tournament.name}
          </h1>

          {/* Description */}
          {details?.description && (
            <p className="text-white/70 text-lg max-w-2xl mb-6">
              {details.description}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white/50" />
              <span>{venue?.city || tournament.location}{venue?.state ? `, ${venue.state}` : ''}</span>
            </div>
            {(details?.totalTeams || teams.length > 0) && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/50" />
                <span>{details?.totalTeams || teams.length} Teams</span>
              </div>
            )}
            {details?.divisionCount && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-white/50" />
                <span>{details.divisionCount} Divisions</span>
              </div>
            )}
            {details?.entryFee && (
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-white/50" />
                <span>${details.entryFee} Entry Fee</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
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
    </InteriorLayout>
  );
}

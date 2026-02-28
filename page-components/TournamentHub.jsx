'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import TournamentHubHero from '@/components/tournaments/TournamentHubHero';
import TournamentHubFilters from '@/components/tournaments/TournamentHubFilters';
import TournamentHubList from '@/components/tournaments/TournamentHubList';
import TournamentHubDetail from '@/components/tournaments/TournamentHubDetail';
import { useTournaments } from '@/hooks/useTournamentDetail';
import { usePublicSeasons } from '@/hooks/usePublicSeasons';
import { derivePrograms } from '@/lib/tournament-utils';

export default function TournamentHub() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const { seasons, selectedSeasonId, setSelectedSeasonId, loading: seasonsLoading } =
    usePublicSeasons();

  const [programFilter, setProgramFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState(null);

  // Sync selectedTournamentId from URL
  const selectedTournamentId = searchParams.get('tournament') || null;

  const setSelectedTournamentId = useCallback(
    (id) => {
      if (id) {
        router.push(`/schedule?tournament=${id}`, { scroll: false });
      } else {
        router.push('/schedule', { scroll: false });
      }
    },
    [router]
  );

  // Group tournaments by season for counts
  const tournamentCountBySeason = useMemo(() => {
    const counts = new Map();
    for (const t of tournaments) {
      counts.set(t.seasonId, (counts.get(t.seasonId) || 0) + 1);
    }
    return counts;
  }, [tournaments]);

  // Filtered tournaments
  const filteredTournaments = useMemo(() => {
    let result = tournaments;

    // Season filter
    if (selectedSeasonId) {
      result = result.filter((t) => t.seasonId === selectedSeasonId);
    }

    // Program filter
    if (programFilter !== 'all') {
      result = result.filter((t) => {
        const programs = derivePrograms(t.teams || []);
        return programs.includes(programFilter);
      });
    }

    // Team filter
    if (teamFilter) {
      result = result.filter((t) =>
        t.teams?.some((team) => team.id === teamFilter)
      );
    }

    return result;
  }, [tournaments, selectedSeasonId, programFilter, teamFilter]);

  // Deduplicated teams across all tournaments (for the filter dropdown)
  const allTeams = useMemo(() => {
    const teamMap = new Map();
    for (const t of tournaments) {
      for (const team of t.teams || []) {
        if (!teamMap.has(team.id)) {
          teamMap.set(team.id, team);
        }
      }
    }
    return Array.from(teamMap.values());
  }, [tournaments]);

  // Conflict resolution: selecting a team resets program to "All"
  const handleTeamChange = useCallback((id) => {
    setTeamFilter(id);
    if (id) {
      setProgramFilter('all');
    }
  }, []);

  // Selecting a conflicting program clears team filter
  const handleProgramChange = useCallback(
    (program) => {
      setProgramFilter(program);
      if (program !== 'all' && teamFilter) {
        // Check if the selected team matches the new program
        const team = allTeams.find((t) => t.id === teamFilter);
        if (team) {
          const teamProgram = team.gender === 'male' ? 'boys' : 'girls';
          if (teamProgram !== program) {
            setTeamFilter(null);
          }
        }
      }
    },
    [teamFilter, allTeams]
  );

  const handleTournamentClick = useCallback(
    (id) => {
      setSelectedTournamentId(id);
      window.scrollTo(0, 0);
    },
    [setSelectedTournamentId]
  );

  const handleBack = useCallback(() => {
    setSelectedTournamentId(null);
    window.scrollTo(0, 0);
  }, [setSelectedTournamentId]);

  // Scroll to top on view transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedTournamentId]);

  // Detail view
  if (selectedTournamentId) {
    return (
      <InteriorLayout>
        <TournamentHubDetail id={selectedTournamentId} onBack={handleBack} />
      </InteriorLayout>
    );
  }

  const loading = tournamentsLoading || seasonsLoading;

  return (
    <InteriorLayout>
      <TournamentHubHero
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSeasonChange={setSelectedSeasonId}
        tournamentCountBySeason={tournamentCountBySeason}
      />

      <TournamentHubFilters
        programFilter={programFilter}
        onProgramChange={handleProgramChange}
        teamFilter={teamFilter}
        onTeamChange={handleTeamChange}
        allTeams={allTeams}
      />

      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <TournamentHubList
            tournaments={filteredTournaments}
            loading={loading}
            onTournamentClick={handleTournamentClick}
          />
        </section>
      </main>
    </InteriorLayout>
  );
}

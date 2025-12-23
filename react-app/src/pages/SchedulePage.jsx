import { useState, useEffect, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import PublicLayout from '../components/layouts/PublicLayout';
import ScheduleFilters from '../components/schedule/ScheduleFilters';
import ScheduleDayGroup from '../components/schedule/ScheduleDayGroup';
import TournamentsTab from '../components/schedule/TournamentsTab';
import { useEvents } from '../hooks/useEvents';

export default function SchedulePage() {
  const { events, loading, groupByDate } = useEvents();

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTeam, setActiveTeam] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTournaments, setShowTournaments] = useState(false);

  // Handle hash changes for direct linking to tournaments
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#tournaments') {
        setShowTournaments(true);
        setActiveFilter('tournament');
      } else {
        setShowTournaments(false);
        if (activeFilter === 'tournament') {
          setActiveFilter('all');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeFilter]);

  // Handle filter changes
  const handleFilterChange = (filter) => {
    if (filter === 'tournament') {
      setShowTournaments(true);
      window.location.hash = 'tournaments';
    } else {
      setShowTournaments(false);
      if (window.location.hash === '#tournaments') {
        window.history.pushState('', document.title, window.location.pathname);
      }
    }
    setActiveFilter(filter);
  };

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by type
    if (activeFilter !== 'all' && activeFilter !== 'tournament') {
      filtered = filtered.filter((e) => e.event_type === activeFilter);
    }

    // Filter by team
    if (activeTeam !== 'all') {
      // Simple team matching - can be enhanced
      filtered = filtered.filter((e) =>
        e.team?.name?.toLowerCase().includes(activeTeam.replace('-', ' '))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.team?.name?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query) ||
          e.opponent?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, activeFilter, activeTeam, searchQuery]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    return groupByDate(filteredEvents);
  }, [filteredEvents, groupByDate]);

  // Sort dates
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort();
  }, [groupedEvents]);

  // Group dates by week
  const getWeekLabel = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);

    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    if (date >= startOfWeek && date <= endOfWeek) {
      return {
        label: 'This Week',
        range: `${formatShortDate(startOfWeek)} - ${formatShortDate(endOfWeek)}`,
      };
    } else if (date >= startOfNextWeek && date <= endOfNextWeek) {
      return {
        label: 'Next Week',
        range: `${formatShortDate(startOfNextWeek)} - ${formatShortDate(endOfNextWeek)}`,
      };
    } else {
      return {
        label: 'Upcoming',
        range: '',
      };
    }
  };

  const formatShortDate = (date) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 mix-blend-screen">
          <img
            src="https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-full border border-tne-red/30 bg-tne-red/10 px-3 py-1 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-tne-red shadow-[0_0_12px_rgba(227,24,55,0.9)]" />
              <span className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-red-300">
                2025-26 Season
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Schedule & Tournaments
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Find your team's practices, games, and tournaments all in one
                place. Filter by team or date to see what's coming up.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center text-xs sm:text-sm text-white/70">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem]">
                  Season Active
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-white/60">
                <CalendarDays className="w-4 h-4" />
                <span>Updated weekly with practices and game times</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-enter {
            animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-12 sm:pb-16 space-y-6 sm:space-y-8">
          {/* Filters */}
          <ScheduleFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            activeTeam={activeTeam}
            onTeamChange={setActiveTeam}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Content */}
          {showTournaments ? (
            <TournamentsTab />
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="rounded-3xl bg-white border border-neutral-200 p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-tne-red rounded-full mx-auto mb-4" />
                  <p className="text-neutral-500">Loading schedule...</p>
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="rounded-3xl bg-white border border-neutral-200 p-8 text-center">
                  <CalendarDays className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    No events found
                  </h3>
                  <p className="text-neutral-500">
                    {searchQuery
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for upcoming events'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Group by week */}
                  {(() => {
                    let currentWeek = null;
                    return sortedDates.map((date) => {
                      const weekInfo = getWeekLabel(date);
                      const showWeekHeader = weekInfo.label !== currentWeek;
                      currentWeek = weekInfo.label;

                      return (
                        <div key={date}>
                          {showWeekHeader && (
                            <div className="flex items-center gap-2 mb-3">
                              <h2 className="text-lg font-semibold text-neutral-900">
                                {weekInfo.label}
                              </h2>
                              {weekInfo.range && (
                                <span className="text-xs text-neutral-500 font-mono">
                                  {weekInfo.range}
                                </span>
                              )}
                            </div>
                          )}
                          <ScheduleDayGroup
                            date={date}
                            events={groupedEvents[date]}
                          />
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}

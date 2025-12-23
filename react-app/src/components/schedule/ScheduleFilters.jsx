import { List, Calendar, Search } from 'lucide-react';

const filterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'practice', label: 'Practices' },
  { value: 'game', label: 'Games' },
  { value: 'tournament', label: 'Tournaments' },
];

const teamOptions = [
  { value: 'all', label: 'All Teams' },
  { value: '4th-foster', label: '4th Grade - Foster' },
  { value: '4th-grisby', label: '4th Grade - Grisby/Evans' },
  { value: '5th-perry', label: '5th Grade - Perry' },
  { value: '6th-todd', label: '6th Grade - Todd' },
  { value: '7th-mitchell', label: '7th Grade - Mitchell' },
  { value: '8th-johnson', label: '8th Grade - Johnson' },
];

export default function ScheduleFilters({
  activeFilter,
  onFilterChange,
  activeTeam,
  onTeamChange,
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  showViewToggle = true,
}) {
  return (
    <>
      {/* Desktop Controls */}
      <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm px-3 py-2 sm:px-4 sm:py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex items-center rounded-full border border-neutral-200 p-0.5">
              <button
                onClick={() => onViewChange('list')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  view === 'list'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <List className="w-3.5 h-3.5 inline-block mr-1" />
                List
              </button>
              <button
                onClick={() => onViewChange('calendar')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  view === 'calendar'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline-block mr-1" />
                Calendar
              </button>
            </div>
          )}

          {/* Filter Pills (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:ring-offset-1 ${
                  activeFilter === option.value
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Filter + Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
          >
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events..."
              className="block w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Pills */}
      <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:ring-offset-1 ${
              activeFilter === option.value
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

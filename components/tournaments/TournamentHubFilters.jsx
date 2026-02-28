'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const PROGRAM_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
];

export default function TournamentHubFilters({
  programFilter,
  onProgramChange,
  teamFilter,
  onTeamChange,
  allTeams,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const selectedTeam = allTeams.find((t) => t.id === teamFilter);

  // Group teams by gender
  const boyTeams = allTeams.filter((t) => t.gender === 'male');
  const girlTeams = allTeams.filter((t) => t.gender === 'female');

  return (
    <div className="sticky top-20 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono uppercase tracking-wider text-xs text-neutral-400">
            Filter
          </span>

          {/* Program chips */}
          <div className="flex gap-2">
            {PROGRAM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onProgramChange(opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  programFilter === opt.value
                    ? 'bg-tne-red text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Team dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                teamFilter
                  ? 'bg-tne-red text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {selectedTeam ? selectedTeam.name : 'All Teams'}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 max-h-64 overflow-y-auto z-50">
                <button
                  type="button"
                  onClick={() => {
                    onTeamChange(null);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50 ${
                    !teamFilter ? 'text-tne-red font-medium' : 'text-neutral-700'
                  }`}
                >
                  All Teams
                </button>

                {boyTeams.length > 0 && (
                  <>
                    <div className="border-t border-neutral-100" />
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Boys
                    </div>
                    {boyTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => {
                          onTeamChange(team.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-neutral-50 flex items-center justify-between ${
                          teamFilter === team.id ? 'text-tne-red font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span>{team.name}</span>
                        <span className="text-neutral-400 text-xs">{team.gradeLevel}</span>
                      </button>
                    ))}
                  </>
                )}

                {girlTeams.length > 0 && (
                  <>
                    <div className="border-t border-neutral-100" />
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Girls
                    </div>
                    {girlTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => {
                          onTeamChange(team.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-neutral-50 flex items-center justify-between ${
                          teamFilter === team.id ? 'text-tne-red font-medium' : 'text-neutral-700'
                        }`}
                      >
                        <span>{team.name}</span>
                        <span className="text-neutral-400 text-xs">{team.gradeLevel}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

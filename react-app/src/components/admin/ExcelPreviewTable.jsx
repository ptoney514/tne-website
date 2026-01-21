import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, RefreshCw, Minus } from 'lucide-react';

const STATUS_STYLES = {
  new: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    icon: Plus,
    label: 'New',
  },
  updated: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: RefreshCw,
    label: 'Updated',
  },
  unchanged: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-500',
    badge: 'bg-stone-100 text-stone-500',
    icon: Minus,
    label: 'No change',
  },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.unchanged;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.badge}`}>
      <Icon className="w-3 h-3" />
      {style.label}
    </span>
  );
}

function TeamRow({ team, status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.unchanged;

  return (
    <tr className={`${style.bg} border-b ${style.border}`}>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3 font-medium text-stone-900">{team.name}</td>
      <td className="px-4 py-3 text-stone-600">{team.grade_level}</td>
      <td className="px-4 py-3 text-stone-600 capitalize">{team.gender}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          team.tier === 'tne' ? 'bg-tne-red/10 text-tne-red' : 'bg-stone-100 text-stone-600'
        }`}>
          {team.tier?.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-stone-600 text-sm">
        {team.head_coach_id || '-'}
      </td>
    </tr>
  );
}

function CoachRow({ coach, status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.unchanged;

  return (
    <tr className={`${style.bg} border-b ${style.border}`}>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3 font-medium text-stone-900">
        {coach.first_name} {coach.last_name}
      </td>
      <td className="px-4 py-3 text-stone-600">{coach.email || '-'}</td>
      <td className="px-4 py-3 text-stone-600 capitalize">{coach.role}</td>
      <td className="px-4 py-3 text-stone-600 text-sm">
        {coach.certifications?.join(', ') || '-'}
      </td>
    </tr>
  );
}

function RosterSection({ roster, teamName, status }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = STATUS_STYLES[status] || STATUS_STYLES.unchanged;

  return (
    <div className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-400" />
          )}
          <span className="font-medium text-stone-900">{teamName}</span>
          <span className="text-sm text-stone-500">({roster.players?.length || 0} players)</span>
        </div>
        <StatusBadge status={status} />
      </button>

      {isExpanded && roster.players?.length > 0 && (
        <div className="border-t border-stone-200 p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Jersey</th>
                <th className="pb-2 pr-4">Position</th>
                <th className="pb-2 pr-4">Grade</th>
              </tr>
            </thead>
            <tbody>
              {roster.players.map((player, idx) => (
                <tr key={idx} className="border-t border-stone-100">
                  <td className="py-2 pr-4 text-stone-900">
                    {player.first_name} {player.last_name}
                  </td>
                  <td className="py-2 pr-4 text-stone-600">{player.jersey_number || '-'}</td>
                  <td className="py-2 pr-4 text-stone-600">{player.position || '-'}</td>
                  <td className="py-2 pr-4 text-stone-600">{player.grade || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DataSection({ title, count, children, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-400" />
          )}
          <span className="font-semibold text-stone-900">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs">
            {count}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-stone-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ExcelPreviewTable({ parsedData, diff }) {
  if (!parsedData && !diff) {
    return null;
  }

  // If we have diff data, use that for status-aware display
  if (diff) {
    const teamsCount = (diff.teams?.new?.length || 0) + (diff.teams?.updated?.length || 0) + (diff.teams?.unchanged?.length || 0);
    const coachesCount = (diff.coaches?.new?.length || 0) + (diff.coaches?.updated?.length || 0) + (diff.coaches?.unchanged?.length || 0);
    const rostersCount = (diff.rosters?.new?.length || 0) + (diff.rosters?.updated?.length || 0) + (diff.rosters?.unchanged?.length || 0);

    return (
      <div className="space-y-4">
        {/* Teams */}
        {teamsCount > 0 && (
          <DataSection title="Teams" count={teamsCount}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Team Name</th>
                    <th className="px-4 py-2">Grade</th>
                    <th className="px-4 py-2">Gender</th>
                    <th className="px-4 py-2">Tier</th>
                    <th className="px-4 py-2">Head Coach</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.teams.new?.map((team, idx) => (
                    <TeamRow key={`new-${idx}`} team={team} status="new" />
                  ))}
                  {diff.teams.updated?.map((team, idx) => (
                    <TeamRow key={`updated-${idx}`} team={team} status="updated" />
                  ))}
                  {diff.teams.unchanged?.map((team, idx) => (
                    <TeamRow key={`unchanged-${idx}`} team={team} status="unchanged" />
                  ))}
                </tbody>
              </table>
            </div>
          </DataSection>
        )}

        {/* Coaches */}
        {coachesCount > 0 && (
          <DataSection title="Coaches" count={coachesCount} defaultExpanded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Certifications</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.coaches.new?.map((coach, idx) => (
                    <CoachRow key={`new-${idx}`} coach={coach} status="new" />
                  ))}
                  {diff.coaches.updated?.map((coach, idx) => (
                    <CoachRow key={`updated-${idx}`} coach={coach} status="updated" />
                  ))}
                  {diff.coaches.unchanged?.map((coach, idx) => (
                    <CoachRow key={`unchanged-${idx}`} coach={coach} status="unchanged" />
                  ))}
                </tbody>
              </table>
            </div>
          </DataSection>
        )}

        {/* Rosters */}
        {rostersCount > 0 && (
          <DataSection title="Rosters" count={rostersCount} defaultExpanded={false}>
            <div className="p-4 space-y-3">
              {diff.rosters.new?.map((roster, idx) => (
                <RosterSection
                  key={`new-${idx}`}
                  roster={roster}
                  teamName={roster.team_id}
                  status="new"
                />
              ))}
              {diff.rosters.updated?.map((roster, idx) => (
                <RosterSection
                  key={`updated-${idx}`}
                  roster={roster}
                  teamName={roster.team_id}
                  status="updated"
                />
              ))}
              {diff.rosters.unchanged?.map((roster, idx) => (
                <RosterSection
                  key={`unchanged-${idx}`}
                  roster={roster}
                  teamName={roster.team_id}
                  status="unchanged"
                />
              ))}
            </div>
          </DataSection>
        )}
      </div>
    );
  }

  // Fallback: Simple display without diff comparison
  return (
    <div className="space-y-4">
      {parsedData.teams?.length > 0 && (
        <DataSection title="Teams" count={parsedData.teams.length}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Team Name</th>
                  <th className="px-4 py-2">Grade</th>
                  <th className="px-4 py-2">Gender</th>
                  <th className="px-4 py-2">Tier</th>
                  <th className="px-4 py-2">Head Coach</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.teams.map((team, idx) => (
                  <tr key={idx} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-medium text-stone-900">{team.name}</td>
                    <td className="px-4 py-3 text-stone-600">{team.grade_level}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{team.gender}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        team.tier === 'tne' ? 'bg-tne-red/10 text-tne-red' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {team.tier?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-sm">{team.head_coach_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataSection>
      )}

      {parsedData.coaches?.length > 0 && (
        <DataSection title="Coaches" count={parsedData.coaches.length} defaultExpanded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.coaches.map((coach, idx) => (
                  <tr key={idx} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {coach.first_name} {coach.last_name}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{coach.email || '-'}</td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{coach.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataSection>
      )}

      {parsedData.rosters?.length > 0 && (
        <DataSection title="Rosters" count={parsedData.rosters.length} defaultExpanded={false}>
          <div className="p-4 space-y-3">
            {parsedData.rosters.map((roster, idx) => (
              <RosterSection
                key={idx}
                roster={roster}
                teamName={roster.team_id}
                status="new"
              />
            ))}
          </div>
        </DataSection>
      )}
    </div>
  );
}

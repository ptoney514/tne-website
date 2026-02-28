/**
 * TeamDetailHeader - Header section for team detail page
 *
 * Shows back navigation, grade badge, team name, subtitle, and quick stats
 */

import { useRouter } from 'next/navigation';
import { getGradeBadgeClass, formatGradeShort } from '@/utils/gradeColors';

export default function TeamDetailHeader({
  team,
  playerCount = 0,
  practicesPerWeek = 0,
  tournamentsCount = 0,
}) {
  const router = useRouter();

  if (!team) return null;

  const coachName = team.head_coach
    ? `Coach ${team.head_coach.last_name || team.head_coach.first_name}`
    : 'No Coach Assigned';

  const genderLabel = team.gender === 'male' ? 'Boys' : 'Girls';
  const subtitle = `${team.grade_level} Grade ${genderLabel} \u2022 ${coachName}`;

  return (
    <div className="bg-white border-b border-admin-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin/teams')}
              className="p-2 hover:bg-stone-100 rounded-lg text-admin-text-secondary hover:text-admin-text transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            {/* Grade Badge + Team Info */}
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${getGradeBadgeClass(team.grade_level)}`}
              >
                <span className="text-white text-xl font-bold tracking-wider">
                  {formatGradeShort(team.grade_level)}
                </span>
              </div>
              <div>
                <h1 className="text-[22px] font-extrabold text-admin-text tracking-[-0.02em]">{team.name}</h1>
                <p className="text-admin-text-secondary">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-text">{playerCount}</div>
              <div className="text-xs text-admin-text-secondary">Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-text">{practicesPerWeek}</div>
              <div className="text-xs text-admin-text-secondary">Practices/wk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-red">{tournamentsCount}</div>
              <div className="text-xs text-admin-text-secondary">Tournaments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

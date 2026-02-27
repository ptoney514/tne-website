'use client';

import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function SeasonBadge() {
  const { isTryoutsOpen, tryoutsLabel, isRegistrationOpen, registrationLabel, seasonName, loading } =
    useRegistrationStatus();

  if (loading) return null;

  const badgeText = isTryoutsOpen
    ? tryoutsLabel
    : isRegistrationOpen
      ? registrationLabel
      : seasonName;

  if (!badgeText) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
        {badgeText}
      </span>
    </div>
  );
}

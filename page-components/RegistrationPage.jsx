import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Shirt, ChevronDown, ArrowLeft, Calendar, UserPlus } from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import { WizardProvider, useWizard } from '@/components/registration/WizardContext';
import { WizardContent } from '@/components/registration/RegistrationWizard';
import RegistrationSummaryPanel from '@/components/registration/ui/RegistrationSummaryPanel';
import { useTeamRegistration } from '@/hooks/useTeamRegistration';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

// Type selector cards — entry point for choosing season vs team registration
function RegistrationTypeSelector({ onSelect, isTryoutsOpen, isRegistrationOpen, tryoutsLabel }) {
  // If neither is open, show nothing (handled by parent)
  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
        <h2 className="text-lg font-semibold text-neutral-900">
          How would you like to register?
        </h2>
      </div>

      <div className="px-5 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Season Registration Card */}
          {isTryoutsOpen && (
            <button
              onClick={() => onSelect('season')}
              className="group text-left rounded-2xl border-2 border-neutral-200 hover:border-tne-red/50 p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-neutral-900">Register for a Season</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-3">
                Sign up for tryouts for an upcoming season. No payment required.
              </p>
              {tryoutsLabel && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {tryoutsLabel}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm font-medium text-tne-red group-hover:gap-2.5 transition-all">
                Get Started
                <span aria-hidden="true">&rarr;</span>
              </div>
            </button>
          )}

          {/* Team Registration Card */}
          {isRegistrationOpen && (
            <button
              onClick={() => onSelect('team')}
              className="group text-left rounded-2xl border-2 border-neutral-200 hover:border-tne-red/50 p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-neutral-900">Register for a Team</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-3">
                Already placed on a team? Complete your registration &amp; payment.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Current teams
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-tne-red group-hover:gap-2.5 transition-all">
                Get Started
                <span aria-hidden="true">&rarr;</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Derive unique fee tiers from loaded teams
function getFeeTiers(teams) {
  if (!teams || teams.length === 0) return [];

  const tierMap = new Map();
  for (const team of teams) {
    const fee = parseFloat(team.team_fee);
    if (!fee || fee <= 0) continue;

    const key = `${fee}`;
    if (!tierMap.has(key)) {
      // Build a label from tier or team name
      const label = team.tier || team.name || 'Team';
      tierMap.set(key, { label, fee });
    }
  }

  // Sort by fee ascending
  return Array.from(tierMap.values()).sort((a, b) => a.fee - b.fee);
}

// Dynamic fee sidebar derived from teams data
function DynamicFeeSidebar() {
  const { teams } = useWizard();
  const feeTiers = getFeeTiers(teams);

  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">
          Registration Fees
        </h2>
      </div>
      <div className="px-5 py-4">
        {feeTiers.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {feeTiers.map((tier, i) => (
              <div key={tier.label} className={`py-3 ${i === 0 ? 'first:pt-0' : ''} ${i === feeTiers.length - 1 ? 'last:pb-0' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 text-sm">{tier.label}</p>
                  <span className={`text-lg font-semibold ${tier.fee >= 1000 ? 'text-tne-red' : 'text-neutral-900'}`}>
                    ${tier.fee.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 italic">Fee information coming soon</p>
        )}
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200">
        <p className="text-xs text-neutral-600 italic">
          If there is a situation and you need extended time, please communicate with us.
        </p>
      </div>
    </div>
  );
}

// Sidebar content that uses wizard context
function SidebarContent() {
  const { selectedTeam, registrationType } = useWizard();
  const [uniformsExpanded, setUniformsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Dynamic Registration Summary */}
      <RegistrationSummaryPanel />

      {/* Dynamic Registration Fees - shown when no team is selected in team mode, or when on type selector */}
      {registrationType !== 'season' && !selectedTeam && (
        <DynamicFeeSidebar />
      )}

      {/* Uniforms - Collapsible (only in team mode) */}
      {registrationType !== 'season' && (
        <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
          <button
            onClick={() => setUniformsExpanded(!uniformsExpanded)}
            className="w-full px-5 py-4 border-b border-neutral-200 flex items-center justify-between hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-tne-red" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Uniforms
              </h2>
            </div>
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${uniformsExpanded ? 'rotate-180' : ''}`} />
          </button>
          {uniformsExpanded && (
            <>
              <div className="px-5 py-4 space-y-4 text-sm text-neutral-600">
                <div>
                  <p className="font-medium text-neutral-900 mb-1">Jr 3SSB</p>
                  <p>Uniforms will be ordered through coaches.</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 mb-1">Express United Boys (3rd-8th)</p>
                  <p>Reversible gray uniforms (same as last year).</p>
                  <p className="mt-1">
                    <span className="font-semibold text-neutral-900">Cost: $110</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 mb-1">Girls</p>
                  <p>Reversible uniforms (same as last year).</p>
                  <p className="mt-1">
                    <span className="font-semibold text-neutral-900">Cost: $75</span>
                    <span className="text-neutral-500"> — Contact Rachelle Tucker: </span>
                    <a href="tel:402-210-1568" className="text-tne-red hover:underline">402-210-1568</a>
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-200">
                <p className="text-xs text-amber-800 font-medium">
                  If you haven&apos;t ordered your uniform yet, contact your coach ASAP.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Main wizard content area with type selection
function RegistrationWizardArea({ onSubmit, submitting, submitSuccess, onReset, isTryoutsOpen, isRegistrationOpen, tryoutsLabel, seasons, loading }) {
  const { registrationType, setRegistrationType, resetWizard, formData, updateField } = useWizard();

  const handleSelectType = (type) => {
    setRegistrationType(type);
  };

  // Auto-populate seasonId when entering season flow with a single available season
  useEffect(() => {
    if (registrationType === 'season' && seasons.length === 1 && !formData.seasonId) {
      updateField('seasonId', seasons[0].id);
    }
  }, [registrationType, seasons, formData.seasonId, updateField]);

  // Still loading registration status from config
  if (loading) {
    return (
      <div id="registration" className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-neutral-900">Registration</h2>
        </div>
        <div className="px-6 py-12 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-tne-red rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading registration options…</p>
        </div>
      </div>
    );
  }

  // Neither registration type is available
  if (!isTryoutsOpen && !isRegistrationOpen) {
    return (
      <div id="registration" className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-neutral-900">
            Registration
          </h2>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Registration Is Currently Closed
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            Registration is not available at this time. Sign up to be
            notified when the next registration period opens.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tne-red text-white font-medium rounded-lg hover:bg-tne-red-dark transition-colors"
          >
            <Bell className="w-4 h-4" />
            Get Notified
          </Link>
        </div>
      </div>
    );
  }

  // Only one option available — skip selector, go directly
  const onlyTryouts = isTryoutsOpen && !isRegistrationOpen;
  const onlyTeam = !isTryoutsOpen && isRegistrationOpen;

  // No registration type selected yet — show selector (or auto-select if only one option)
  if (!registrationType) {
    if (onlyTryouts) {
      // Auto-select season registration
      handleSelectType('season');
      return null;
    }
    if (onlyTeam) {
      // Auto-select team registration
      handleSelectType('team');
      return null;
    }

    return (
      <RegistrationTypeSelector
        onSelect={handleSelectType}
        isTryoutsOpen={isTryoutsOpen}
        isRegistrationOpen={isRegistrationOpen}
        tryoutsLabel={tryoutsLabel}
      />
    );
  }

  // Back to registration options (only when both options are available)
  const showBackLink = isTryoutsOpen && isRegistrationOpen;

  return (
    <div className="space-y-4">
      {showBackLink && (
        <button
          onClick={() => {
            resetWizard();
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to registration options
        </button>
      )}

      <WizardContent
        onSubmit={onSubmit}
        submitting={submitting}
        submitSuccess={submitSuccess}
        onReset={onReset}
        seasons={seasons}
      />
    </div>
  );
}

export default function RegistrationPage() {
  const {
    teams,
    submitRegistration,
    submitting,
    submitSuccess,
    resetSubmitState,
  } = useTeamRegistration();

  const { isRegistrationOpen, isTryoutsOpen, tryoutsLabel, registrationLabel, loading } = useRegistrationStatus();

  // Build seasons list from config for the season selector
  // For now, we use the tryoutsLabel and construct a season object
  // In the future this could come from a dedicated API
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    fetch('/data/json/config.json')
      .then(res => res.json())
      .then(config => {
        // Build available seasons for tryout registration
        if (config.tryouts?.is_open && config.season) {
          // Use a next season if available, otherwise use current season info
          const nextSeasonId = config.tryouts?.next_season_id || `spring-${new Date().getFullYear()}`;
          const nextSeasonName = config.tryouts?.next_season_name || config.tryouts?.label || `Spring ${new Date().getFullYear()}`;

          setSeasons([{
            id: nextSeasonId,
            name: nextSeasonName,
          }]);
        }
      })
      .catch(() => {
        // Fallback season
        setSeasons([{
          id: `spring-${new Date().getFullYear()}`,
          name: `Spring ${new Date().getFullYear()}`,
        }]);
      });
  }, []);

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            {/* Season Badge */}
            <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
                {registrationLabel || 'Registration'}
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Registration
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Join the TNE United Express family. Register your player for
                tryouts or complete your team registration.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Two Column Layout - Wrapped in WizardProvider for shared state */}
          <WizardProvider teams={teams}>
            <div className="grid gap-8 lg:grid-cols-7">
              {/* Registration Wizard - LEFT (wider) */}
              <div className="lg:col-span-4 order-2 lg:order-1">
                <RegistrationWizardArea
                  onSubmit={submitRegistration}
                  submitting={submitting}
                  submitSuccess={submitSuccess}
                  onReset={resetSubmitState}
                  isTryoutsOpen={isTryoutsOpen}
                  isRegistrationOpen={isRegistrationOpen}
                  tryoutsLabel={tryoutsLabel}
                  seasons={seasons}
                  loading={loading}
                />
              </div>

              {/* Sidebar: Registration Summary + Fees + Uniforms - RIGHT (narrower) */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <SidebarContent />
              </div>
            </div>
          </WizardProvider>

          {/* FAQ Teaser */}
          <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Have Questions?
            </h2>
            <p className="text-neutral-600 mb-4">
              Check out our tryouts page for FAQs, or reach out to us directly.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/tryouts"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
              >
                View FAQs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

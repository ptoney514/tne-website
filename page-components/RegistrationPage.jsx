import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, ArrowLeft, Calendar, UserPlus, ClipboardList,
  ListChecks, FileText, CheckCircle, PartyPopper,
  Trophy, Heart, Users, Shield,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import { WizardProvider, useWizard } from '@/components/registration/WizardContext';
import { WizardContent } from '@/components/registration/RegistrationWizard';
import RegistrationSummaryPanel from '@/components/registration/ui/RegistrationSummaryPanel';
import { useTeamRegistration } from '@/hooks/useTeamRegistration';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { api } from '@/lib/api-client';

// Red dot section label — matches site-wide pattern
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
      <span className="font-mono text-xs text-tne-red uppercase tracking-[0.2em]">
        {children}
      </span>
    </div>
  );
}

// FAQ Teaser — shared between both views
function FAQTeaser() {
  return (
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
  );
}

// Full-width type selector with generous cards
function RegistrationTypeSelector({ onSelect, isTryoutsOpen, isRegistrationOpen, tryoutsLabel }) {
  const cards = [];

  if (isTryoutsOpen) {
    cards.push({
      key: 'tryouts',
      type: 'link',
      href: '/tryouts#upcoming-tryouts',
      icon: ClipboardList,
      iconBg: 'bg-amber-100 group-hover:bg-amber-200',
      iconColor: 'text-amber-600',
      title: 'Register for Tryouts',
      description: 'Browse upcoming tryout sessions by grade and gender. Pick your session and register.',
      badge: tryoutsLabel,
      badgeBg: 'bg-amber-50 text-amber-700',
      badgeDot: 'bg-amber-500',
      cta: 'View Sessions',
    });

    cards.push({
      key: 'season',
      type: 'button',
      icon: Calendar,
      iconBg: 'bg-blue-100 group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      title: 'Register for a Season',
      description: 'Sign up for an upcoming season. No payment required until you\'re placed on a team.',
      badge: tryoutsLabel,
      badgeBg: 'bg-blue-50 text-blue-700',
      badgeDot: 'bg-blue-500',
      cta: 'Get Started',
    });
  }

  if (isRegistrationOpen) {
    cards.push({
      key: 'team',
      type: 'button',
      icon: UserPlus,
      iconBg: 'bg-purple-100 group-hover:bg-purple-200',
      iconColor: 'text-purple-600',
      title: 'Register for a Team',
      description: 'Already placed on a team? Complete your registration and payment.',
      badge: 'Current teams',
      badgeBg: 'bg-purple-50 text-purple-700',
      badgeDot: 'bg-purple-500',
      cta: 'Get Started',
    });
  }

  return (
    <div>
      <SectionLabel>Choose Your Path</SectionLabel>
      <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight mb-6">
        How would you like to register?
      </h2>

      <div className={`grid gap-5 ${cards.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : cards.length === 2 ? 'sm:grid-cols-2' : ''}`}>
        {cards.map((card, index) => {
          const Icon = card.icon;
          const inner = (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${card.iconBg} transition-colors`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{card.title}</h3>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                {card.description}
              </p>
              {card.badge && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${card.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${card.badgeDot}`} />
                  {card.badge}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm font-medium text-tne-red group-hover:gap-2.5 transition-all mt-auto">
                {card.cta}
                <span aria-hidden="true">&rarr;</span>
              </div>
            </>
          );

          const className = 'group text-left rounded-2xl border-2 border-neutral-200 hover:border-tne-red/50 bg-white p-6 sm:p-7 transition-all hover:shadow-md flex flex-col animate-fade-up';

          if (card.type === 'link') {
            return (
              <Link
                key={card.key}
                href={card.href}
                className={className}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={card.key}
              onClick={() => onSelect(card.key)}
              className={className}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// How It Works — 4-step process overview
const howItWorksSteps = [
  {
    icon: ListChecks,
    iconBg: 'bg-tne-red/10',
    iconColor: 'text-tne-red',
    title: 'Choose Your Path',
    description: 'Select tryouts, season registration, or team registration.',
  },
  {
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Fill In Details',
    description: 'Player info, parent contact, and emergency details.',
  },
  {
    icon: CheckCircle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Review & Confirm',
    description: 'Double-check everything before submitting.',
  },
  {
    icon: PartyPopper,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: "You're Set!",
    description: "You'll get a confirmation with next steps.",
  },
];

function HowItWorksSection() {
  return (
    <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
      <SectionLabel>How It Works</SectionLabel>
      <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight mb-6">
        Registration in 4 easy steps
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {howItWorksSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${step.iconBg}`}>
                  <Icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
                <span className="text-sm font-mono text-neutral-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{step.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Good to Know — what to bring + why TNE
function GoodToKnowSection() {
  return (
    <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
      <SectionLabel>Good to Know</SectionLabel>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* What You'll Need */}
        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-neutral-100">
              <FileText className="w-5 h-5 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">What You&apos;ll Need</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-neutral-600">
            {[
              "Player's date of birth and grade",
              'Parent/guardian contact info',
              'Emergency contact details',
              'Jersey size preference',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Why TNE */}
        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-tne-red/10">
              <Trophy className="w-5 h-5 text-tne-red" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Why TNE?</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-neutral-600">
            {[
              { icon: Shield, text: 'Experienced, dedicated coaching staff' },
              { icon: Trophy, text: 'Competitive travel tournament schedule' },
              { icon: Heart, text: 'Character and leadership development' },
              { icon: Users, text: 'Supportive team-first culture' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2">
                <item.icon className="w-4 h-4 text-tne-red mt-0.5 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Sidebar content that uses wizard context
function SidebarContent() {
  return (
    <div className="space-y-6">
      <RegistrationSummaryPanel />
    </div>
  );
}

// Inner content component — uses wizard context to switch between views
function RegistrationContent({ onSubmit, submitting, submitSuccess, onReset, isTryoutsOpen, isRegistrationOpen, tryoutsLabel, seasons, loading }) {
  const { registrationType, setRegistrationType, resetWizard, formData, updateField } = useWizard();

  // Auto-populate seasonId when entering season flow with a single available season
  useEffect(() => {
    if (registrationType === 'season' && seasons.length === 1 && !formData.seasonId) {
      updateField('seasonId', seasons[0].id);
    }
  }, [registrationType, seasons, formData.seasonId, updateField]);

  // Loading state
  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-tne-red rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading registration options…</p>
        </div>
      </section>
    );
  }

  // Registration closed
  if (!isTryoutsOpen && !isRegistrationOpen) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
          <div className="px-6 py-16 text-center">
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
      </section>
    );
  }

  // Auto-select if only one path available
  const onlyTryouts = isTryoutsOpen && !isRegistrationOpen;
  const onlyTeam = !isTryoutsOpen && isRegistrationOpen;

  if (!registrationType) {
    if (onlyTryouts) {
      setRegistrationType('season');
      return null;
    }
    if (onlyTeam) {
      setRegistrationType('team');
      return null;
    }

    // ── Initial view: full-width type selector + info sections ──
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <RegistrationTypeSelector
          onSelect={setRegistrationType}
          isTryoutsOpen={isTryoutsOpen}
          isRegistrationOpen={isRegistrationOpen}
          tryoutsLabel={tryoutsLabel}
        />
        <HowItWorksSection />
        <GoodToKnowSection />
        <FAQTeaser />
      </section>
    );
  }

  // ── Wizard view: two-column grid with sidebar ──
  const showBackLink = isTryoutsOpen && isRegistrationOpen;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Registration Wizard — LEFT (wider) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="space-y-4">
            {showBackLink && (
              <button
                onClick={() => resetWizard()}
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
        </div>

        {/* Sidebar — RIGHT (narrower) */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <SidebarContent />
        </div>
      </div>

      <FAQTeaser />
    </section>
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

  // Build seasons list from API (admin-configured seasons)
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    api.get('/public/seasons')
      .then(seasonsData => {
        const available = (seasonsData || []).filter(
          s => s.tryouts_open || s.registration_open
        );
        if (available.length > 0) {
          setSeasons(available.map(s => ({ id: s.id, name: s.name })));
          return;
        }
        return fetch('/data/json/config.json')
          .then(res => res.json())
          .then(config => {
            if (config.tryouts?.is_open && config.season) {
              const nextSeasonId = config.tryouts?.next_season_id || `spring-${new Date().getFullYear()}`;
              const nextSeasonName = config.tryouts?.next_season_name || config.tryouts?.label || `Spring ${new Date().getFullYear()}`;
              setSeasons([{ id: nextSeasonId, name: nextSeasonName }]);
            }
          });
      })
      .catch(() => {
        fetch('/data/json/config.json')
          .then(res => res.json())
          .then(config => {
            if (config.tryouts?.is_open && config.season) {
              const nextSeasonId = config.tryouts?.next_season_id || `spring-${new Date().getFullYear()}`;
              const nextSeasonName = config.tryouts?.next_season_name || config.tryouts?.label || `Spring ${new Date().getFullYear()}`;
              setSeasons([{ id: nextSeasonId, name: nextSeasonName }]);
            }
          })
          .catch(() => {
            setSeasons([{
              id: `spring-${new Date().getFullYear()}`,
              name: `Spring ${new Date().getFullYear()}`,
            }]);
          });
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
        <WizardProvider teams={teams}>
          <RegistrationContent
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
        </WizardProvider>
      </main>
    </InteriorLayout>
  );
}

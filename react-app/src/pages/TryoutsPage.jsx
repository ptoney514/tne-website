import { useState } from 'react';
import {
  CalendarCheck,
  ClipboardCheck,
  Users,
  Heart,
  Check,
  Info,
} from 'lucide-react';
import PublicLayout from '../components/layouts/PublicLayout';
import TryoutSessionCard from '../components/tryouts/TryoutSessionCard';
import TryoutRegistrationForm from '../components/tryouts/TryoutRegistrationForm';
import FAQAccordion from '../components/tryouts/FAQAccordion';
import { useTryoutSessions } from '../hooks/useTryoutSessions';

const whatToExpect = [
  {
    icon: ClipboardCheck,
    title: 'Skills Evaluation',
    description: 'Ball handling, shooting, passing, and defensive fundamentals',
  },
  {
    icon: Users,
    title: 'Scrimmages',
    description: '5-on-5 game situations to evaluate court vision and teamwork',
  },
  {
    icon: Heart,
    title: 'Attitude & Effort',
    description: 'Coachability, hustle, and positive attitude are key factors',
  },
];

const whatToBring = [
  'Basketball shoes (clean, non-marking soles)',
  'Athletic shorts and t-shirt',
  'Water bottle',
  'Signed parent consent form (if under 18)',
  'Completed registration confirmation',
];

export default function TryoutsPage() {
  const {
    sessions,
    loading,
    submitSignup,
    submitting,
    submitSuccess,
    submitError,
    resetSubmitState,
  } = useTryoutSessions();

  const [selectedSession, setSelectedSession] = useState(null);

  const handleRegisterClick = (session) => {
    setSelectedSession(session);
    // Scroll to registration form
    document.getElementById('registration')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/2891884/pexels-photo-2891884.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />
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
                Tryouts & Registration
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Join the TNE United Express family. We're looking for dedicated
                players who want to compete at the highest level and develop
                their skills.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center text-xs sm:text-sm text-white/70">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem]">
                  Registration Open
                </span>
              </div>
              {sessions.length > 0 && (
                <div className="inline-flex items-center gap-2 text-white/60">
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    Next tryout:{' '}
                    {new Date(
                      sessions[0].session_date + 'T00:00:00'
                    ).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
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
          {/* Upcoming Tryouts - Card Container */}
          <div className="animate-enter delay-100 rounded-2xl bg-white border border-neutral-200 shadow-sm p-4 sm:p-6 relative z-10">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Upcoming Tryout Dates
            </h2>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-neutral-100 border border-neutral-200 h-48 animate-pulse"
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-8 text-center">
                <CalendarCheck className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No Upcoming Tryouts
                </h3>
                <p className="text-neutral-500">
                  Check back later for new tryout dates.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <TryoutSessionCard
                    key={session.id}
                    session={session}
                    onRegister={handleRegisterClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-5">
            {/* What to Expect + What to Bring */}
            <div className="lg:col-span-2 space-y-6">
              {/* What to Expect */}
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    What to Expect
                  </h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  {whatToExpect.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tne-red/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-tne-red" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Bring */}
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    What to Bring
                  </h2>
                </div>
                <div className="px-5 py-5">
                  <ul className="space-y-2.5 text-sm text-neutral-700">
                    {whatToBring.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Program Fees */}
              <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border border-neutral-700 shadow-lg overflow-hidden">
                <div className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-white/60" />
                    <span className="text-xs font-mono uppercase tracking-wide text-white/60">
                      Program Fees
                    </span>
                  </div>
                  <p className="text-2xl font-semibold mb-2">
                    $25{' '}
                    <span className="text-base font-normal text-white/60">
                      tryout fee
                    </span>
                  </p>
                  <p className="text-sm text-white/70 mb-4">
                    Tryout fee is applied to season registration if selected.
                    Full season fees range from $400-$600 depending on age
                    group.
                  </p>
                  <p className="text-xs text-white/50">
                    Payment plans and financial assistance available. Contact us
                    for details.
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-3">
              <TryoutRegistrationForm
                sessions={sessions}
                selectedSession={selectedSession}
                onSubmit={submitSignup}
                submitting={submitting}
                submitSuccess={submitSuccess}
                submitError={submitError}
                onReset={resetSubmitState}
              />
            </div>
          </div>

          {/* FAQ */}
          <FAQAccordion />
        </section>
      </main>
    </PublicLayout>
  );
}

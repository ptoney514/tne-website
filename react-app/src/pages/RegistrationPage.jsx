import { Link } from 'react-router-dom';
import { Bell, Shield } from 'lucide-react';
import PublicLayout from '../components/layouts/PublicLayout';
import TeamRegistrationForm from '../components/registration/TeamRegistrationForm';
import { useTeamRegistration } from '../hooks/useTeamRegistration';
import { useRegistrationStatus } from '../hooks/useRegistrationStatus';

export default function RegistrationPage() {
  const {
    teams,
    loading,
    submitRegistration,
    submitting,
    submitSuccess,
    submitError,
    resetSubmitState,
  } = useTeamRegistration();

  const { isRegistrationOpen } = useRegistrationStatus();

  return (
    <PublicLayout>
      {/* Hero Header - Compact style like Contact page */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-12 max-w-6xl mx-auto pt-12 px-4 pb-8 relative">
          <div className="flex flex-col gap-4 animate-enter">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2">
              <Link
                to="/"
                className="text-[0.7rem] font-mono text-white/50 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-[0.7rem] font-mono text-tne-red uppercase tracking-[0.2em]">
                Register
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Team Registration
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Join the TNE United Express family. Register your player for
                an exciting season of competitive basketball.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Registration Fees + Our Commitment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Registration Fees */}
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Registration Fees
                  </h2>
                </div>
                <div className="px-5 py-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : teams.length === 0 ? (
                    <p className="text-neutral-500 text-sm py-4 text-center">
                      No teams available for registration.
                    </p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {teams.map((team) => {
                        const totalFee = (team.team_fee || 0) + (team.uniform_fee || 0);
                        return (
                          <div key={team.id} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium text-neutral-900 text-sm truncate">
                                  {team.name}
                                </p>
                                {team.uniform_fee > 0 && (
                                  <p className="text-xs text-neutral-500">
                                    Includes ${team.uniform_fee} uniform fee
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <span className="text-lg font-semibold text-neutral-900">
                                  ${totalFee}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    Payment plans and financial assistance available.{' '}
                    <Link to="/contact" className="text-tne-red hover:underline">
                      Contact us
                    </Link>{' '}
                    for details.
                  </p>
                </div>
              </div>

              {/* Commitment */}
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-tne-red" />
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Our Commitment
                    </h2>
                  </div>
                </div>
                <div className="px-5 py-5 text-sm text-neutral-600 space-y-2">
                  <p>
                    At TNE United Express, we're committed to developing well-rounded
                    athletes. Our program emphasizes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Skill development over winning at all costs</li>
                    <li>Equal playing time in non-tournament games</li>
                    <li>Sportsmanship and respect for opponents</li>
                    <li>Academic excellence alongside athletic growth</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-3">
              {isRegistrationOpen ? (
                <TeamRegistrationForm
                  teams={teams}
                  onSubmit={submitRegistration}
                  submitting={submitting}
                  submitSuccess={submitSuccess}
                  submitError={submitError}
                  onReset={resetSubmitState}
                />
              ) : (
                <div id="registration" className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Team Registration
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
                      Team registration is not available at this time. Sign up to be
                      notified when the next registration period opens.
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-tne-red text-white font-medium rounded-lg hover:bg-tne-red-dark transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      Get Notified
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

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
                to="/tryouts"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
              >
                View FAQs
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

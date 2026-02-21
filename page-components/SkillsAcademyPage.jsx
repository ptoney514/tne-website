import Link from 'next/link';
import {
  Dribbble,
  Target,
  Users,
  Clock,
  Bell,
  ArrowLeft,
  Check,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';

const features = [
  {
    icon: Dribbble,
    title: 'Ball Handling & Footwork',
    description: 'Master the fundamentals of dribbling, crossovers, and elite footwork patterns.',
  },
  {
    icon: Target,
    title: 'Shooting Mechanics',
    description: 'Develop consistent form, range, and shot selection with video analysis.',
  },
  {
    icon: Users,
    title: 'Defensive Principles',
    description: 'Learn positioning, help defense, and reading offensive plays.',
  },
];

const programHighlights = [
  'Ages 6-14',
  'Weekly sessions',
  'Small group training',
  'Individual skill assessments',
  'Progress tracking',
  'Certified coaches',
];

export default function SkillsAcademyPage() {
  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 rounded-md bg-tne-red/20 border border-tne-red/30 px-3 py-1.5 w-fit">
              <Clock className="w-3.5 h-3.5 text-tne-red" />
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-red-300">
                Coming Soon
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Skills Academy
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Foundational mechanics and basketball IQ training for developing players.
                Build the skills that separate good players from great ones.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Coming Soon Card */}
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-neutral-900 text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Launching Soon
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Our Skills Academy program is in development.
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-tne-red text-white shadow-md">
                <Dribbble className="w-6 h-6" />
              </div>
            </div>

            <div className="px-5 py-8 sm:px-6 sm:py-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-tne-red/10 text-tne-red mb-6">
                <Bell className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Be the First to Know
              </h3>
              <p className="text-neutral-600 max-w-lg mx-auto mb-6">
                We're putting the finishing touches on our Skills Academy program.
                Registration will open soon for players looking to take their game to the next level.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors"
              >
                Contact Us for Updates
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-6 sm:p-8"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tne-red/10 text-tne-red mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Program Highlights */}
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                Program Highlights
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                What to expect when Skills Academy launches.
              </p>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {programHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-3 text-sm text-neutral-700"
                  >
                    <Check className="w-4 h-4 text-tne-red flex-shrink-0" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

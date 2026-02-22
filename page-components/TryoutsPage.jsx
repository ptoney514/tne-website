import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  ClipboardList,
  Backpack,
  ChevronDown,
  Eye,
  Target,
  Check,
  CheckCircle,
  Users,
  ArrowRight,
  Bell,
  Quote,
  Mail,
  MapPin,
  Video,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import TryoutSessionCard from '@/components/tryouts/TryoutSessionCard';
import TryoutRegistrationForm from '@/components/tryouts/TryoutRegistrationForm';
import { useTryoutSessions } from '@/hooks/useTryoutSessions';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

// What to Expect cards data
const expectCards = [
  {
    icon: Clock,
    title: 'Duration & Format',
    description:
      'Tryouts run 90 minutes. Players rotate through skill stations, compete in drills, and participate in scrimmages.',
  },
  {
    icon: ClipboardList,
    title: 'What We Evaluate',
    description:
      "Fundamentals, basketball IQ, effort level, coachability, and attitude. We're building complete players and teammates.",
  },
  {
    icon: Backpack,
    title: 'What to Bring',
    description:
      'Basketball shoes, water bottle, positive attitude. Arrive 15 minutes early to check in and warm up.',
  },
];

// FAQ data
const faqItems = [
  {
    question: 'What if my child has never played travel basketball before?',
    answer:
      'All skill levels are welcome at tryouts! We evaluate effort and coachability alongside current skill. Many of our best players started with us as beginners. Consider attending a Skills Camp first if you want to build confidence.',
  },
  {
    question: 'How much does it cost to try out?',
    answer:
      'Tryouts have a $25 fee which is applied to season registration if selected. If selected for a team, full season fees range from $400-$600 depending on age group. We offer payment plans and limited financial assistance for families who qualify.',
  },
  {
    question: 'When will we find out if my child made a team?',
    answer:
      'Families receive notification within 48-72 hours after tryouts. Players who receive a team offer will get an email with enrollment instructions and next steps.',
  },
  {
    question: 'Can my child try out for multiple grade levels?',
    answer:
      'Players should try out for their current grade level. In some cases, advanced players may be evaluated for "play up" opportunities, but this is determined by our coaching staff after initial tryouts.',
  },
];

// Grade level preparation data
const gradeData = {
  k2: {
    label: 'K-2nd Grade',
    ages: 'Ages 6-8',
    evaluations: [
      { title: 'Basic Motor Skills', desc: 'Coordination, balance, body control' },
      { title: 'Listening & Following Instructions', desc: 'Coachability at this age is huge' },
      { title: 'Enthusiasm & Positive Attitude', desc: 'Love for the game matters most' },
      { title: 'Ball Control Basics', desc: 'Dribbling with control, catching, throwing' },
    ],
    skills: [
      { title: 'Dribbling Basics', desc: 'Practice dribbling with eyes up, staying low. Circle the ball around waist and legs to build hand-eye coordination.', videoUrl: 'https://www.youtube.com/watch?v=eVARa4uspCc' },
      { title: 'Catching & Throwing', desc: 'Throw ball in air and clap before catching. Practice chest passes against a wall or with a partner.', videoUrl: 'https://www.youtube.com/watch?v=3IqYOM3AQuE' },
      { title: 'Simple Layups', desc: 'Dribble to the basket and shoot a layup without defense. Focus on proper footwork (right-left-up for right side).', videoUrl: 'https://www.youtube.com/watch?v=WEYNV1Bv7fE' },
      { title: 'Fun Drill: Stuck in the Mud', desc: 'Dribble while playing tag. If tagged, freeze until a teammate dribbles between your legs to free you!', videoUrl: 'https://www.youtube.com/watch?v=xt5nwxRMVxY' },
    ],
    proTip: 'Keep practice sessions short (5-10 minutes) and fun. At this age, building love for the game is more important than perfect technique.',
  },
  '34': {
    label: '3rd-4th Grade',
    ages: 'Ages 8-10',
    evaluations: [
      { title: 'Head-Up Dribbling', desc: 'Controlling the ball while seeing the floor' },
      { title: 'Proper Shooting Form', desc: 'BEEF: Balance, Eyes, Elbow, Follow-through' },
      { title: 'Effort on Defense', desc: 'Hustle, stance, willingness to guard' },
      { title: 'Teamwork Basics', desc: 'Passing to open teammates, communication' },
    ],
    skills: [
      { title: 'Cone Dribbling', desc: 'Set up 5-6 cones and weave through them with crossovers. Focus on control over speed, eyes up.', videoUrl: 'https://www.youtube.com/watch?v=tqjLjGhJZqI' },
      { title: 'Form Shooting', desc: 'Start close to the basket. Focus on form, not distance. Make 10 in a row before stepping back.', videoUrl: 'https://www.youtube.com/watch?v=fJmWP-866Kg' },
      { title: 'Monkey in the Middle', desc: 'Practice chest and bounce passes with a defender in the middle. Teaches passing under pressure.', videoUrl: 'https://www.youtube.com/watch?v=8cPbx1Y4CB8' },
      { title: '1v1 with Chaser', desc: 'Dribble full court while a defender chases from behind. Finish with a layup. Builds game-speed skills.', videoUrl: 'https://www.youtube.com/watch?v=L2tTq52v4SI' },
    ],
    proTip: 'Start adding light defense to drills (20-30%). This age is when fundamentals become habits—good or bad.',
  },
  '56': {
    label: '5th-6th Grade',
    ages: 'Ages 10-12',
    evaluations: [
      { title: 'Finishing Under Contact', desc: 'Scoring through or around defenders' },
      { title: 'Reading Defenses', desc: 'Making good decisions based on what defense gives' },
      { title: 'Passing in Motion', desc: 'Accurate passes while moving, with fakes and pivots' },
      { title: 'Competitive Fire', desc: 'Hustle, intensity in 1v1 and 3v3 situations' },
    ],
    skills: [
      { title: 'Contested Layups', desc: 'Practice finishing with a trailing defender. Eyes on rim, use your body to shield the ball.', videoUrl: 'https://www.youtube.com/watch?v=vFCVMZnU2p0' },
      { title: 'Fill Cut 1v1', desc: "Catch on the move, read the defender's position, attack the rim or pull up. Decision-making under pressure.", videoUrl: 'https://www.youtube.com/watch?v=KsPvesq8HOk' },
      { title: '3v2 Passing', desc: 'Three offensive players vs. two defenders. Find passing windows, move without the ball, finish.', videoUrl: 'https://www.youtube.com/watch?v=MWsH2v7qj7Q' },
      { title: 'Spot Shooting', desc: 'Shoot from 5 spots around the key. Add movement—catch off a cut, shoot. 40-60% of drills with defenders.', videoUrl: 'https://www.youtube.com/watch?v=8KpRxJM9yVI' },
    ],
    proTip: 'At this level, competitive drills matter. Practice 1v1, 2v2, 3v3 regularly. Game-like situations separate good players from great ones.',
  },
  '78': {
    label: '7th-8th Grade',
    ages: 'Ages 12-14',
    evaluations: [
      { title: 'Versatile Scoring', desc: 'Multiple moves, finishing with both hands, mid-range game' },
      { title: 'Defensive Footwork', desc: 'Lateral quickness, closeouts, help defense rotations' },
      { title: 'Team Play Execution', desc: 'Setting screens, cutting, moving without the ball' },
      { title: 'Live Game Performance', desc: 'How skills translate in 5v5 scrimmage situations' },
    ],
    skills: [
      { title: 'Pivot Shooting', desc: 'Catch, jump stop, square up, score. Practice both directions. Add live defender for game speed.', videoUrl: 'https://www.youtube.com/watch?v=_pVmH4YBnQ8' },
      { title: '1v2 Full Court', desc: 'Handle pressure from two defenders. Builds composure, decision-making, and finishing under duress.', videoUrl: 'https://www.youtube.com/watch?v=GFQyx7pVbKw' },
      { title: '4v4 Limited Dribbles', desc: 'Only 2 dribbles allowed. Forces passing, cutting, movement, and team offense concepts.', videoUrl: 'https://www.youtube.com/watch?v=kKZx-8VD5_M' },
      { title: 'Give & Go / Pick & Roll', desc: 'Two-man game execution. Read the defense, make the right play. Essential for high school prep.', videoUrl: 'https://www.youtube.com/watch?v=z9I0pZMaWKs' },
    ],
    proTip: "70-90% of your practice should include live defenders. At this level, you're preparing for high school basketball. Every drill should translate to game situations.",
  },
};

// FAQ Accordion Item component
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-neutral-900">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 pb-4' : 'max-h-0'
        }`}
      >
        <p className="px-6 text-sm text-neutral-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Grade Panel component
function GradePanel({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: What Coaches Evaluate */}
      <div className="lg:col-span-5 rounded-2xl bg-neutral-900 border border-white/10 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tne-red/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-tne-red" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">What Coaches Evaluate</h3>
            <p className="text-xs text-white/50">{data.ages}</p>
          </div>
        </div>
        <ul className="space-y-4">
          {data.evaluations.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-tne-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-tne-red" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">{item.title}</span>
                <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Skills to Practice */}
      <div className="lg:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tne-red/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-tne-red" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Skills to Practice</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.skills.map((skill, index) => (
            <div key={index} className="rounded-xl bg-neutral-50 border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-tne-red" />
                <span className="text-sm font-semibold text-neutral-900">{skill.title}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mb-3">{skill.desc}</p>
              {skill.videoUrl && (
                <a
                  href={skill.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-tne-red hover:text-tne-red-dark transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Watch Tutorial
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-tne-red/5 border border-tne-red/20">
          <p className="text-xs text-neutral-700 leading-relaxed">
            <strong className="text-tne-red">Pro Tip:</strong> {data.proTip}
          </p>
        </div>
      </div>
    </div>
  );
}

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

  const { isTryoutsOpen, tryoutsLabel } = useRegistrationStatus();
  const [selectedSession, setSelectedSession] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('k2');

  const handleRegisterClick = (session) => {
    setSelectedSession(session);
    document.getElementById('registration')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
                {tryoutsLabel || '2025-2026 Fall/Winter Season'}
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Tryouts & Player Development
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Join Omaha's premier youth basketball program. Prepare for tryouts, develop your
                skills, and compete at the highest level.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {isTryoutsOpen && (
                <div className="inline-flex items-center gap-2 rounded-full border border-tne-red/30 bg-tne-red/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-tne-red shadow-[0_0_12px_rgba(227,24,55,0.9)]" />
                  <span className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-red-300">
                    {tryoutsLabel || 'Tryouts'} Open
                  </span>
                </div>
              )}
              <a
                href="#upcoming-tryouts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                View Upcoming Tryouts
              </a>
              <a
                href="#prepare"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <Target className="w-4 h-4" />
                How to Prepare
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Section 1: Upcoming Tryout Sessions — moved to top */}
        <section
          id="upcoming-tryouts"
          className="bg-[#050505] w-full border-b border-white/5 py-16 sm:py-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/5 border border-white/10 h-32 animate-pulse"
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              /* Enhanced Coming Soon State */
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-tne-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-tne-maroon/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

                <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-center">
                  {/* Season badge */}
                  {tryoutsLabel && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-6">
                      <Sparkles className="w-3.5 h-3.5 text-tne-red" />
                      <span className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-white/60">
                        {tryoutsLabel}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-tne-red/20 to-tne-maroon/20 border border-tne-red/20 flex items-center justify-center">
                    <CalendarCheck className="w-8 h-8 text-tne-red" />
                  </div>

                  {/* Heading */}
                  <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
                    Tryout Dates Coming Soon
                  </h2>
                  <p className="text-base text-white/50 max-w-lg mx-auto mb-4">
                    We're finalizing the schedule for the upcoming season. Get a head start by
                    preparing now — players who come ready stand out on tryout day.
                  </p>

                  {/* Helpful tips */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-white/40 mb-8">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-tne-red/60" />
                      <span>Review grade-level drills below</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-tne-red/60" />
                      <span>Sign up to get notified first</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/20"
                    >
                      <Bell className="w-4 h-4" />
                      Get Notified
                    </Link>
                    <a
                      href="#prepare"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/80 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Start Preparing
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Sessions exist */
              <>
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-tne-red/80">
                        Register Now
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                      Upcoming Tryout Sessions
                    </h2>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-medium text-tne-red hover:text-red-400 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Get notified of future tryouts
                  </Link>
                </div>

                {/* Session Cards */}
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <TryoutSessionCard
                      key={session.id}
                      session={session}
                      onRegister={handleRegisterClick}
                    />
                  ))}
                </div>

                {/* Registration Form */}
                {isTryoutsOpen && sessions.length > 0 && (
                  <div id="registration" className="mt-12">
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
                )}
              </>
            )}
          </div>
        </section>

        {/* Section 2: What to Expect */}
        <section className="bg-neutral-50 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-tne-red" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
                Overview
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
              What to Expect at Tryouts
            </h2>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {expectCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-tne-red/10 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-tne-red" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="mt-10 rounded-2xl bg-white border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="text-base font-semibold text-neutral-900">
                  Frequently Asked Questions
                </h3>
              </div>
              {faqItems.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Prepare Like the Best */}
        <section id="prepare" className="bg-[#050505] w-full border-t border-white/5 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-tne-red/80">
                Skill Development
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
              Prepare Like the Best
            </h2>
            <p className="text-base text-white/60 max-w-2xl mb-6">
              Age-appropriate skills and drills to help your player stand out at tryouts. Select
              your grade level to see what coaches evaluate and how to practice.
            </p>

            {/* Video Tutorials Callout */}
            <div className="mb-8 rounded-xl bg-gradient-to-r from-tne-red/20 to-tne-maroon/20 border border-tne-red/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tne-red/30 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">
                    Video Tutorials Now Available
                  </h3>
                  <p className="text-xs text-white/70">
                    Each skill drill now includes a video demonstration. Click "Watch Tutorial" on any drill below.
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Level Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.entries(gradeData).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedGrade(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGrade === key
                      ? 'bg-tne-red text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {data.label}
                </button>
              ))}
            </div>

            {/* Grade Content */}
            <GradePanel data={gradeData[selectedGrade]} />
          </div>
        </section>

        {/* Section 4: Training Programs */}
        <section className="bg-neutral-50 w-full border-t border-neutral-200 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-tne-red" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
                  Training Programs
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mb-3">
                Not Ready for Tryouts Yet?
              </h2>
              <p className="text-base text-neutral-600 max-w-xl mx-auto">
                Build confidence and skills before tryout day. Our training programs prepare players
                of all levels for competitive basketball.
              </p>
            </div>

            {/* Training Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Camp Card */}
              <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-neutral-900">
                  <img
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=compress&cs=tinysrgb&w=800"
                    alt="Skills Camp"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tne-red/90 text-white text-[10px] font-mono uppercase tracking-wider mb-2">
                      <Users className="w-3 h-3" />
                      Group Training
                    </div>
                    <h3 className="text-2xl font-semibold text-white">TNE Skills Camp</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                    Group sessions focusing on ball handling, shooting, and skill development in a
                    game-like environment. Perfect for building fundamentals and confidence.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      'Small group format (8-12 players)',
                      'Age-appropriate skill stations',
                      'Competitive drills & scrimmages',
                      'Saturday mornings, 2-hour sessions',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-tne-red flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Inquire About Skills Camp
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Small Group Training Card */}
              <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-neutral-900">
                  <img
                    src="https://images.unsplash.com/photo-1519861531473-920026393112?auto=compress&cs=tinysrgb&w=800"
                    alt="Small Group Training"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tne-red/90 text-white text-[10px] font-mono uppercase tracking-wider mb-2">
                      <Target className="w-3 h-3" />
                      Intensive
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Small Group Training</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                    Personalized coaching in small groups of 4-6 players. More reps, more feedback,
                    accelerated improvement. Ideal for serious players preparing for tryouts.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      '4-6 players per session',
                      'Individualized skill assessment',
                      'Position-specific training available',
                      'Flexible weekday scheduling',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-neutral-700">
                        <CheckCircle className="w-4 h-4 text-tne-red flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
                  >
                    Inquire About Training
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Testimonial */}
        <section className="bg-[#050505] w-full border-t border-white/5 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="mb-8">
              <Quote className="w-10 h-10 text-tne-red/40 mx-auto mb-4" />
            </div>
            <blockquote className="text-xl sm:text-2xl text-white/90 font-medium leading-relaxed mb-8">
              "My son was nervous about tryouts, so we signed up for Skills Camp first. By the time
              tryouts came around, he felt confident and prepared. He made the team and has grown so
              much as a player and person. TNE is the real deal."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                <span className="text-sm font-medium text-white">JM</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Jennifer M.</p>
                <p className="text-xs text-white/50">Parent · 5th Grade Boys Express</p>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bebas text-white mb-1">94%</div>
                <p className="text-xs text-white/50">Player retention rate</p>
              </div>
              <div>
                <div className="text-3xl font-bebas text-white mb-1">37</div>
                <p className="text-xs text-white/50">D1 Alumni</p>
              </div>
              <div>
                <div className="text-3xl font-bebas text-white mb-1">12+</div>
                <p className="text-xs text-white/50">Years developing talent</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: CTA */}
        <section className="bg-neutral-100 w-full border-t border-neutral-200 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
              Ready to Join the Express?
            </h2>
            <p className="text-base text-neutral-600 mb-8 max-w-xl mx-auto">
              Whether you're ready for tryouts or want to build skills first, we're here to help
              your player reach their potential.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#upcoming-tryouts"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tne-red text-white text-sm font-medium hover:bg-tne-red-dark transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Register for Tryouts
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

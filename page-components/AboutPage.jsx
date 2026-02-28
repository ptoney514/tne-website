import Link from 'next/link';
import Image from 'next/image';
import {
  Target,
  Heart,
  Users,
  Phone,
  Mail,
  User,
  MessageCircle,
} from 'lucide-react';
import InteriorLayout from '@/components/layouts/InteriorLayout';
import PageHero from '@/components/PageHero';
import mitchHeadshot from '@/assets/mitch-headshot.png';

const stats = [
  { value: '150+', label: 'Active Players', description: 'Across Nebraska' },
  { value: '60%+', label: 'Underserved', description: 'Free/reduced lunch' },
  { value: '13+', label: 'Years', description: 'Serving Omaha youth' },
  { value: '3', label: 'Levels', description: 'State · Regional · National' },
];

const values = [
  { icon: Target, label: 'Competitive Excellence' },
  { icon: Heart, label: 'Youth Mentorship' },
  { icon: Users, label: 'Diverse Community' },
];

const directors = [
  {
    name: 'Alvin Mitchell',
    role: 'Club Director',
    phone: '(402) 510-4919',
    phoneRaw: '+14025104919',
    email: 'amitch2am@gmail.com',
  },
  {
    name: 'Tyler Moseman',
    role: 'Assistant Director',
    phone: '(402) 578-3418',
    phoneRaw: '+14025783418',
    email: 'tmoseman@gmail.com',
  },
];

export default function AboutPage() {
  return (
    <InteriorLayout>
      <PageHero
        title="About TNE United"
        subtitle="To be the best, you have to play the best."
        backgroundImage="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2980&auto=format&fit=crop"
      />

      <main className="flex-1 w-full bg-white text-neutral-900">
        {/* Mission Statement */}
        <section className="py-16 sm:py-24 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left: Label */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
                    <span className="font-mono text-xs text-tne-red uppercase tracking-[0.2em]">
                      Our Mission
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight leading-[1.1]">
                    More Than
                    <br />A Game.
                  </h2>
                </div>
              </div>

              {/* Right: Content */}
              <div className="lg:col-span-8 space-y-6">
                <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed">
                  The mission of the TNE United Basketball program is to
                  organize and administer a highly competitive and developmental
                  basketball program in a diverse environment that fosters
                  athletic and social growth.
                </p>
                <p className="text-base text-neutral-500 leading-relaxed">
                  Players are given the opportunity to compete against teams at
                  the state, regional and national levels and develop leadership
                  skills, respect and relationships within a caring environment.
                  We strive to challenge our players to reach their maximum
                  potential in practice, games and in life.
                </p>
                <p className="text-base text-neutral-500 leading-relaxed">
                  The TNE United basketball organization provides children with
                  positive experiences and qualities that help influence choices
                  young people make and help them become caring, responsible,
                  successful adults.
                </p>
                <div className="pt-6 border-t border-neutral-200">
                  <p className="font-mono text-sm text-neutral-400 leading-relaxed">
                    More than sixty percent of our players receive free or
                    reduced lunch and have limited resources available to them
                    outside of school. The TNE United organization takes great
                    pride in mentoring students and providing them additional
                    assets to help support their social and emotional
                    development beyond the school setting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="bg-[#050505] w-full border-y border-white/10 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center md:text-left p-4 sm:p-6 ${
                    index < stats.length - 1
                      ? 'border-b md:border-b-0 md:border-r border-white/10'
                      : ''
                  }`}
                >
                  <div className="text-4xl sm:text-5xl font-bebas text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[0.65rem] sm:text-xs font-mono text-tne-red uppercase tracking-[0.2em] mb-1">
                    {stat.label}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-16 sm:py-24 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Image */}
              <div className="relative">
                <div className="aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=1200&auto=format&fit=crop"
                    alt="Team huddle"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-neutral-900 p-4 sm:p-6 rounded-xl shadow-2xl border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bebas text-white">
                    37
                  </div>
                  <div className="text-[0.6rem] sm:text-[0.65rem] font-mono text-tne-red uppercase tracking-[0.2em]">
                    D1 Alumni
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
                    <span className="font-mono text-xs text-tne-red uppercase tracking-[0.2em]">
                      Our Philosophy
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight leading-[1.1] mb-4">
                    Building Character
                    <br />
                    Through Competition
                  </h2>
                </div>

                <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                  During the summer, we make every effort to continue supporting
                  our kids by providing them opportunities to compete against
                  other players in the region and to foster relationships with
                  positive adults through the sport of basketball.
                </p>

                <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
                  Our program has an active list of players totaling over one
                  hundred and fifty kids throughout the state of Nebraska with
                  various socioeconomic backgrounds. The organization is defined
                  by club director Alvin Mitchell and his philosophy of
                  basketball and culture of the game.
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  {values.map((value) => (
                    <div
                      key={value.label}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-full"
                    >
                      <value.icon className="w-4 h-4 text-tne-red" />
                      <span className="text-xs sm:text-sm font-medium text-neutral-700">
                        {value.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="bg-neutral-50 border-y border-neutral-200 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]" />
                <span className="font-mono text-xs text-tne-red uppercase tracking-[0.2em]">
                  Leadership
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
                Meet The Directors
              </h2>
            </div>

            {/* Leadership Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {directors.map((director) => (
                <div
                  key={director.name}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                >
                  {/* Photo Placeholder */}
                  <div className="aspect-[4/3] bg-neutral-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/5">
                      <User className="w-16 sm:w-20 h-16 sm:h-20 text-neutral-300" />
                    </div>
                    {/* Red accent on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-tne-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </div>
                  {/* Info */}
                  <div className="p-5 sm:p-6">
                    <div className="text-[0.65rem] sm:text-xs font-mono text-tne-red uppercase tracking-[0.2em] mb-2">
                      {director.role}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
                      {director.name}
                    </h3>
                    <div className="space-y-2">
                      <a
                        href={`tel:${director.phoneRaw}`}
                        className="flex items-center gap-3 text-sm text-neutral-600 hover:text-tne-red transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {director.phone}
                      </a>
                      <a
                        href={`mailto:${director.email}`}
                        className="flex items-center gap-3 text-sm text-neutral-600 hover:text-tne-red transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {director.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legacy (Mitch Memorial) */}
        <section className="overflow-hidden bg-[#050505] w-full border-t border-white/10 py-16 sm:py-24 relative">
          <div className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase">
            Legacy
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-tne-red mb-4 sm:mb-6">
                    <Heart className="w-4 h-4" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em]">
                      Our Foundation
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.05] mb-4 sm:mb-6">
                    Remembering Mitch
                  </h2>
                  <p className="text-base sm:text-lg leading-relaxed text-neutral-400">
                    TNE United Express is built on the values instilled by our
                    foundational figure, Mitch. His dedication to youth
                    mentorship went far beyond the court.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-500 mt-4">
                    He taught us that wins are temporary, but character lasts
                    forever. Every jersey we wear and every practice we run is a
                    continuation of his legacy.
                  </p>
                </div>
                <div className="pt-4 sm:pt-6 border-t border-white/10">
                  <span className="font-bebas text-xl sm:text-2xl text-white/40 uppercase tracking-wider">
                    "Family Over Everything"
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 h-[350px] sm:h-[450px] lg:h-[500px] bg-[#0A0A0A] border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundSize: '40px 40px',
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  }}
                />

                {/* Mitch Photo */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-b from-tne-red/20 to-transparent rounded-3xl blur-xl opacity-60" />
                    <Image
                      src={mitchHeadshot}
                      alt="Mitch"
                      width={320}
                      height={420}
                      className="relative w-56 h-72 sm:w-72 sm:h-96 lg:w-80 lg:h-[420px] rounded-2xl object-cover object-top border-4 border-white/10 shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>

                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                  <div className="text-[0.6rem] sm:text-[0.65rem] font-mono text-tne-red uppercase tracking-[0.2em] mb-1">
                    Status
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-white/60">
                    Forever in our hearts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-neutral-50 w-full border-t border-neutral-200 py-16 sm:py-24 relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-200/50 backdrop-blur-sm border border-neutral-300 text-neutral-600 mb-6 sm:mb-8 shadow-sm">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight leading-none mb-4 sm:mb-6">
              Have Questions?
            </h2>

            <p className="text-base sm:text-lg text-neutral-500 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
              We'd love to hear from you. Reach out to our directors or send us
              a message.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-tne-red text-white font-medium rounded-full hover:bg-tne-red-dark transition-all shadow-lg shadow-tne-red/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200"
              >
                <span>Contact Us</span>
                <Mail className="w-4 h-4" />
              </Link>
              <a
                href="tel:+14025104919"
                className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-full border border-neutral-300 text-neutral-600 font-medium hover:bg-white hover:text-neutral-900 transition-all bg-white/50 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>(402) 510-4919</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}

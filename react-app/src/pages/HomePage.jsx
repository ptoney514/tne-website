import { useEffect } from 'react';
import {
  ArrowRight,
  Activity,
  Medal,
  TrendingUp,
  Users,
  GraduationCap,
  Award,
  ClipboardCheck,
  Dribbble,
  Check,
  Dumbbell,
  ArrowLeft,
  Play,
  Heart,
  Shirt,
  Instagram,
  ExternalLink,
  Calendar,
  ChevronRight
} from 'lucide-react';
import HomeNavbar from '../components/HomeNavbar';
import HomeFooter from '../components/HomeFooter';

export default function HomePage() {
  useEffect(() => {
    const handleScroll = () => {
      const bg = document.getElementById('parallax-bg');
      if (bg) {
        bg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };

    const carousel = document.getElementById('carousel');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');

    if (carousel && scrollLeftBtn && scrollRightBtn) {
      const handleScrollLeft = () => {
        carousel.scrollBy({ left: -420, behavior: 'smooth' });
      };
      const handleScrollRight = () => {
        carousel.scrollBy({ left: 420, behavior: 'smooth' });
      };

      scrollLeftBtn.addEventListener('click', handleScrollLeft);
      scrollRightBtn.addEventListener('click', handleScrollRight);

      document.addEventListener('scroll', handleScroll);

      return () => {
        scrollLeftBtn.removeEventListener('click', handleScrollLeft);
        scrollRightBtn.removeEventListener('click', handleScrollRight);
        document.removeEventListener('scroll', handleScroll);
      };
    }

    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white text-stone-950 antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red selection:text-white">
      {/* ============================================
           SECTION 01: HERO
           ============================================ */}
      <div className="relative w-full h-[850px] overflow-hidden bg-stone-950 border-b border-stone-800">
        {/* Corner Detail */}
        <div className="absolute bottom-12 left-8 z-30 hidden lg:flex items-center gap-3">
          <span className="font-mono text-xs text-tne-red">01</span>
          <div className="w-px h-8 bg-white/20"></div>
          <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
            Est. 2012 — Omaha, NE
          </span>
        </div>

        {/* Background */}
        <div className="w-full h-full absolute inset-0" id="parallax-bg">
          <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2980&auto=format&fit=crop" alt="Basketball Court" className="opacity-40 mix-blend-luminosity w-full h-full object-cover" />
          <div className="bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent absolute inset-0"></div>
        </div>

        {/* Navbar */}
        <HomeNavbar />

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4 mt-10">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tne-red/30 bg-tne-red/10 backdrop-blur-md pointer-events-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-tne-red animate-pulse"></div>
              <span className="text-[10px] font-mono font-medium text-red-300 uppercase tracking-widest">
                Fall/Winter '25-26 Reg Open
              </span>
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tight leading-[0.95] font-bebas uppercase">
              <span className="block">To be the best,</span>
              <span className="block">you have to play the best</span>
            </h1>

            <p className="max-w-md text-white/60 text-sm sm:text-base font-mono leading-relaxed mt-6 tracking-wide">
              Omaha's premier grassroots pipeline. Developing elite character and D1 talent since 2012.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 pointer-events-auto">
              <a href="#" className="group relative px-8 py-3 bg-tne-red text-white text-sm font-semibold uppercase tracking-wider overflow-hidden transition-all hover:bg-tne-red-dark shadow-lg shadow-tne-red/25">
                <span className="relative z-10 flex items-center gap-2">
                  Register For Tryouts
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              <a href="#" className="px-8 py-3 border border-white/20 text-white text-sm font-semibold uppercase tracking-wider rounded hover:bg-white/10 transition-all backdrop-blur-sm">
                View 2025 Rosters
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full bg-white relative z-10">
        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 w-full max-w-[1400px] mx-auto pointer-events-none z-0 hidden lg:block">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-stone-100"></div>
          <div className="absolute top-0 bottom-0 left-[33.33%] w-px bg-stone-100"></div>
          <div className="absolute top-0 bottom-0 left-[66.66%] w-px bg-stone-100"></div>
          <div className="absolute top-0 bottom-0 right-0 w-px bg-stone-100"></div>
        </div>

        {/* ============================================
             SECTION 02: TYPOGRAPHY BANNER
             ============================================ */}
        <div className="border-b border-stone-200 relative z-10 overflow-hidden">
          <h2 className="text-[13vw] sm:text-[14vw] leading-[0.8] font-bold text-stone-950 text-center tracking-tighter pt-10 pb-4 select-none opacity-10 font-bebas uppercase whitespace-nowrap">
            United Express
          </h2>
        </div>

        {/* ============================================
             SECTION 03: INTRO GRID (3 Columns)
             ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full max-w-[1400px] mx-auto relative z-10">
          {/* Col 1: Hook */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-200 p-8 lg:p-12 flex flex-col justify-between group h-full min-h-[400px] relative">
            <div className="absolute top-6 left-6 font-mono text-[10px] text-stone-400 opacity-50">02</div>
            <div className="h-full flex flex-col justify-center">
              <h2 className="font-bebas uppercase text-3xl sm:text-4xl text-stone-400 leading-none tracking-tight group-hover:text-stone-900 transition-colors duration-500">
                Not a rec league.
                <span className="text-tne-red"> A Pipeline.</span>
              </h2>
            </div>
            <div className="hidden lg:block mt-12 opacity-50 group-hover:opacity-100 transition-opacity">
              <Activity className="w-6 h-6 text-tne-red" />
            </div>
          </div>

          {/* Col 2: Stat Card */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-200 p-8 lg:p-12 flex flex-col items-center justify-center bg-stone-50/50 relative">
            <div className="relative w-full max-w-xs aspect-[3/4] bg-stone-950 rounded-lg p-6 flex flex-col justify-between shadow-2xl hover:-translate-y-1 transition-transform duration-500 border border-stone-800 overflow-hidden group">
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tne-maroon to-tne-red"></div>

              <div className="flex justify-between items-start z-10 relative">
                <div className="text-white font-bebas uppercase text-2xl tracking-wider">TNE ELITE</div>
                <Medal className="text-tne-red w-6 h-6" />
              </div>

              <div className="z-10 relative">
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">D1 Commitments</div>
                <div className="text-6xl font-bebas text-white font-bold tracking-tighter">37</div>
                <div className="h-px w-full bg-white/10 my-4"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Scholarships</div>
                    <div className="text-xl text-white font-medium">$5M+</div>
                  </div>
                  <TrendingUp className="text-green-500 w-5 h-5" />
                </div>
              </div>

              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>
          </div>

          {/* Col 3: Narrative */}
          <div className="lg:col-span-4 p-8 lg:p-12 flex flex-col justify-center space-y-8 relative">
            <div className="absolute top-6 right-6 font-mono text-[10px] text-stone-300">#OMAHA</div>
            <p className="font-mono text-xs sm:text-sm text-stone-600 leading-7">
              We are a competitive program for dedicated athletes. We don't just roll the ball out; we teach the game. From fundamental skills to advanced read-and-react offensive concepts.
            </p>
            <p className="font-mono text-xs sm:text-sm text-stone-400 leading-7">
              Our rigorous schedule puts players in front of collegiate scouts and challenges them against the nation's best competition.
            </p>

            <div className="pt-6 border-t border-stone-100 flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="font-bold text-xl tracking-tighter">adidas</div>
              <div className="font-bold text-sm tracking-tight">PREP HOOPS</div>
              <div className="font-bold text-sm tracking-tight">NY2LA</div>
            </div>
          </div>
        </div>

        {/* ============================================
             SECTION 04: STATS (Dark)
             ============================================ */}
        <section className="z-20 bg-[#08090A] w-full border-stone-800/50 border-t pt-24 pb-24 relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            {/* Header */}
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]"></div>
                <span className="font-mono text-xs text-tne-red/80 uppercase tracking-widest">The Track Record</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#F2F2F3] tracking-tight leading-[1.1] mb-6">
                Numbers don't lie. <br /> neither does the work.
              </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 bg-neutral-900 border-white/5 border">

              <div className="group relative p-8 border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Users className="w-8 h-8 text-tne-red" />
                </div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-tne-red mb-2">Development</h3>
                <h4 className="text-3xl font-bebas text-white mb-2">500+</h4>
                <p className="text-sm text-stone-500">Athletes trained through our system since 2012.</p>
              </div>

              <div className="group relative p-8 border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  <GraduationCap className="w-8 h-8 text-tne-red" />
                </div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-tne-red mb-2">Success</h3>
                <h4 className="text-3xl font-bebas text-white mb-2">37</h4>
                <p className="text-sm text-stone-500">NCAA Division 1 Alumni playing at the next level.</p>
              </div>

              <div className="group relative p-8 border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Award className="w-8 h-8 text-tne-red" />
                </div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-tne-red mb-2">Excellence</h3>
                <h4 className="text-3xl font-bebas text-white mb-2">15+</h4>
                <p className="text-sm text-stone-500">Tournament Championships in past 2 seasons.</p>
              </div>

              <div className="group relative p-8 hover:bg-white/[0.02] transition-colors">
                <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  <ClipboardCheck className="w-8 h-8 text-tne-red" />
                </div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-tne-red mb-2">Staff</h3>
                <h4 className="text-3xl font-bebas text-white mb-2">100%</h4>
                <p className="text-sm text-stone-500">USA Basketball Certified & Background Checked Coaches.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 05: PROGRAMS
             ============================================ */}
        <section className="bg-white w-full border-t border-stone-200 pt-24 pb-24 relative z-10 text-stone-950">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 font-mono text-[10px] text-stone-400 tracking-widest uppercase">03 — Development</div>

          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-3xl mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-stone-950 tracking-tight leading-[1.05] mb-6">
                A Complete Game.
              </h2>
              <p className="text-lg text-stone-500 max-w-xl leading-relaxed">
                We build players from the ground up. Whether you are looking to refine mechanics or prepare for collegiate exposure.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0 border border-stone-200 rounded-lg overflow-hidden">

              {/* Program 1 */}
              <div className="lg:border-r border-stone-200 p-8 flex flex-col h-full bg-stone-50/50 hover:bg-white transition-colors group">
                <div className="mb-6">
                  <span className="inline-block p-2 rounded bg-stone-200 mb-4 text-stone-600">
                    <Dribbble className="w-5 h-5" />
                  </span>
                  <h3 className="text-2xl font-bold text-stone-950 mb-2">Skills Academy</h3>
                  <p className="text-stone-500 text-sm leading-6">Foundational mechanics and IQ.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Ball Handling & Footwork
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Shooting Mechanics
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Defensive Principles
                  </li>
                </ul>
                <button className="text-sm font-semibold text-stone-950 flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Program 2 (Featured) */}
              <div className="lg:border-r border-stone-200 p-8 flex flex-col h-full bg-white relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-tne-red"></div>
                <div className="mb-6">
                  <span className="inline-block p-2 rounded bg-red-100 mb-4 text-tne-red">
                    <Users className="w-5 h-5" />
                  </span>
                  <h3 className="text-2xl font-bold text-stone-950 mb-2">Team Training</h3>
                  <p className="text-stone-500 text-sm leading-6">Elite travel teams (3rd - 11th Grade).</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Regional & National Schedule
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> 2x Weekly Practices
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Collegiate Recruiting Support
                  </li>
                </ul>
                <button className="text-sm font-semibold text-tne-red flex items-center gap-2 group-hover:gap-4 transition-all">
                  View Tryouts <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Program 3 */}
              <div className="p-8 flex flex-col h-full bg-stone-50/50 hover:bg-white transition-colors group">
                <div className="mb-6">
                  <span className="inline-block p-2 rounded bg-stone-200 mb-4 text-stone-600">
                    <Dumbbell className="w-5 h-5" />
                  </span>
                  <h3 className="text-2xl font-bold text-stone-950 mb-2">Strength & Cond.</h3>
                  <p className="text-stone-500 text-sm leading-6">Building the athletic engine.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Plyometrics & Vertical
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Injury Prevention
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-tne-red mt-0.5" /> Speed & Agility
                  </li>
                </ul>
                <button className="text-sm font-semibold text-stone-950 flex items-center gap-2 group-hover:gap-4 transition-all">
                  Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 06: ON THE COURT (Media Carousel)
             ============================================ */}
        <section className="overflow-hidden bg-[#050505] w-full border-stone-800 border-t pt-24 pb-24 relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            {/* Header with Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-tne-red shadow-[0_0_8px_rgba(227,24,55,0.5)]"></div>
                  <span className="font-mono text-xs text-tne-red/80 uppercase tracking-widest">Media</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-[#F2F2F3] tracking-tight leading-none">
                  On The Court
                </h2>
              </div>

              {/* Carousel Controls */}
              <div className="flex gap-2">
                <button id="scrollLeft" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button id="scrollRight" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div id="carousel" className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 hide-scroll -mx-6 px-6 lg:mx-0 lg:px-0">

              {/* Item 1 (Photo) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="Game Action" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Elite 8</div>
                  <div className="text-xl font-bebas text-white uppercase">Championship Sunday</div>
                </div>
              </div>

              {/* Item 2 (Video Mockup) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-90" alt="Training" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Training</div>
                  <div className="text-xl font-bebas text-white uppercase">Speed & Agility Session</div>
                </div>
              </div>

              {/* Item 3 (Photo) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="Huddle" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Culture</div>
                  <div className="text-xl font-bebas text-white uppercase">Timeout Adjustment</div>
                </div>
              </div>

              {/* Item 4 (Video Mockup) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1519861531473-920026393112?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-90" alt="Dunk" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Highlights</div>
                  <div className="text-xl font-bebas text-white uppercase">Poster Dunk - Chicago</div>
                </div>
              </div>

              {/* Item 5 (Photo) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="Celebration" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Victory</div>
                  <div className="text-xl font-bebas text-white uppercase">Regional Champs</div>
                </div>
              </div>

              {/* Item 6 (Photo) */}
              <div className="snap-center shrink-0 w-[85vw] md:w-[400px] aspect-[4/5] relative rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                <img src="https://images.unsplash.com/photo-1628779238951-be2c9f255915?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="Coach" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono text-tne-red mb-1">Staff</div>
                  <div className="text-xl font-bebas text-white uppercase">Coach Mentorship</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 07: LEGACY (Mitch Memorial)
             ============================================ */}
        <section className="overflow-hidden bg-[#050505] w-full z-20 border-t border-stone-800 py-24 relative">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/20 tracking-widest uppercase">04 — Legacy</div>

          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-tne-red mb-6">
                    <Heart className="w-4 h-4" />
                    <span className="font-mono text-xs uppercase tracking-wider">Our Foundation</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-semibold text-[#F2F2F3] tracking-tight leading-[1.05] mb-6">
                    Remembering Mitch
                  </h2>
                  <p className="text-lg leading-relaxed text-[#8A8F98]">
                    TNE United Express is built on the values instilled by our foundational figure, Mitch. His dedication to youth mentorship went far beyond the court.
                  </p>
                  <p className="text-base leading-relaxed text-[#8A8F98] mt-4">
                    He taught us that wins are temporary, but character lasts forever. Every jersey we wear and every practice we run is a continuation of his legacy.
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <span className="font-bebas text-2xl text-white/40 uppercase tracking-widest">"Family Over Everything"</span>
                </div>
              </div>

              <div className="lg:col-span-7 h-[500px] bg-[#0A0A0A] border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 opacity-20" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)' }}></div>

                <div className="relative z-10 text-center">
                  <Shirt className="w-32 h-32 text-white/10 mx-auto mb-4 stroke-1" />
                  <div className="text-9xl font-bebas font-bold text-white/5 group-hover:text-white/10 transition-colors duration-700 select-none">
                    23
                  </div>
                </div>

                <div className="absolute bottom-6 left-6">
                  <div className="text-[10px] font-mono text-tne-red uppercase tracking-widest mb-1">Status</div>
                  <div className="text-sm font-mono text-white/60">Forever in our hearts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 08: PARTNERS / SPONSORS
             ============================================ */}
        <section className="bg-white w-full border-t border-stone-200 py-20 relative z-10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-stone-300"></div>
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">Proudly Supported By</span>
                <div className="w-8 h-px bg-stone-300"></div>
              </div>
              <h3 className="text-2xl font-semibold text-stone-900 tracking-tight">Our Partners</h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20">
              <div className="group cursor-pointer transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0">
                <div className="font-bold text-3xl tracking-tighter text-stone-900">adidas</div>
              </div>
              <div className="group cursor-pointer transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0">
                <div className="font-bold text-xl tracking-tight text-stone-900">PREP HOOPS</div>
              </div>
              <div className="group cursor-pointer transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0">
                <div className="font-bold text-xl tracking-tight text-stone-900">NY2LA</div>
              </div>
              <div className="group cursor-pointer transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0">
                <div className="font-bold text-xl tracking-tight text-stone-900">SLAM</div>
              </div>
              <div className="group cursor-pointer transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0">
                <div className="font-bold text-lg tracking-tight text-stone-900">BASKETBALL NEBRASKA</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 09: INSTAGRAM FEED
             ============================================ */}
        <section className="bg-[#08090A] w-full border-t border-stone-800 py-16 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">@taborneexpress</h3>
                  <p className="text-sm text-stone-500">Follow us for updates</p>
                </div>
              </div>
              <a href="https://instagram.com/taborneexpress" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-tne-red hover:text-white transition-colors">
                View Profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Instagram Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1519861531473-920026393112?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group hidden md:block">
                <img src="https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group hidden md:block">
                <img src="https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
              <a href="#" className="aspect-square bg-stone-800 relative overflow-hidden group hidden md:block">
                <img src="https://images.unsplash.com/photo-1628779238951-be2c9f255915?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-tne-red/0 group-hover:bg-tne-red/30 transition-colors flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ============================================
             SECTION 10: CTA
             ============================================ */}
        <section className="bg-[#F5F5F4] w-full border-t border-stone-200 py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-200/50 backdrop-blur-sm border border-stone-300 text-stone-600 mb-8 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>

            <h2 className="text-5xl md:text-6xl font-semibold text-stone-900 tracking-tighter leading-none mb-8">
              The season starts <br />
              <span className="text-stone-400">when you sign up.</span>
            </h2>

            <p className="text-lg text-stone-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Fall/Winter 2025-26 evaluations are approaching. Spaces are limited by team capacity. Secure your spot at tryouts today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="h-12 px-8 bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-all shadow-xl shadow-tne-red/20 flex items-center gap-2 hover:scale-105 active:scale-95 duration-200">
                <span>Register for Tryouts</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="h-12 px-8 rounded border border-stone-300 text-stone-600 font-medium hover:bg-white hover:text-stone-900 transition-all bg-white/50 backdrop-blur-sm">
                Contact Coaches
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}

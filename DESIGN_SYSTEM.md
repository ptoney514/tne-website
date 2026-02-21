# TNE United Express - Design System (V2)

**Source of Truth:** Teams page screenshot (Image 2) and `tne-v2-teams.html`  
**Last Updated:** December 21, 2025  
**Version:** 2.0 - "Lighter Touch"

---

## ⚠️ CRITICAL: V2 Design Philosophy

**V2 = "Just fix the brand color, add Bebas sparingly, trust the designer's UX decisions"**

### What V2 Changed from Original Designer
| Element | Original | V2 Adaptation |
|---------|----------|---------------|
| Accent color | Orange `#ea580c` | Red `#E31837` |
| CTAs/Buttons | Orange | Red (rounded, not sharp) |
| Icon badges on cards | White/neutral | Red background |
| Links/hover states | Orange | Red |
| Stat numbers only | System font | Bebas Neue |
| Logo text only | System font | Bebas Neue |

### What V2 Kept from Designer (DO NOT CHANGE)
| Element | Why |
|---------|-----|
| **Inter for page titles** | Clean, modern readability |
| **Inter for card headers** | Consistency with body text |
| **Rounded pills/badges** | Better touch targets, softer UX |
| **Rounded cards (`rounded-3xl`)** | Modern, approachable feel |
| **Rounded inputs/buttons** | Standard form UX pattern |
| **Light content background** | Easier to scan many cards |
| **Subtle animations** | Polish and delight |

---

## 🚨 Typography Rules (READ THIS CAREFULLY)

### When to Use Bebas Neue
| Element | Use Bebas? | Example |
|---------|------------|---------|
| Homepage hero headline | ✅ YES | "To be the best, you have to play the best" |
| Logo "TNE" in circle | ✅ YES | The small TNE in navbar logo |
| Stat numbers (large) | ✅ YES | "7", "2X", "4" in stat boxes |
| Footer brand "UNITED" | ✅ YES | "UNITED EXPRESS" in footer |

### When to Use Inter (System Font)
| Element | Use Bebas? | Example |
|---------|------------|---------|
| Page titles | ❌ NO | "Team Rosters & Schedules" |
| Team names in cards | ❌ NO | "Express United" |
| Team names in detail page | ❌ NO | "Express United" (NOT all-caps) |
| Section headers | ❌ NO | "Roster", "Upcoming Schedule" |
| Body text | ❌ NO | All descriptions, paragraphs |
| Navigation links | ❌ NO | "HOME", "TEAMS", etc. |
| Button text | ❌ NO | "Register", "Login" |

### Visual Comparison

**❌ WRONG (Old V1 Style):**
```html
<h1 class="font-bebas text-5xl uppercase">EXPRESS UNITED</h1>
```
Result: Heavy, aggressive, all-caps Bebas headline

**✅ CORRECT (V2 Style):**
```html
<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight">Express United</h1>
```
Result: Clean, modern Inter headline with normal case

---

## 1. Tech Stack & Dependencies

> **Note:** The HTML/CDN snippets below are **legacy reference only** from the original static HTML build. The project now uses **Next.js** with `lucide-react` for icons and **Tailwind CSS 4 via PostCSS** (not CDN). Brand colors are defined in `app/globals.css` using CSS custom properties. The design tokens, typography rules, and component patterns in this document remain valid as visual reference.

```html
<!-- LEGACY REFERENCE — do not copy into the Next.js app -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'tne': {
                            'maroon': '#8B1F3A',
                            'red': '#E31837',
                            'red-dark': '#C41230',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
```

---

## 2. Brand Colors

| Name | Hex | Tailwind Class | Usage |
|------|-----|----------------|-------|
| Maroon | `#8B1F3A` | `tne-maroon` | Gradients only (logo) |
| Red | `#E31837` | `tne-red` | Primary CTA, highlights, badges |
| Red Dark | `#C41230` | `tne-red-dark` | Hover states |
| Black | `#050505` | `bg-[#050505]` | Hero/header backgrounds |
| Neutral 900 | - | `bg-neutral-900` | Card headers |
| White | `#FFFFFF` | `text-white` | Text on dark |
| Neutral 50 | - | `bg-neutral-50` | Light content areas |

---

## 3. Typography Scale

### Page Titles (Inter - NOT Bebas)
```html
<h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
    Team Rosters & Schedules
</h1>
```

### Team Names in Cards (Inter - NOT Bebas)
```html
<h2 class="text-xl sm:text-2xl font-semibold tracking-tight">Express United</h2>
```

### Section Headers (Inter)
```html
<h2 class="text-lg font-semibold text-neutral-900">Roster</h2>
```

### Stat Numbers (Bebas - OK here)
```html
<span class="font-bebas text-2xl text-white">7</span>
<span class="text-xs text-white/60 uppercase tracking-wider">Players</span>
```

### Labels/Badges (Space Mono)
```html
<span class="text-[0.7rem] font-mono uppercase tracking-[0.2em]">4TH GRADE</span>
```

### Body Text (Inter)
```html
<p class="text-sm text-neutral-600">Coach Foster</p>
```

---

## 4. Component Patterns

### 4.1 Navbar

```html
<nav class="sticky supports-[backdrop-filter]:bg-black/80 bg-black/90 w-full z-50 border-white/5 border-b top-0 backdrop-blur-md">
    <div class="sm:px-6 flex h-14 max-w-6xl mx-auto px-4 items-center justify-between">
        <!-- Brand -->
        <div class="flex items-center gap-3">
            <div class="flex bg-gradient-to-tr from-tne-maroon to-tne-red w-7 h-7 rounded-full shadow-[0_0_24px_rgba(227,24,55,0.5)] items-center justify-center">
                <span class="font-bebas font-bold text-white text-[10px] leading-none pt-0.5">TNE</span>
            </div>
            <span class="text-sm font-medium tracking-tight text-white/90">TNE United Express</span>
        </div>

        <!-- Links - Note: uppercase but NOT Bebas -->
        <div class="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em]">
            <a href="#" class="hover:text-white transition-colors text-stone-300">Home</a>
            <a href="#" class="text-white">Teams</a>
            <a href="#" class="hover:text-white transition-colors text-stone-300">Schedule</a>
            <a href="#" class="text-stone-300 hover:text-white transition-colors">Tryouts</a>
            <a href="#" class="text-stone-300 hover:text-white transition-colors">About</a>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2">
            <div class="hidden md:flex items-center gap-2">
                <a href="#" class="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition-colors">
                    Login
                </a>
                <a href="#" class="px-3 py-1.5 text-xs font-medium rounded-full bg-tne-red text-white hover:bg-tne-red-dark transition-colors">
                    Register
                </a>
            </div>
        </div>
    </div>
</nav>
```

### 4.2 Page Hero Header (V2 Style)

```html
<header class="relative border-b border-white/5 overflow-hidden bg-[#050505]">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%)]"></div>

    <div class="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
        <div class="flex flex-col gap-6">
            <!-- Back link (for detail pages) -->
            <a href="teams.html" class="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm w-fit">
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                Back to Teams
            </a>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
                <div class="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5">
                    <span class="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/80">4th Grade</span>
                </div>
                <div class="inline-flex items-center rounded-full bg-tne-red/20 border border-tne-red/30 px-2.5 py-0.5">
                    <span class="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-red-300">Boys Express</span>
                </div>
            </div>

            <!-- Title - INTER, NOT BEBAS -->
            <div>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                    Express United
                </h1>
                <p class="mt-2 text-base text-white/60">
                    Coach Foster · Monroe MS Gym · Mon/Wed 6:00 PM
                </p>
            </div>

            <!-- Stats Row -->
            <div class="flex gap-4">
                <div class="px-4 py-3 rounded-lg border border-white/10 bg-white/5">
                    <span class="font-bebas text-2xl text-white">7</span>
                    <span class="block text-[0.65rem] text-white/50 uppercase tracking-wider">Players</span>
                </div>
                <div class="px-4 py-3 rounded-lg border border-white/10 bg-white/5">
                    <span class="font-bebas text-2xl text-white">2x</span>
                    <span class="block text-[0.65rem] text-white/50 uppercase tracking-wider">Weekly</span>
                </div>
                <div class="px-4 py-3 rounded-lg border border-white/10 bg-white/5">
                    <span class="font-bebas text-2xl text-white">4</span>
                    <span class="block text-[0.65rem] text-white/50 uppercase tracking-wider">Upcoming</span>
                </div>
            </div>
        </div>
    </div>
</header>
```

### 4.3 Team Card (from Teams Page)

```html
<article class="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden flex flex-col">
    <!-- Card Header (dark) -->
    <div class="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1">
            <div class="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                <span class="text-[0.7rem] font-mono uppercase tracking-[0.2em]">4th Grade</span>
            </div>
            <!-- Team name - Inter, NOT Bebas -->
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight">Express United</h2>
            <p class="text-xs sm:text-sm text-white/60">
                Foster · Express United 4th · Boys
            </p>
        </div>
        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-tne-red text-white shadow-md">
            <i data-lucide="zap" class="w-5 h-5"></i>
        </div>
    </div>

    <!-- Card Body (light) -->
    <div class="px-5 py-4 sm:py-5 space-y-4">
        <!-- Coach Info -->
        <div class="space-y-1">
            <div class="flex items-center gap-2 text-sm text-neutral-800">
                <span class="inline-flex h-3 w-3 rounded-full border border-neutral-400"></span>
                <span class="font-medium">Coach Information</span>
            </div>
            <p class="text-sm text-neutral-600 ml-5">Coach Foster</p>
        </div>

        <!-- Schedule -->
        <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium text-neutral-900">
                <i data-lucide="calendar" class="w-4 h-4"></i>
                <span>Upcoming Games & Practices</span>
            </div>

            <div class="space-y-2">
                <div class="rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-xs sm:text-sm">
                    <p class="font-medium text-neutral-900 mb-1">Team Practice · Monroe MS Gym</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-neutral-600">
                        <span class="inline-flex items-center gap-1">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                            Mon · 6:00 PM
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Card Footer -->
    <div class="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[0.7rem] sm:text-xs text-neutral-600">
        <span class="inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Roster Active · 7 players
        </span>
        <a href="#" class="font-medium text-tne-red hover:text-tne-red-dark">Open team details</a>
    </div>
</article>
```

### 4.4 Roster Player Row (for Team Detail)

```html
<div class="flex items-center gap-4 px-5 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors">
    <!-- Jersey Number -->
    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-tne-red text-white font-semibold text-lg">
        #3
    </div>
    <!-- Player Info -->
    <div class="flex-1">
        <p class="font-medium text-neutral-900">Marcus Johnson</p>
        <p class="text-sm text-neutral-500">Point Guard · 4th</p>
    </div>
</div>
```

### 4.5 Schedule Event Card (for Team Detail)

```html
<div class="rounded-xl border border-neutral-200 bg-white overflow-hidden">
    <!-- Event type color bar -->
    <div class="h-1 bg-emerald-500"></div> <!-- Practice = emerald, Game = blue, Tournament = tne-red -->
    
    <div class="px-4 py-3">
        <!-- Date -->
        <div class="flex items-center justify-between mb-2">
            <span class="text-[0.7rem] font-mono uppercase tracking-wider text-neutral-500">Mon Dec 23</span>
            <span class="text-[0.65rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Practice</span>
        </div>
        
        <!-- Event Title -->
        <p class="font-medium text-neutral-900 mb-1">Team Practice</p>
        
        <!-- Meta -->
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-600">
            <span class="inline-flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                6:00 PM
            </span>
            <span class="inline-flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                Monroe MS Gym
            </span>
        </div>
    </div>
</div>
```

### 4.6 Footer

```html
<footer class="border-t border-white/10 bg-black py-8 sm:py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/45">
        <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-tne-maroon to-tne-red flex items-center justify-center">
                <span class="font-bebas font-semibold text-white text-[0.5rem] leading-none pt-[1px]">TNE</span>
            </div>
            <span class="font-semibold tracking-tight text-white text-base">
                UNITED <span class="text-white/40">EXPRESS</span>
            </span>
            <span class="hidden sm:inline text-white/30">·</span>
            <span class="hidden sm:inline text-white/40">© 2025 TNE United Express. All rights reserved.</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span class="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/60">
                    Registration Open
                </span>
            </div>
            <div class="flex items-center gap-3">
                <a href="#" class="text-white/40 hover:text-white transition-colors">
                    <i data-lucide="instagram" class="w-4 h-4"></i>
                </a>
                <a href="#" class="text-white/40 hover:text-white transition-colors">
                    <i data-lucide="twitter" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
    </div>
</footer>
```

---

## 5. Event Type Colors

| Event Type | Color Bar | Badge Background | Badge Text |
|------------|-----------|------------------|------------|
| Practice | `bg-emerald-500` | `bg-emerald-100` | `text-emerald-700` |
| Game | `bg-blue-500` | `bg-blue-100` | `text-blue-700` |
| Tournament | `bg-tne-red` | `bg-red-100` | `text-red-700` |
| Off/Holiday | `bg-neutral-300` | `bg-neutral-100` | `text-neutral-600` |

---

## 6. Quick Reference: Font Usage

```
BEBAS NEUE (font-bebas):
├── Logo "TNE" in circle ✓
├── Stat numbers (7, 2X, 4) ✓
├── Footer "UNITED" ✓
└── Homepage hero only ✓

INTER (default, no class needed):
├── Page titles ✓
├── Team names ✓
├── Card headers ✓
├── Section headers ✓
├── Body text ✓
├── Navigation ✓
└── Buttons ✓

SPACE MONO (font-mono):
├── Badges (4TH GRADE) ✓
├── Date labels (MON DEC 23) ✓
└── Status indicators ✓
```

---

## 7. Do's and Don'ts

### ✅ DO:
- Use Inter for page titles and team names
- Keep rounded corners on cards (`rounded-3xl`)
- Keep rounded buttons and badges
- Use red (`#E31837`) for accents
- Copy component code exactly from this doc
- Match the Teams page screenshot

### ❌ DON'T:
- Use Bebas for page titles or team names
- Use all-caps for team names
- Use sharp corners (except on homepage hero CTAs)
- Use maroon for buttons (use red)
- Improvise new patterns
- "Improve" the design

---

*When in doubt, match Image 2 (Teams page screenshot) exactly.*

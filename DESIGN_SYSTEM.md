# TNE United Express - Design System

**Source of Truth:** `tne-v2-homepage-complete.html` and `tne-v2-teams.html`  
**Last Updated:** December 21, 2025

---

## Quick Reference

Before building any page, copy-paste the relevant component code from this document or the source HTML files. Do not improvise or "improve" the patterns.

---

## 1. Tech Stack & Dependencies

```html
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
| Maroon | `#8B1F3A` | `tne-maroon` | Gradients, accents |
| Red | `#E31837` | `tne-red` | Primary CTA, highlights |
| Red Dark | `#C41230` | `tne-red-dark` | Hover states |
| Black | `#050505` | `bg-[#050505]` | Page backgrounds |
| Charcoal | `#08090A` | `bg-[#08090A]` | Section backgrounds |
| White | `#FFFFFF` | `text-white` | Text on dark |
| Neutral 50 | - | `bg-neutral-50` | Light content areas |

---

## 3. Typography

### Font Families

```css
.font-bebas { font-family: 'Bebas Neue', sans-serif; }
.font-mono { font-family: 'Space Mono', monospace; }
/* Default sans = Inter via Tailwind */
```

### Usage Patterns

| Element | Font | Classes |
|---------|------|---------|
| Hero Headlines | Bebas Neue | `font-bebas text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tight` |
| Page Titles | System/Inter | `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight` |
| Section Headers | Bebas Neue | `font-bebas text-2xl uppercase tracking-wide` |
| Labels/Badges | Space Mono | `font-mono text-[0.7rem] uppercase tracking-[0.2em]` |
| Body Text | Inter | `text-sm` or `text-base` |

---

## 4. Base Styles

Add to every page `<style>` block:

```css
.font-bebas { font-family: 'Bebas Neue', sans-serif; }
.font-mono { font-family: 'Space Mono', monospace; }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #050505; }
::-webkit-scrollbar-thumb { background: #E31837; border-radius: 3px; }

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-enter { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
```

### Body Element

```html
<body class="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">
```

---

## 5. Component Patterns

### 5.1 Navbar (Teams Page Style - USE THIS)

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

        <!-- Links -->
        <div class="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em]">
            <a href="#" class="hover:text-white transition-colors text-stone-300">Home</a>
            <a href="#" class="text-white">Teams</a> <!-- Active state -->
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
            <button class="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition-colors">
                <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
        </div>
    </div>
</nav>
```

### 5.2 Page Hero Header

```html
<header class="relative border-b border-white/5 overflow-hidden">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]"></div>
    <!-- Background image -->
    <div class="absolute inset-0 bg-[url('IMAGE_URL')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
    <!-- Dark gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>

    <div class="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
        <div class="flex flex-col gap-6 animate-enter">
            <!-- Status Badge -->
            <div class="inline-flex items-center gap-2 rounded-full border border-tne-red/30 bg-tne-red/10 px-3 py-1 w-fit">
                <span class="h-1.5 w-1.5 rounded-full bg-tne-red shadow-[0_0_12px_rgba(227,24,55,0.9)]"></span>
                <span class="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-red-300">2025-26 Season</span>
            </div>

            <!-- Title -->
            <div>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                    Page Title Here
                </h1>
                <p class="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                    Subtitle description text goes here.
                </p>
            </div>

            <!-- Meta info row -->
            <div class="flex flex-wrap gap-4 items-center text-xs sm:text-sm text-white/70">
                <div class="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5">
                    <span class="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                    <span class="font-mono uppercase tracking-[0.22em] text-[0.7rem]">Season Active</span>
                </div>
            </div>
        </div>
    </div>
</header>
```

### 5.3 Filter Controls Bar

```html
<div class="animate-enter delay-100 rounded-2xl bg-white border border-neutral-200 shadow-sm px-3 py-2 sm:px-4 sm:py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <!-- Filter Pills -->
    <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
        <button class="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium whitespace-nowrap">
            All Teams
        </button>
        <button class="px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 font-medium whitespace-nowrap hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
            Boys Express
        </button>
        <!-- More pills... -->
    </div>

    <!-- Search -->
    <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <i data-lucide="search" class="w-4 h-4"></i>
            </div>
            <input type="text" placeholder="Search..." class="block w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50">
        </div>
    </div>
</div>
```

### 5.4 Team Card

```html
<article class="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden flex flex-col">
    <!-- Card Header (dark) -->
    <div class="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1">
            <div class="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                <span class="text-[0.7rem] font-mono uppercase tracking-[0.2em]">4th Grade</span>
            </div>
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
                <!-- Event Item -->
                <div class="rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-xs sm:text-sm">
                    <p class="font-medium text-neutral-900 mb-1">Team Practice · Monroe MS Gym</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-neutral-600">
                        <span class="inline-flex items-center gap-1">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                            Mon · 6:00 PM
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                            Court 1
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

### 5.5 Footer (Simple - Teams Page)

```html
<footer class="border-t border-white/10 bg-black py-8 sm:py-10 mt-4">
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

## 6. Layout Patterns

### Main Content Area (Light Background)

```html
<main class="flex-1 w-full bg-neutral-50 text-neutral-900">
    <section class="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-12 sm:pb-16 space-y-6 sm:space-y-8">
        <!-- Content here -->
    </section>
</main>
```

### Grid Layouts

```html
<!-- 2-column grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

<!-- 3-column grid (homepage) -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0">
```

---

## 7. Status Indicators

### Active/Live Badge
```html
<span class="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
```

### Season Badge
```html
<div class="inline-flex items-center gap-2 rounded-full border border-tne-red/30 bg-tne-red/10 px-3 py-1 w-fit">
    <span class="h-1.5 w-1.5 rounded-full bg-tne-red shadow-[0_0_12px_rgba(227,24,55,0.9)]"></span>
    <span class="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-red-300">2025-26 Season</span>
</div>
```

---

## 8. Icons

Use Lucide icons with `strokeWidth: 1.5`:

```html
<script>
    lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
</script>
```

Common icons used:
- `zap`, `rocket`, `trophy`, `flame`, `target`, `medal` - Team icons
- `calendar`, `clock`, `map-pin` - Schedule info
- `menu`, `search`, `instagram`, `twitter` - UI
- `chevron-right`, `arrow-right` - Navigation

---

## 9. Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|------------|--------|-------|
| Mobile | (default) | Single column, stacked |
| Tablet | `sm:` (640px) | 2-column grids |
| Desktop | `md:` (768px) | Show desktop nav |
| Large | `lg:` (1024px) | 3-column grids |

---

## 10. Do's and Don'ts

### DO:
- Copy component code exactly from source files
- Use the Teams page navbar style (sticky, backdrop blur)
- Keep dark hero sections with light content areas
- Use `rounded-3xl` for cards, `rounded-2xl` for inner elements
- Use `font-mono` for labels and badges
- Use `animate-enter` for page load animations

### DON'T:
- Improvise new component styles
- Use different fonts
- Change the color palette
- Add extra spacing or padding
- Create new button styles
- Use different border-radius values

---

## 11. Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>TNE United Express | Page Name</title>
    <!-- [Copy full head from Section 1] -->
    <style>
        /* [Copy base styles from Section 4] */
    </style>
</head>
<body class="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans selection:bg-tne-red/20 selection:text-red-100">

    <!-- Navbar -->
    <!-- [Copy from Section 5.1] -->

    <!-- Hero Header -->
    <!-- [Copy from Section 5.2, customize title/subtitle] -->

    <!-- Main Content -->
    <main class="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section class="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-12 sm:pb-16 space-y-6 sm:space-y-8">
            <!-- Page-specific content -->
        </section>
    </main>

    <!-- Footer -->
    <!-- [Copy from Section 5.5] -->

    <script>
        lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
    </script>
</body>
</html>
```

---

*Reference the source HTML files for complete, working implementations.*

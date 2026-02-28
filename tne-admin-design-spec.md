# TNE Basketball Admin — UI Design Specification

Use this document as the single source of truth for the visual design, layout structure, and component styling of the TNE Basketball admin interface. The backend is already built — this is purely a UI/UX cleanup pass. Match this spec as closely as possible across every admin page.

---

## Layout Architecture

The app uses a **sidebar + main content** layout that fills the full viewport height.

### Sidebar (Left Navigation)
- **Width:** 260px expanded, 68px collapsed (icon-only mode)
- **Background:** `#1A1A1F` (near-black, not pure black)
- **Border right:** `1px solid rgba(255,255,255,0.06)` — very subtle separator
- **Collapse/expand:** Smooth transition (`0.25s cubic-bezier(0.4, 0, 0.2, 1)`) toggled via a button at the bottom of the sidebar
- **Position:** Fixed on mobile as an off-canvas drawer; static on desktop

### Main Content Area
- **Background:** `#FAFAF8` (warm off-white, not sterile white)
- **Top header bar:** `#fff` background, sticky, with a `1px solid #EDEDEB` bottom border
- **Content padding:** 32px on desktop, 16px on mobile

---

## Color Palette

| Role | Value | Usage |
|---|---|---|
| **Primary Red** | `#C62828` | Buttons, active nav indicators, accent borders, badges |
| **Primary Red Gradient** | `linear-gradient(135deg, #C62828, #E53935)` | Logo mark, avatar circles |
| **Sidebar Background** | `#1A1A1F` | Left navigation |
| **Content Background** | `#FAFAF8` | Main content area |
| **Card Background** | `#ffffff` | All content cards, panels, stat boxes |
| **Card Border** | `#EDEDEB` | Default card/input borders (1.5px solid) |
| **Accent Card Border** | `#C62828` | Highlighted stat cards or important panels |
| **Text Primary** | `#1A1A1F` | Headings, names, primary content |
| **Text Secondary** | `#888888` | Labels, descriptions, metadata |
| **Text Muted** | `#AAAAAA` | Timestamps, tertiary info |
| **Text on Dark** | `#ffffff` at varying opacities | Sidebar text (active: 100%, inactive: 50%, labels: 25%) |
| **Success Green** | `#2E7D32` text, `#E8F5E9` background, `#4CAF50` dot | Live/active status badges |
| **Warning Yellow** | `#F9A825` text, `#FFF8E1` background | Fee/payment badges |
| **Tryout Badge** | `#C62828` text, `#FFF3F0` background | Tryout-related badges |

---

## Typography

- **Primary Font:** `'Outfit', sans-serif` — used for all body text, labels, navigation, and buttons
- **Monospace Font:** `'JetBrains Mono', monospace` — used exclusively for large stat numbers and the TNE logo mark
- **Import both from Google Fonts**

### Type Scale

| Element | Size | Weight | Extra |
|---|---|---|---|
| Page title (h1) | 22px (18px mobile) | 800 | `letter-spacing: -0.02em` |
| Section heading (h3) | 16px | 700 | — |
| Card title (h4) | 16px | 700 | — |
| Body / nav items | 14px | 400 (600 when active) | — |
| Stat numbers | 36px (28px mobile) | 800 | JetBrains Mono, `letter-spacing: -0.03em` |
| Stat labels | 11px | 600 | Uppercase, `letter-spacing: 0.05em` |
| Sidebar group labels | 10px | 700 | Uppercase, `letter-spacing: 0.08em`, `rgba(255,255,255,0.25)` |
| Breadcrumb | 12px | 400/600 | Secondary color for parent, primary for current |
| Badges | 10px | 600–700 | Pill-shaped with colored backgrounds |
| Timestamps | 11px | 400 | Muted color |

---

## Sidebar Design

### Logo Block
- TNE logo: 36×36px rounded square (`border-radius: 10px`) with the red gradient background, "TNE" in JetBrains Mono 13px bold white
- Next to it: "TNE Basketball" in white 15px/600 weight, "Admin Console" below in `rgba(255,255,255,0.35)` 11px
- Separated from nav by a `1px solid rgba(255,255,255,0.06)` bottom border

### Season Selector
- Sits directly below the logo, inside 14px horizontal padding
- Card-like container: `rgba(198,40,40,0.1)` background, `rgba(198,40,40,0.15)` border, `border-radius: 10px`
- Shows a calendar emoji, micro-label "SEASON" in 9px uppercase, and the season name in `#EF5350` 13px/600
- Dropdown arrow on the right in muted white

### Navigation Groups
- Items are organized into collapsible groups with uppercase section headers
- **Group headers:** 10px, 700 weight, `rgba(255,255,255,0.25)`, with a small rotate-animated arrow
- **Groups used:**
  - *(no header)* — Dashboard
  - ROSTER MANAGEMENT — Teams, Players, Coaches
  - EVENTS & SCHEDULING — Tryouts, Tournaments, Practices, Seasons
  - ENROLLMENT — Registrations, Payments
- **Nav items:** 14px, padding `10px 22px`, with a unicode icon (16px, 20px width, center-aligned) and label
- **Active state:** `rgba(198,40,40,0.14)` background, `3px solid #E53935` left border, white text at 600 weight
- **Inactive state:** `rgba(255,255,255,0.5)` text, transparent background, 400 weight
- **Badges:** `#C62828` background pill with white text, 10px font, `border-radius: 10px`, `padding: 2px 7px`
- When sidebar is collapsed, only icons show — badges become small 7px red dots positioned at top-right

### Icons Used
Use simple unicode symbols for nav items. These are the current mappings — maintain consistency:

- Dashboard: `◫`
- Teams: `⊞`
- Players: `◉`
- Coaches: `◈`
- Tryouts: `▷`
- Tournaments: `◆`
- Practices: `▣`
- Seasons: `↻`
- Registrations: `☰`
- Payments: `$`

If adding new pages, pick unicode symbols that match this geometric, minimal style. Alternatively, swap all icons to a single icon library like Lucide React for consistency — but keep the same visual weight and simplicity.

### Collapse Button
- Bottom of sidebar, above a `1px solid rgba(255,255,255,0.06)` top border
- `rgba(255,255,255,0.03)` background, 8px border-radius
- Shows a left-arrow `◀` that rotates 180° when collapsed, plus "Collapse" label text

---

## Top Header Bar

- **Background:** `#fff`, sticky position, `z-index: 10`
- **Padding:** `16px 32px` desktop, `14px 16px` mobile
- **Bottom border:** `1px solid #EDEDEB`
- **Left side:** Breadcrumb trail (`Admin / Dashboard` style, 12px, secondary → primary color) above the page title
- **Right side:** Search input (pill-shaped, `#F5F5F3` background, `#EDEDEB` border), primary action button (red `#C62828`, white text, 13px/600, `border-radius: 8px`), and user avatar (34px circle with red gradient and initials)
- On mobile: search becomes an icon-only button, the action button shortens to just "+", and a hamburger `☰` button appears on the left to open the sidebar drawer

---

## Card & Panel Styling

All content lives in cards. Every card follows this base pattern:

- **Background:** `#ffffff`
- **Border:** `1.5px solid #EDEDEB`
- **Border radius:** 12–14px (use 12px for stat cards, 14px for larger content panels)
- **Padding:** 20–24px desktop, 16–18px mobile
- **No box shadows** — the border alone provides separation against the warm off-white background

### Stat Cards
- 4-column grid on desktop, 2-column on mobile, 14px gap
- Each card: label (11px uppercase), large number (36px JetBrains Mono), and a subtitle line (12px)
- **Accent variant:** `1.5px solid #C62828` border with a 3px-tall red bar across the top (`position: absolute`)

### Control Panels (Tryouts, Registration, etc.)
- Title (16px/700) on left, status badge on right
- Status badge: pill shape, `#E8F5E9` background, `#2E7D32` text, with a small `#4CAF50` dot — text reads "Live"
- Description line below: `#888`, 13px, shows status · event name · signup count
- Action row at bottom: primary button ("View Signups") takes `flex: 1`, secondary button (edit pencil ✏️) is fixed-width — both have `1.5px solid #EDEDEB` borders, 10px padding, `border-radius: 10px`

### Activity Feed
- List of items with: 40×40px icon container (rounded 10px, colored background), name + description, and timestamp + badge on the right
- Dividers between items: `1px solid #F2F2F0`
- "View all →" link in the header, right-aligned, `#AAA` color, 12px

---

## Mobile Responsiveness

Breakpoint: **768px**

### Below 768px:
- Sidebar becomes an off-canvas drawer: `position: fixed`, slides in with `translateX`, dark backdrop overlay with `blur(4px)`
- Hamburger button appears in the top header bar
- Tapping any nav item closes the drawer
- Stat grid: 2 columns instead of 4
- Content panels reorder: control panels (Tryouts, Registration) appear **above** the activity feed since they're more immediately actionable
- All padding reduces from 32px to 16px
- Font sizes scale down slightly for page titles and stat numbers

### Above 768px:
- Sidebar is static in the document flow, not overlaid
- Collapse toggle works to shrink sidebar to 68px icon-only rail
- Full 4-column stat grid
- Two-column layout: activity feed (1.4fr) + control panels (1fr)

---

## Interaction & Polish Details

- **Transitions:** Use `0.15s` for color/background hover states, `0.25s` for sidebar collapse, `0.2s` for group arrow rotation, `0.3s` for mobile drawer slide
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for spatial animations (sidebar, drawer)
- **Hover on buttons:** `opacity: 0.85`
- **Scrollbar styling:** 6px width, transparent track, `rgba(0,0,0,0.1)` thumb with 3px border-radius
- **No emojis in the nav** — keep unicode geometric icons. Emojis are acceptable in content areas (stat cards, activity feed icons, empty states)
- **Empty states:** Centered, with a large faded emoji (28px, 50% opacity), a short message in `#CCC` 13px, and 20px vertical padding

---

## Page-by-Page Application

Apply this design system consistently across all admin pages:

- **Dashboard:** As described above — stats, activity feed, control panels
- **Tryouts / Registrations / Players / Teams / Coaches:** Replace the current top tab navigation with the sidebar nav. The main content area should show the page title in the header breadcrumb, with filters and data tables below using the same card styling
- **Detail/Edit views:** Keep the sidebar visible. Use the breadcrumb to show depth (e.g., `Admin / Tryouts / Summer 2026 Tryouts`). Content lives in cards within the main area
- **Tournament Schedule:** Same pattern — title + action button in header, content cards below
- **Forms and modals:** Match the border radius (10px for inputs, 14px for modal containers), button colors, and font choices from this spec

The goal is a unified, calm, professional admin experience where the sidebar handles all navigation and the content area is never cluttered with competing navigation elements.

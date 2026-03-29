---
name: Sinaran ERP Redesign
overview: "Complete frontend redesign of the Sinaran ERP Next.js application: dark textured denim sidebar, airy light main content area, premium typography with next/font, soft pill badges, and refined micro-interactions."
todos:
  - id: step-1-fonts
    content: Upgrade fonts to next/font/google (Inter, IBM Plex Mono, Plus Jakarta Sans)
    status: pending
  - id: step-2-tokens
    content: Expand V3 design tokens in globals.css (sidebar, content, badges)
    status: pending
  - id: step-3-sidebar
    content: Refactor sidebar tokens.ts + Sidebar.tsx (denim bg, navy overlay, gold accent)
    status: pending
  - id: step-4-primitives
    content: Refresh ERP primitives (SectionCard, DataField, FieldGrid, PageShell)
    status: pending
  - id: step-5-main-layout
    content: Update main denim layout.tsx (bg-slate-50 content area)
    status: pending
  - id: step-6-dashboards
    content: Redesign dashboard pages (DenimLandingDashboard, OverviewPanel, shared)
    status: pending
  - id: step-7-interactions
    content: Pill badge redesign, table hover states, button micro-interactions
    status: pending
isProject: false
---

# Sinaran ERP — Redesign Implementation Plan

## Discovery Findings

The codebase uses:

- **Tailwind CSS v4** (no `tailwind.config.js` — all config lives in `globals.css`)
- **No `next/font`** — Inter and IBM Plex Mono are loaded via Google Fonts `@import` in `globals.css`
- **Sidebar** is a `'use client'` component at `components/layout/sidebar/Sidebar.tsx` (261 lines) with a `useDenimBg()` hook injecting CSS custom properties
- **ERP primitives** already exist in `components/ui/erp/`: `SectionCard`, `DataField`, `FieldGrid`, `PageShell`
- **Root layout** (`app/layout.tsx`) is 30 lines — minimal, clean

---

## Implementation Plan

### Step 1 — Upgrade Fonts to `next/font/google`

**File: `apps/frontend/app/layout.tsx`**

Replace the Google Fonts `@import` in `globals.css` with `next/font/google` in the root layout. This eliminates layout shift and self-hosts fonts automatically.

```tsx
import { Inter, IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
```

Update the `<html>` tag to apply the font variables as classes. Then remove the `@import` from `globals.css`.

**Update: `apps/frontend/app/globals.css`**

- Remove the `@import url('https://fonts.googleapis.com/...')` line
- Update `font-family: 'Inter'` → `font-family: var(--font-inter, system-ui)` fallback
- Update `.mono` to use `var(--font-mono)`

---

### Step 2 — Expand V3 Design Tokens in `globals.css`

**File: `apps/frontend/app/globals.css`**

Add new CSS variables under `:root` for the redesigned palette:

```css
/* ── Sidebar Tokens ─────────────────────────────────────────── */
--sidebar-bg:         #0A192F;
--sidebar-overlay:    rgba(10, 25, 47, 0.88);
--sidebar-border:     rgba(255, 255, 255, 0.07);
--sidebar-text:       rgba(255, 255, 255, 0.55);
--sidebar-text-muted: rgba(255, 255, 255, 0.35);
--sidebar-text-active:#FFFFFF;
--sidebar-accent:     #F0C040;   /* warm gold — refined, not loud */
--sidebar-accent-glow:rgba(240, 192, 64, 0.25);
--sidebar-hover:      rgba(255, 255, 255, 0.05);

/* ── Content Area Tokens ──────────────────────────────────── */
--page-bg:            #F8FAFC;
--card-bg:           #FFFFFF;
--card-shadow:        0 2px 8px rgba(0, 0, 0, 0.04);
--card-shadow-hover:  0 6px 20px rgba(0, 0, 0, 0.08);
--card-border:        #E8EDF3;
--card-radius:        16px;
--card-radius-sm:     10px;

/* ── Typography Scale ─────────────────────────────────────── */
--text-hero:         22px;
--text-title:        16px;
--text-body:         14px;
--text-sm:           12px;
--text-xs:           11px;

/* ── Pill Badges ──────────────────────────────────────────── */
--badge-success-bg:   #F0FDF4; --badge-success-text: #16A34A;
--badge-warning-bg:   #FFFBEB; --badge-warning-text: #D97706;
--badge-danger-bg:    #FEF2F2; --badge-danger-text:  #DC2626;
--badge-neutral-bg:   #F1F5F9; --badge-neutral-text:  #64748B;
--badge-info-bg:      #EFF6FF; --badge-info-text:     #2563EB;
```

Update `html, body` to use `--font-display` for headings (via a `.font-display` class mapping) and `--font-inter` for body.

---

### Step 3 — Redesign the Sidebar

**File: `apps/frontend/components/layout/sidebar/tokens.ts`**

Replace all current token values with the new palette:

```typescript
export const T = {
  bg:           '#0A192F',          // deep navy
  overlay:      'rgba(10,25,47,0.88)', // tactile overlay
  surface:      '#0D1E35',
  surfaceAlt:   '#112240',
  hover:        'rgba(255,255,255,0.05)',
  active:       'rgba(240,192,64,0.12)',
  glass:        'rgba(255,255,255,0.03)',
  glassHover:   'rgba(255,255,255,0.06)',

  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Warm gold accent — refined, premium
  accent:       '#F0C040',
  accentDim:     'rgba(240,192,64,0.12)',
  accentGlow:    'rgba(240,192,64,0.25)',
  accentBright:  '#F7D155',

  secondary:     '#60A5FA',
  secondaryDim:  'rgba(96,165,250,0.12)',

  text:          'rgba(255,255,255,0.55)',
  textBold:      'rgba(255,255,255,0.75)',
  textBright:    '#FFFFFF',

  radius:   8,   radiusSm: 4,   radiusLg: 12,
  w:        272,  wc:           68,

  bgImage:   '/logo.jpg',
  logoImage: '/bg.jpg',
} as const;
```

**File: `apps/frontend/components/layout/sidebar/Sidebar.tsx`**

Major refactor — remove `useDenimBg()` hook entirely and replace with inline styled elements using the new token values. Key changes:

1. **Denim texture background** — apply `background-image: url('/logo.jpg')` with `background-size: cover; background-position: center` on the sidebar root `div`
2. **Navy overlay** — add an absolute `div` positioned `inset-0` with `bg-[#0A192F]/[0.88]` sitting between the texture and the sidebar content (use `z-10` with `relative z-20` on content)
3. **Top accent bar** — replace copper gradient with a `1px solid var(--sidebar-border)` bottom border or a subtle `2px` gold (`#F0C040`) top border with `opacity-30`
4. **Nav items** — for each `SidebarSection` item, update hover/active states:
  - Default: `text-white/55` (using `T.text`)
  - Hover: `text-white/80` + subtle bg `rgba(255,255,255,0.05)`
  - Active (selected): `text-white` + left border `3px solid #F0C040` + bg `rgba(240,192,64,0.10)` + subtle box-shadow glow `0 0 12px rgba(240,192,64,0.2)`
5. **Sidebar section titles** — `text-white/30 text-[10px] uppercase tracking-widest`
6. **Collapse toggle** — minimal: `border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20`
7. **SidebarProfile** — avatar circle with white border, name in `text-white/70`, role badge in muted slate

The entire `useDenimBg()` function (which injects a `<style>` tag on mount) is removed. All styles become direct Tailwind/inline styles.

---

### Step 4 — Refresh the ERP Primitive Components

**File: `apps/frontend/components/ui/erp/SectionCard.tsx`**

- Replace `border: #E5E7EB` → `border: var(--card-border)` (already close, update to `#E8EDF3`)
- Replace `border-radius: 12px` → `border-radius: var(--card-radius)` (16px)
- Add `box-shadow: var(--card-shadow)` — update to use `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- Add subtle `hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300` to the card wrapper
- Update header: icon in slate-400, title in slate-800, optional dot as a soft pill indicator
- Remove any heavy colored backgrounds — header stays white-on-white

**File: `apps/frontend/components/ui/erp/DataField.tsx`**

- Label: `text-[11px] uppercase tracking-[0.06em] text-slate-400 font-medium`
- Value: `text-[14px] text-slate-800 font-[450]` (not bold)
- If `mono`: use `font-mono` class (IBM Plex Mono via next/font) with `font-semibold` and `text-slate-900`
- Add `text-slate-400` for null/undefined fallback

**File: `apps/frontend/components/ui/erp/FieldGrid.tsx`**

- Keep `gap: 16px 24px` (16px vertical, 24px horizontal)
- Add `bg-transparent` explicitly

**File: `apps/frontend/components/ui/erp/PageShell.tsx`**

- Replace page-level padding: use `px-6 py-5` instead of `px-6 pt-0`
- Title: `text-[20px] font-bold text-slate-900` (display font weight 700-800)
- Subtitle: `text-[13px] text-slate-500`
- Remove any blue/accent backgrounds — pure white header area over `bg-slate-50` page
- Optional back link: `text-slate-500 hover:text-slate-800` with subtle hover

---

### Step 5 — Design the Main Content Area

**File: `apps/frontend/app/denim/layout.tsx`**

Update the `<main>` element:

- `background: var(--page-bg)` or `bg-[#F8FAFC]`
- Add `transition-[margin-left]` with `duration-300 ease-in-out` for smooth sidebar collapse
- Full height: `min-h-screen`

Remove any legacy copper/indigo accent colors on the `<main>` wrapper — the color contrast between dark sidebar and light content is the design statement.

---

### Step 6 — Upgrade Dashboard Pages

**File: `components/denim/DenimLandingDashboard.tsx`**

Refactor the `HeroSection`:

- Replace dark copper gradient hero with a minimal white card spanning full width
- "Welcome back" in display font (Plus Jakarta Sans 800), role badge in a soft pill
- Remove any heavy background fills

Refactor `StatCard`:

- White background, `--card-shadow` box-shadow
- Hover: lift with `hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-200`
- Label in `text-[11px] uppercase tracking-widest text-slate-400`
- Value in `text-[28px] font-bold font-mono text-slate-900`

Refactor `QuickActionCard`:

- White background, `rounded-xl`, subtle border `border border-slate-100`
- Hover: `hover:border-slate-200 hover:-translate-y-0.5 transition-all`
- Icon in a soft-tinted circle (e.g., `bg-blue-50 text-blue-600`)

Refactor `ActivityFeed`:

- White background card
- Each item: subtle `hover:bg-slate-50` transition
- Emoji icons replaced with Lucide icons in muted slate tones

**File: `components/denim/admin/dashboard/OverviewPanel.tsx`**

Refactor `DarkCard` → rename to `BentoCard`:

- Replace all `#0A192F` dark backgrounds with white
- Replace copper/indigo accents with slate-blue tints
- `BentoHeroCard` (large): becomes a white card with a `1px` slate-100 border, large display number in `font-mono font-bold text-slate-900`, subtle label in `text-slate-400`
- All inner stats: use `--card-shadow` with `hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]`
- Remove all dark surfaces — the entire dashboard becomes light

**File: `components/denim/admin/dashboard/shared.tsx`**

Update `NmKpiCard`, `NmChartCard`, `NmStatusPill`:

- All white cards, slate text hierarchy
- `NmStatusPill`: dot + label in a `bg-slate-100 text-slate-600` pill (Good), `bg-amber-50 text-amber-700` (Average), `bg-red-50 text-red-600` (Low)

---

### Step 7 — Status Badges (Pill Redesign)

**File: `apps/frontend/components/ui/badge.tsx`**

Replace the current badge implementation with pill-shaped soft badges. Define a `variant` prop:

```typescript
// Soft pill variants (no solid backgrounds)
const variants = {
  default:    'bg-slate-100 text-slate-700',
  success:   'bg-[#F0FDF4] text-[#16A34A]',   // soft green
  warning:   'bg-[#FFFBEB] text-[#D97706]',   // soft amber
  danger:    'bg-[#FEF2F2] text-[#DC2626]',   // soft red
  info:      'bg-[#EFF6FF] text-[#2563EB]',   // soft blue
  neutral:   'bg-slate-100 text-slate-500',
  // Pipeline stage badges — all use soft fills
  warping:   'bg-blue-50 text-blue-700',
  indigo:    'bg-cyan-50 text-cyan-700',
  weaving:   'bg-emerald-50 text-emerald-700',
  complete:  'bg-green-50 text-green-700',
  // ... etc.
};
```

Each badge: `px-2.5 py-0.5 rounded-full text-[11px] font-medium`. No solid colored backgrounds, no hard borders.

---

### Step 8 — Table Row Hover States

**File: `apps/frontend/components/ui/DataGrid.tsx`**

Add micro-interactions to table rows:

```css
/* In shared.css or globals.css */
.tr-hover {
  transition: background-color 150ms ease, transform 150ms ease;
}
```

In the table rendering:

- Each `<tr>`: `className="border-b border-slate-100 hover:bg-slate-50/80 hover:-translate-y-px transition-all duration-150 cursor-pointer"`
- Header row: `bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-medium`
- Cells: `text-slate-700 text-[13px]`

---

### Step 9 — Button Micro-interactions

**File: `apps/frontend/components/ui/button.tsx`**

Update primary buttons:

- Hover: `hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(29,78,216,0.25)]`
- Active: `active:translate-y-0 active:shadow-none`
- Transition: `transition-all duration-200`

Secondary/ghost buttons:

- Hover: `hover:bg-slate-100 hover:text-slate-800`

---

### Step 10 — PostCSS / Build Config (No Changes Needed)

The current PostCSS config (`@tailwindcss/postcss`) and Tailwind v4 setup are already correct. No changes to `package.json` or PostCSS config are required.

---

## Files to Touch (Summary)


| File                                                               | Action                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `apps/frontend/app/layout.tsx`                                     | Add `next/font/google` (Inter, IBM Plex Mono, Plus Jakarta Sans) |
| `apps/frontend/app/globals.css`                                    | Remove @import, add new CSS tokens, update font-family           |
| `apps/frontend/components/layout/sidebar/tokens.ts`                | Replace all color tokens with new palette                        |
| `apps/frontend/components/layout/sidebar/Sidebar.tsx`              | Refactor: denim bg + navy overlay, gold accent, white text       |
| `apps/frontend/components/layout/sidebar/navConfig.ts`             | Update active state styling (no functional change)               |
| `apps/frontend/app/denim/layout.tsx`                               | Update main area bg to `bg-slate-50`                             |
| `apps/frontend/components/ui/erp/SectionCard.tsx`                  | White bg, refined shadow, hover lift                             |
| `apps/frontend/components/ui/erp/DataField.tsx`                    | Typography polish, mono for data                                 |
| `apps/frontend/components/ui/erp/PageShell.tsx`                    | Padding and typography polish                                    |
| `apps/frontend/components/ui/badge.tsx`                            | Soft pill variants (no solid fills)                              |
| `apps/frontend/components/ui/DataGrid.tsx`                         | Row hover micro-interactions                                     |
| `apps/frontend/components/ui/button.tsx`                           | Hover/active micro-interactions                                  |
| `apps/frontend/components/denim/DenimLandingDashboard.tsx`         | Full redesign: light hero, white cards                           |
| `apps/frontend/components/denim/admin/dashboard/OverviewPanel.tsx` | Remove all dark surfaces                                         |
| `apps/frontend/components/denim/admin/dashboard/shared.tsx`        | Update shared primitives                                         |


## Design System Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (272px fixed)          │  MAIN CONTENT (#F8FAFC) │
│                                │                        │
│  background: /logo.jpg         │  bg: #F8FAFC           │
│  overlay: #0A192F/88%          │                        │
│  ─────────────────             │  ┌──────────────────┐  │
│  [Brand]  SINARAN ERP          │  │ PageShell        │  │
│  ─────────────────             │  │ bg: white        │  │
│  NAV SECTIONS                  │  │ shadow-sm        │  │
│  • item (white/55%)           │  │ rounded-2xl      │  │
│  • item (white/55%)           │  └──────────────────┘  │
│  ─▶ item ACTIVE               │                        │
│  (gold bar + glow + white)    │  ┌──────┐ ┌──────┐    │
│                                │  │Card  │ │Card  │    │
│  ─────────────────             │  │hover │ │hover │    │
│  [Collapse] [Profile]          │  │lift  │ │lift  │    │
│                                │  └──────┘ └──────┘    │
└─────────────────────────────────────────────────────────┘
```

## Implementation Order

1. Fonts + CSS tokens (`layout.tsx` + `globals.css`)
2. Sidebar tokens + CSS variables
3. Sidebar component refactor (most impactful visual change)
4. ERP primitives (SectionCard, DataField, PageShell)
5. Main layout (`denim/layout.tsx`)
6. Dashboard pages (DenimLandingDashboard, OverviewPanel)
7. Status badges + table hover + button interactions
8. Final polish pass


# Sinaran ERP — Frontend Current State Audit

> **Date:** March 24, 2026
> **Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion v12 + Recharts + Prisma
> **Deployed:** Vercel (frontend) + Render (backend) + Neon PostgreSQL

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Design Token System](#2-design-token-system)
3. [Theme / Dark Mode Mechanism](#3-theme--dark-mode-mechanism)
4. [Sidebar Design System](#4-sidebar-design-system)
5. [Card & Chart Components](#5-card--chart-components)
6. [DataGrid Architecture](#6-datagrid-architecture)
7. [All Routes & Pages](#7-all-routes--pages)
8. [Animation Patterns](#8-animation-patterns)
9. [Key Technical Decisions](#9-key-technical-decisions)
10. [CSS Architecture](#10-css-architecture)
11. [Performance Considerations](#11-performance-considerations)
12. [Outstanding Issues](#12-outstanding-issues)

---

## 1. Project Structure

### 1.1 Directory Map

```
apps/frontend/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx             # Root layout: fonts, Providers
│   ├── template.tsx
│   ├── globals.css             # Design tokens, all CSS variables
│   ├── page.tsx               # Root redirect
│   ├── login/page.tsx
│   ├── denim/                  # ── Denim module (main ERP UI) ──
│   │   ├── layout.tsx         # Shell: Sidebar + mobile header + orbs
│   │   ├── page.tsx            # Role-based redirect
│   │   ├── sales-contract/page.tsx
│   │   ├── my-orders/page.tsx
│   │   ├── new-order/page.tsx
│   │   ├── orders/[kp]/page.tsx
│   │   ├── admin/              # Admin-specific pages
│   │   │   ├── dashboard/page.tsx      # → AdminDashboardPage.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[kp]/page.tsx
│   │   │   ├── analytics/page.tsx       # → AnalyticsPage.tsx
│   │   │   ├── fabric-specs/page.tsx   # → FabricSpecsPage.tsx
│   │   │   ├── kp-archive/page.tsx
│   │   │   ├── warping/page.tsx
│   │   │   ├── indigo/page.tsx
│   │   │   ├── weaving/page.tsx
│   │   │   └── pipeline/page.tsx
│   │   ├── inbox/             # Stage inboxes (factory view)
│   │   │   ├── warping/
│   │   │   ├── indigo/
│   │   │   ├── weaving/
│   │   │   ├── inspect-gray/
│   │   │   ├── bbsf/
│   │   │   └── inspect-finish/
│   │   └── approvals/
│   │       ├── pending/page.tsx
│   │       ├── approved/page.tsx
│   │       └── rejected/page.tsx
│   ├── (spinning)/            # Separate spinning division
│   ├── sacon/                 # ── Legacy SACON module ──
│   ├── warping/               # ── Legacy warping module ──
│   ├── indigo/                # ── Legacy indigo module ──
│   ├── weaving/               # ── Legacy weaving module ──
│   ├── inspect-gray/
│   ├── production/
│   ├── quality/
│   ├── admin/
│   └── tests/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Main sidebar (role-based nav)
│   │   └── PageHeader.tsx    # Sticky page header
│   ├── ui/                   # ── Shared UI primitives ──
│   │   ├── button.tsx        # CVA Button (6 variants)
│   │   ├── input.tsx         # Labeled input with error state
│   │   ├── select.tsx        # Radix select
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── form.tsx           # React Hook Form + Zod
│   │   ├── card.tsx           # 9 card variants
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   ├── dialog.tsx         # Radix dialog
│   │   ├── dropdown-menu.tsx  # Radix dropdown
│   │   ├── table.tsx
│   │   ├── skeleton.tsx       # Shimmer skeleton
│   │   ├── sonner.tsx         # Sonner toaster config
│   │   ├── tooltip.tsx
│   │   ├── Alert.tsx
│   │   ├── Pagination.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FilterBar.tsx
│   │   ├── EmptyState.tsx     # 5 empty state variants
│   │   ├── CollapsibleFilters.tsx
│   │   ├── DataGrid.tsx        # ── Spreadsheet grid ──
│   │   ├── DataGrid.css
│   │   ├── motion.tsx           # ── Framer Motion system ──
│   │   ├── ThemeToggle.tsx     # ── Dark mode toggle ──
│   │   └── index.ts            # Barrel export
│   ├── denim/                  # ── Denim feature components ──
│   │   ├── NewOrderPage.tsx
│   │   ├── MyOrdersPage.tsx
│   │   ├── PendingApprovalsPage.tsx
│   │   ├── OrderFilterBar.tsx
│   │   ├── InboxTable.tsx
│   │   ├── KpContextBanner.tsx
│   │   ├── Skeletons.tsx
│   │   ├── SuspenseLoader.tsx
│   │   ├── IndigoFormPage.tsx
│   │   ├── WarpingFormPage.tsx
│   │   ├── WeavingFormPage.tsx
│   │   ├── BBSFFormPage.tsx
│   │   ├── InspectFinishFormPage.tsx
│   │   └── InspectGrayFormPage.tsx
│   └── denim/admin/            # ── Admin feature components ──
│       ├── AdminDashboardPage.tsx    # Admin dashboard + charts
│       ├── AdminOrdersPage.tsx
│       ├── AnalyticsPage.tsx        # KPI + KP comparison
│       ├── FabricSpecsPage.tsx
│       ├── KpArchivePage.tsx
│       ├── OrderDetailPage.tsx       # Order detail + pipeline viz
│       ├── RollTraceDrawer.tsx
│       └── StageCard.tsx            # Pipeline stage card
├── hooks/
│   ├── useDataGrid.ts          # DataGrid state management
│   └── usePersistedState.ts    # localStorage state
├── lib/
│   ├── AuthContext.tsx          # Auth provider
│   ├── auth.ts                  # JWT decode, token helpers
│   ├── authFetch.ts             # Auth-aware fetch
│   ├── api.ts                   # apiCall wrapper
│   ├── chart-theme.ts           # Recharts theming
│   ├── types.ts                 # Shared types
│   ├── utils.ts                 # cn(), date formatters
│   ├── numberFormat.ts
│   └── server-prisma.ts
└── public/
```

### 1.2 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | ^15 | Framework |
| `react` / `react-dom` | ^19 | UI |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4.2.1 | Styling (v4!) |
| `tailwind-merge` | ^3 | Class name merging |
| `class-variance-authority` | ^0.7 | Component variant API |
| `framer-motion` | ^12 | Animations |
| `lucide-react` | ^0.575 | Icons |
| `recharts` | ^3.7 | Charts |
| `react-hook-form` | ^7.71 | Forms |
| `@hookform/resolvers` | | Zod resolver |
| `zod` | ^4.3 | Schema validation |
| `date-fns` | ^4.1 | Date formatting |
| `socket.io-client` | ^4.8 | Real-time sync (TRIPUTRA) |
| `sonner` | ^2.0 | Toast notifications |
| `@radix-ui/*` | various | Accessible primitives |
| `@prisma/client` | ^6 | Database ORM |

---

## 2. Design Token System

All design tokens live in **`app/globals.css`** and are defined in two layers:

### 2.1 Tailwind v4 `@theme` Block

```css
@theme {
  /* Colors */
  --color-primary: #003D6B;
  --color-primary-light: #0057A0;
  --color-primary-pale: #EBF3FA;
  --color-on-primary: #FFFFFF;

  --color-secondary: #4F606E;
  --color-secondary-pale: #D2E4F0;
  --color-on-secondary: #0B1D29;

  --color-surface-base: #F2F6FA;
  --color-surface-card: #EDF3F9;
  --color-surface-elevated: #F8FBFE;
  --color-surface-input: #E2EBF3;

  --color-on-surface: #111827;
  --color-on-surface-muted: #4B5563;
  --color-outline: #9CA3AF;
  --color-outline-subtle: #E5E9F0;

  --color-brand-copper: #B84800;
  --color-brand-copper-pale: #FDF0E6;

  --color-status-complete: #059669;
  --color-status-error: #DC2626;
  --color-status-warning: #D97706;

  /* Pipeline stage colors */
  --status-pending:    #D97706;
  --status-warping:   #003D6B;
  --status-indigo:    #006874;
  --status-weaving:   #059669;
  --status-inspect:   #B45309;
  --status-bbsf:      #6750A4;
  --status-finish:    #9F1239;
  --status-complete:   #059669;
  --status-rejected:  #DC2626;

  /* Fonts */
  --font-display: 'Plus Jakarta Sans';
  --font-sans: 'DM Sans';
  --font-mono: 'IBM Plex Mono';
}
```

> **Note:** `Plus Jakarta Sans`, `DM Sans`, and `IBM Plex Mono` are loaded via `next/font/google` in `app/layout.tsx`. `IBM Plex Mono` is used exclusively for KP codes, numeric data, and `<kbd>` elements.

### 2.2 CSS Custom Properties (Raw, Below `@theme`)

These supplement the Tailwind tokens with non-standard values:

```css
/* Motion duration scale */
--dur-instant:  80ms;
--dur-fast:     150ms;
--dur-normal:   250ms;
--dur-slow:     400ms;
--dur-glacial:  600ms;
--dur-page:     350ms;

/* Motion easing curves */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-sharp:  cubic-bezier(0.4, 0, 0.2, 1);

/* MD3 Elevation Shadows — Light Mode */
--md-shadow-1:  0 1px 2px rgba(0,0,0,0.06);
--md-shadow-2:  0 2px 6px rgba(0,0,0,0.08);
--md-shadow-4:  0 4px 12px rgba(0,0,0,0.10);
--md-shadow-8:  0 8px 24px rgba(0,0,0,0.12);

/* Glassmorphism — Light */
--glass-bg:     rgba(248, 251, 254, 0.80);
--glass-border: rgba(255, 255, 255, 0.65);
--glass-blur:   12px;

/* Copper glow */
--copper-glow:  0 0 20px rgba(212, 99, 10, 0.25);

/* Sidebar — Light mode default */
--sidebar-bg:          #0B1117;
--sidebar-text:        #8B9AAD;
--sidebar-text-active: #FFFFFF;
--sidebar-active-bg:   rgba(74, 159, 212, 0.20);

/* Typography scale */
--text-hero:  3rem;   /* 48px — hero headings */
--text-title: 2rem;    /* 32px — page titles */
--text-h2:    1.5rem; /* 24px — section headings */
--text-h3:    1.25rem;/* 20px — card titles */
--text-body:  1rem;    /* 16px — body */
--text-sm:    0.875rem;/* 14px — secondary */
--text-xs:    0.75rem; /* 12px — labels, captions */
--text-2xs:   0.6875rem;/* 11px — metadata */
```

### 2.3 Dark Mode Tokens (`.dark` class)

When `.dark` is added to `<html>`, the following override the light tokens:

```css
--color-surface-base:     hsl(215 28% 7%);   /* #0B1117 */
--color-surface-card:     hsl(215 24% 11%);   /* #131C28 */
--color-surface-elevated: hsl(215 22% 16%);   /* #1A2535 */
--color-surface-input:    hsl(215 20% 18%);   /* #1E2A38 */
--color-on-surface:       hsl(210 20% 88%);   /* #E8ECF0 */
--color-on-surface-muted: hsl(215 15% 50%);   /* #8B9AAD */
--color-outline:          hsl(215 15% 30%);   /* #4A5A6B */
--color-outline-subtle:   hsl(215 20% 18%);  /* #1E2B38 */
--color-primary-pale:     rgba(74, 159, 212, 0.12); /* luminous blue */

--glass-bg:     rgba(19, 28, 40, 0.82);
--glass-border: rgba(255, 255, 255, 0.06);
--glass-blur:   16px;

--copper-glow:  0 0 20px rgba(212, 99, 10, 0.40);
--color-brand-copper-pale: rgba(212, 99, 10, 0.10);

/* MD3 Shadows — Dark Mode (deeper) */
--md-shadow-1:  0 1px 3px rgba(0,0,0,0.30);
--md-shadow-2:  0 2px 8px rgba(0,0,0,0.40);
--md-shadow-4:  0 4px 16px rgba(0,0,0,0.50);
--md-shadow-8:  0 8px 32px rgba(0,0,0,0.60);
```

---

## 3. Theme / Dark Mode Mechanism

### 3.1 Implementation

The dark mode system is **custom-built** without `next-themes` (despite it being in `package.json` — it is installed but not used).

**Component:** `components/ui/ThemeToggle.tsx`

```
Mechanism:
  1. On mount: reads localStorage → else reads prefers-color-scheme
  2. useEffect toggles classList.add/remove('dark') on document.documentElement
  3. localStorage persists choice
  4. SSR hydration guard (!mounted) returns empty placeholder to avoid flash
```

```typescript
// Simplified
function ThemeToggle({ variant = 'default' | 'sidebar' }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());  // localStorage or prefers-color-scheme
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  // ...
}
```

### 3.2 The Sidebar Inversion Rule

The sidebar **inverts compared to the app**. This is an intentional design choice:

| App Mode | Sidebar Background | Sidebar Text |
|---|---|---|
| Light mode | `#0B1117` (dark navy) | `#8B9AAD` (muted) → `#FFFFFF` (active) |
| Dark mode | `#FFFFFF` (white) | `#64748B` (slate) → `#0F172A` (active) |

This is implemented via **inline `<style>` injection** inside the Sidebar component, scoped to `aside[data-sidebar]`:

```css
:root:not(.dark) aside[data-sidebar] {
  --sb-bg:      #0B1117;
  --sb-text:    #8B9AAD;
  --sb-pill-border: #4A9FD4;
  /* ... */
}
.dark aside[data-sidebar] {
  --sb-bg:      #FFFFFF;
  --sb-text:    #64748B;
  --sb-pill-border: #003D6B;
  /* ... */
}
```

All Sidebar inline styles reference `var(--sb-*)` variables, never hardcoded colors.

### 3.3 At-Mospheric Background

The root layout renders three atmospheric elements via `app/denim/layout.tsx`:

1. **`.app-bg`** — Base gradient + SVG noise texture overlay (opacity: 0.015, GPU-accelerated via `will-change: transform; transform: translateZ(0)`)
2. **`.orb`** (3 variants) — Floating blur orbs using `filter: blur(60px)` + radial gradients. Animates via `@keyframes orbFloatA/B/C`.
3. **`@keyframes liveDot`** — Pulsing dot animation for live indicators.

---

## 4. Sidebar Design System

**File:** `components/layout/Sidebar.tsx`

### 4.1 Role-Based Navigation

Three role configs map to different navigation groups:

| Role | Navigation Groups |
|---|---|
| `factory` | Overview (Dashboard, My Orders, New Order) + Production Inbox (6 stages) |
| `jakarta` | Overview (Dashboard, Pending Approval, Approved, Rejected) |
| `admin` | Overview (Dashboard, All Orders, KP Archive, Fabric Specs, Analytics) + Pipeline (6 stages) + Approvals (3) |

Role colors for the user badge:
- Factory: `#059669` green
- Jakarta: `#4A9FD4` blue
- Admin: `#F59E0B` amber

### 4.2 Visual Features

| Feature | Implementation |
|---|---|
| **Sliding active pill** | Framer Motion `layoutId="sidebar-active-indicator"` — animates between nav items |
| **Collapse/expand** | Width: 256px ↔ 64px, icons animate rotation (PanelLeftClose/Open) |
| **User badge** | Shows name + role-colored pill |
| **Group titles** | Uppercase, letter-spaced, only when expanded |
| **Active indicator** | Luminous blue pill (`rgba(74,159,212,0.20)`) with `#4A9FD4` left-border |
| **Sign-out** | Hover: red tint (`rgba(220,38,38,0.12)`), white text |
| **Theme toggle** | Sun/Moon icon button in footer |

### 4.3 Layout Structure

```
<aside data-sidebar class="h-screen flex flex-col">
  <!-- Atmospheric orb -->
  <div class="absolute orb" />
  
  <!-- Header: Logo + Collapse toggle (flex-shrink-0) -->
  <div class="px-3 py-4 flex items-center gap-3">...</div>
  
  <!-- User badge (flex-shrink-0) -->
  <div class="px-3 pb-3">...</div>
  
  <!-- Nav: fills remaining space (flex-1 overflow-y-auto) -->
  <nav ref={navRef}>...</nav>
  
  <!-- Footer: mt-auto + flex flex-col gap-2 p-4 -->
  <div class="mt-auto flex flex-col gap-2 p-4">
    <ThemeToggle />
    <SignOut />
  </div>
</aside>
```

### 4.4 Active Pill Alignment

The nav Link row uses `className="flex items-center gap-3 ..."` — `items-center` ensures the pill, text, and icon are vertically centered regardless of the item height (`minHeight: 40px`).

### 4.5 SVG Icon Color Inheritance

All Lucide icons use `style={{ color: 'currentColor', stroke: 'currentColor' }}` — this makes them inherit the computed `color` from the parent Link/button, ensuring icons always match text contrast (no mismatched icon/text color pairs).

---

## 5. Card & Chart Components

### 5.1 Card Variants (`components/ui/card.tsx`)

| Variant | Description | Hover Effect |
|---|---|---|
| `Card` | Base: 24px radius, neumorphic shadow | None |
| `CardStatic` | Same as Card, no transition | None |
| `CardElevated` | Uses `useState` to track hover | `translateY(-2px)` + deeper shadow |
| `CardOutlined` | Subtle border | Lift + border color |
| `CardGlass` | `backdrop-filter: blur(12px) saturate(180%)` | — |
| `CardGlassShimmer` | Premium: animated conic-gradient border on hover | 2s rotating border animation |
| `CardTilt` | 3D perspective tilt mapped to cursor | Cursor-tracked rotation |
| `CardAnimated` | Framer Motion `ScaleIn` wrapper | Scale entrance |
| `Card` | (default, see above) | — |

**CardTilt** uses `useMotionValue` + `useSpring` from Framer Motion to track cursor position, applying `perspective: 600px` and `max rotateX/Y: 4deg` for a subtle 3D tilt effect. A `GlowFollower` div tracks the cursor with a radial gradient.

**CardGlassShimmer** uses a `::before`/`::after` dual pseudo-element technique with `mask-composite: exclude` to create an animated conic-gradient border that rotates continuously on hover.

### 5.2 Chart Theming (`lib/chart-theme.ts`)

```typescript
CHART_COLORS = {
  primary: '#003D6B',
  indigo: '#006874',
  emerald: '#059669',
  amber: '#D97706',
  rose: '#DC2626',
  copper: '#B84800',
  purple: '#6750A4',
};

// Tooltip: glass-style panel with blur and white border
CHART_TOOLTIP_STYLE = {
  backgroundColor: '#EDF3F9',
  border: '1px solid rgba(193,199,206,0.6)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  color: '#111827',
  fontSize: '12px',
};

// Dark mode tooltip variant: #131C28 bg, slate border
CHART_GRID = { strokeDasharray: '4 4', stroke: '#E5E9F0', strokeOpacity: 0.5 };
CHART_GRID_DARK = { strokeDasharray: '4 4', stroke: '#2D3D50', strokeOpacity: 0.5 };
CHART_ANIMATION = { duration: 500, begin: 100 }; // off for {useReducedMotion}
```

Charts used: `AreaChart` (efficiency trends), `BarChart` (pipeline status, machine breakdowns), `LineChart`, `ResponsiveContainer`.

### 5.3 StatCard Component Pattern

Both `AdminDashboardPage.tsx` and `denim/page.tsx` define a local `StatCard` component with two variants:

| Prop | Light Mode | Dark Mode |
|---|---|---|
| `hero={true}` | `bg-blue-100 border-blue-200` | `dark:bg-[#1A3350] dark:border-[#4A9FD4]/30` |
| `hero={false}` | `bg-white border-slate-200` | `dark:bg-[#1A2535] dark:border-slate-800` |

All text uses explicit Tailwind `text-slate-900 dark:text-white` / `text-slate-500 dark:text-slate-400` pairs.

---

## 6. DataGrid Architecture

**Files:** `components/ui/DataGrid.tsx`, `components/ui/DataGrid.css`, `hooks/useDataGrid.ts`

### 6.1 Concept

The DataGrid is an **editable inline spreadsheet** — not a display table. Every row has editable inputs that track dirty/saving/error states, with per-row save buttons.

### 6.2 Types

```typescript
// Column definition
interface ColumnDefinition {
  id: string;
  label: string;
  width: number;
  type: 'text' | 'number' | 'date';
  placeholder?: string;
  readOnly?: boolean;
}

// Row state
interface BaseGridRow {
  _localId: string;
  _status: 'new' | 'clean' | 'dirty' | 'saving' | 'error';
  _error?: string;
  id: number | null;
  [key: string]: unknown;
}

// Config
interface DataGridConfig {
  columns: ColumnDefinition[];
  columnGroups?: ColumnGroup[];
  apiEndpoint?: string;
  dateField?: string;
  requiredFields?: string[];
  createEmptyRow: () => BaseGridRow;
  mapRecordToRow: (record: any) => BaseGridRow;
  buildSubmitPayload: (row: BaseGridRow) => object;
}
```

### 6.3 Hook State (`useDataGrid`)

| State | Type | Purpose |
|---|---|---|
| `rows` | `BaseGridRow[]` | All rows including empty new row at bottom |
| `filters` | `Record<string, string>` | Filter state by field ID |
| `activeCell` | `{rowIndex, colIndex} | null` | Focused input tracking |
| `pendingFocus` | `{row, col} | null` | Deferred focus after render |
| `loading` | `boolean` | API loading state |
| `savingRowId` | `string | null` | Currently saving row |
| `groupHeaderCells` | `ColumnGroup[]` | Computed from config |
| `pagination` | `{pageIndex, totalPages, pageStart, pageEnd, setPageIndex}` | 10 rows/page |
| `filteredRows` | Derived | Rows after filter |
| `visibleRows` | Derived | Filtered rows sliced to current page |

### 6.4 Features

- **Cell navigation**: Arrow keys (up/down = prev/next row), Tab/Shift+Tab (next/prev col), Enter (next row, auto-adds row at end)
- **Row states**: Clean (default), Dirty (copper bg tint `#FDF0E6`), Saving (shimmer sweep animation), Error (red left border `#DC2626`)
- **Density modes**: `spacious` (24px card radius, 14px font) vs `compact` (12px radius, 13px font)
- **Dark mode**: via `.dark` CSS overrides in `DataGrid.css`
- **Borders in dark mode**: `dark:border-slate-800` (subtle charcoal, not glaring)
- **Pagination**: Previous/Next + "Page X of Y" + row range ("Showing rows 1–10 of 142")
- **Filter bar**: compact utility row with `py-2.5 px-4`, text/date/select field types

---

## 7. All Routes & Pages

### Denim Module (Main ERP UI)

| Route | Component | Purpose |
|---|---|---|
| `/denim` | `denim/page.tsx` | Role-based redirect |
| `/denim/sales-contract` | `SalesContractPage` | Sales contract listing |
| `/denim/my-orders` | `MyOrdersPage` | Factory user's orders |
| `/denim/new-order` | `NewOrderPage` | New order/sales contract creation |
| `/denim/orders/[kp]` | `OrderDetailPage` | Per-KP order detail (factory) |

**Admin:**
| Route | Component |
|---|---|
| `/denim/admin` | Redirect to dashboard |
| `/denim/admin/dashboard` | `AdminDashboardPage.tsx` — charts + stat cards + tabs |
| `/denim/admin/orders` | `AdminOrdersPage.tsx` — all orders list |
| `/denim/admin/orders/[kp]` | `OrderDetailPage.tsx` — admin order detail |
| `/denim/admin/analytics` | `AnalyticsPage.tsx` — KPI + KP comparison |
| `/denim/admin/fabric-specs` | `FabricSpecsPage.tsx` |
| `/denim/admin/kp-archive` | `KpArchivePage.tsx` |
| `/denim/admin/warping` | Warping stage (admin) |
| `/denim/admin/indigo` | Indigo stage (admin) |
| `/denim/admin/weaving` | Weaving stage (admin) |
| `/denim/admin/pipeline` | Pipeline overview |

**Inbox (Factory):**
Each inbox has listing (`/inbox/{stage}`) and detail (`/inbox/{stage}/[kp]`):
- Warping → Indigo → Weaving → Inspect Gray → BBSF → Inspect Finish

**Approvals (Jakarta):**
- `/denim/approvals/pending`
- `/denim/approvals/approved`
- `/denim/approvals/rejected`

### Legacy Modules (Still Active)

| Route | Module |
|---|---|
| `/sacon` | Sales Contract |
| `/sacon/new`, `/sacon/edit/[id]` | SACON forms |
| `/warping` | Warping |
| `/warping/new`, `/warping/edit/[id]` | Warping forms |
| `/indigo` | Indigo |
| `/indigo/new`, `/indigo/edit/[id]` | Indigo forms |
| `/weaving` | Weaving |
| `/weaving/new`, `/weaving/edit/[id]` | Weaving forms |
| `/inspect-gray` | Inspect Gray |
| `/production` | Production |
| `/quality` | Quality |
| `/admin` | Legacy admin |

---

## 8. Animation Patterns

### 8.1 Framer Motion System (`components/ui/motion.tsx`)

Spring presets use physics-based stiffness/damping:

```typescript
SPRING = {
  bouncy:   { stiffness: 400, damping: 18 }   // button press, toggles
  snappy:   { stiffness: 500, damping: 30 }   // UI state changes
  smooth:   { stiffness: 300, damping: 40 }   // card entrances
  precision:{ stiffness: 600, damping: 28 }    // sidebar indicator
  layout:   { stiffness: 380, damping: 30 }    // shared layout
}
```

Animation components:

| Component | Purpose |
|---|---|
| `StaggerContainer` + `StaggerChild` | Staggered entrance (60ms between items) |
| `InViewFade` | Fade + slide on scroll-into-view (IntersectionObserver) |
| `ScaleIn` | Scale 0.94→1 with spring overshoot on mount |
| `FadeIn` | Simple opacity fade |
| `SlideIn` | Slide from left or right (drawers, panels) |
| `NumberTicker` | Animated counter 0→value on scroll-into-view |
| `AnimatedGroup` | AnimatePresence wrapper |
| `withSpring()` | Helper to merge spring preset + delay |

### 8.2 CSS Keyframe Animations (globals.css)

| Keyframe | Effect |
|---|---|
| `fadeInUp` | translateY(12px)→0 + opacity |
| `fadeInScale` | scale(0.96)→1 + opacity |
| `float` | translateY oscillation |
| `shimmer` / `skeletonShimmer` | Gradient sweep for loading |
| `pageFadeIn` | opacity 0→1 |
| `slideIn` / `slideInLeft` | translateX animation |
| `pulseRing` | scale 1→1.5 + opacity fade |
| `rotateBorder` | 360deg rotation |
| `inputShake` | horizontal shake |
| `orbFloatA/B/C` | floating orb with varied Y oscillation |
| `liveDot` | opacity 1→0.4→1 (2s ease-in-out) |

### 8.3 Reduced Motion

All Framer Motion animations respect `prefers-reduced-motion` via `useReducedMotion()` hook — falls back to `{ duration: 0.01 }` on all transitions. CSS keyframes that could cause vestibular issues (like `inputShake`) have `prefers-reduced-motion` media query overrides.

---

## 9. Key Technical Decisions

### 9.1 Authentication

- **JWT stored in `localStorage`** via `auth.ts` helpers (`getToken`, `setToken`, `removeToken`, `getUserFromToken`)
- **`AuthContext.tsx`** provides `{ user, token, login, logout }` to the tree
- **`RequireAuth.tsx`** HOC wraps protected routes, redirects to `/login`
- **`authFetch.ts`** is a thin wrapper around `fetch()` that injects the `Authorization: Bearer <token>` header

### 9.2 PageHeader

`components/layout/PageHeader.tsx` + `components/ui/PageHeader.tsx` (duplicate) — renders as `sticky top-0 z-10` with:
- Back link (ArrowLeft icon, optional)
- Title + subtitle
- Actions slot (right-aligned)
- Subtle bottom border
- Backdrop blur on dark backgrounds

### 9.3 Denim Layout Shell (`app/denim/layout.tsx`)

Renders:
1. `Sidebar` (desktop) / Mobile hamburger with glass overlay
2. Atmospheric orbs (`orb-primary`, `orb-secondary`, `orb-success`) as absolutely positioned blurs
3. `NotificationToast` component
4. `Toaster` (Sonner)

### 9.4 KP Code System

KP codes are 4-character codes where positions 1-2 are A-Z and positions 3-4 use a digit cipher `QSDTELNJPB` (Q=0, B=9). The encoder/decoder/generator lives at `apps/api/src/lib/kp.ts`. **Must be wrapped in a Prisma `$transaction`** to prevent race conditions on `generateNextKP()`.

### 9.5 Real-Time Sync

`Socket.IO` client connects to the backend for TRIPUTRA live sync — used primarily for the WeavingRecord table which receives live loom data.

### 9.6 Form Handling

React Hook Form + Zod resolver + Zod schemas. Forms use the custom `FormGroup`, `Input`, `Select`, and `Textarea` UI components.

---

## 10. CSS Architecture

### 10.1 Cascade Layers

```
@layer base        → Reset + HTML/body defaults + custom scrollbar
@layer components  → Design system tokens (CSS vars, shadows, colors)
@layer utilities   → Custom utility classes
@layer variants   → Tailwind custom variants (md:dark, etc.)
@layer overrides  → Shadcn HSL mappings
```

### 10.2 Custom Utilities in globals.css

| Class | Effect |
|---|---|
| `.app-bg` | Radial + base gradient + noise texture, GPU-accelerated |
| `.orb`, `.orb-primary`, `.orb-secondary`, `.orb-success` | Floating atmospheric blurs |
| `.glass-panel` | Backdrop-filter glass effect |
| `.neumorphic` | Dual-shadow neumorphic depth |
| `.neumorphic-inset` | Inset neumorphic (pressed) |
| `.md-sidebar-item` | Sidebar nav item (active pill + hover) |
| `.data-grid-*` | DataGrid-specific styles |
| `.page-layout` | Standard page padding (`p-6 lg:p-10`) |
| `.density-spacious` | Spacious density row (56px height) |
| `.density-compact` | Compact density row (40px height) |
| `.elevation-hover` | Hover box-shadow transition |

### 10.3 Custom Scrollbar

Custom thin scrollbar: 6px width, `transparent` track, `#C1C7CE` thumb with hover darkening.

### 10.4 Text Selection Color

`::selection` uses `#D6E9F8` background with `#003D6B` text.

---

## 11. Performance Considerations

| Issue | Solution |
|---|---|
| Framer Motion `layout`/`layoutId` on DataGrid rows | Removed — rows are now standard `<tr>` elements with CSS hover states |
| SVG noise texture GPU lag | Reduced opacity to 0.015, added `will-change: transform; transform: translateZ(0)` |
| Infinite Framer Motion loops | Replaced with CSS `@keyframes` (pulse, shimmer, liveDot, float) |
| Chart containers with fixed heights | Changed to `flex-1 min-h-[300px]` + `height="100%"` on ResponsiveContainer so charts fill their cards |
| Table row re-renders | DataGrid rows use `key={row._localId}` with `React.memo`-friendly pattern |
| SSR hydration mismatch | ThemeToggle uses `mounted` state guard |

---

## 12. Outstanding Issues

### Known Bugs

1. **Analytics Tab 3 KP Comparison**: Warping/Indigo/Weaving rows show dashes. Root cause: `GET /admin/pipeline/:kp` returns weaving as a raw array but the frontend expects `weavingSummary` object. Fix documented in `HANDOFF_2026-03-22.md` Section 7, Prompts A + B + C.

2. **Approvals pages (`approved/page.tsx`, `rejected/page.tsx`)**: Have pre-existing TypeScript errors unrelated to current dark mode work (syntax issues at line 56 in both files).

### Missing Database Indexes

`WeavingRecord` is missing composite indexes on a 245k-row table:
```sql
@@index([kp, tanggal])
@@index([machine, tanggal])
@@index([kp, machine])
```
Add via: `npx prisma migrate dev --name add-weaving-indexes`

### Design Debt

- **`components/ui/PageHeader.tsx`** and **`components/layout/PageHeader.tsx`** are duplicates — consolidate into one.
- The `StatusPill` component in `AdminDashboardPage.tsx` uses a `MutationObserver` for dark mode tracking — this is a stopgap. A better approach would be to use a shared `useTheme` hook from `AuthContext` or a Zustand store.
- The legacy module routes (`/sacon`, `/warping`, `/indigo`, etc.) are still active and not dark-mode compatible — they should eventually be migrated to the denim module or deprecated.

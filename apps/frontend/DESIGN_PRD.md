# SINARAN ERP — Premium Denim Redesign PRD
**Version 2.0 | PT Triputra Textile | Frontend Redesign**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Principles](#2-design-principles)
3. [Design System — Colors](#3-design-system--colors)
4. [Design System — Typography](#4-design-system--typography)
5. [Design System — Spacing & Radius](#5-design-system--spacing--radius)
6. [Design System — Shadows & Effects](#6-design-system--shadows--effects)
7. [Component Specs — Core UI](#7-component-specs--core-ui)
8. [Component Specs — Layout](#8-component-specs--layout)
9. [Page Redesigns](#9-page-redesigns)
10. [Animation & Motion](#10-animation--motion)
11. [Implementation Phases](#11-implementation-phases)
12. [File Changelist](#12-file-changelist)

---

## 1. Executive Summary

### Problem Statement
The current Sinaran ERP frontend uses a generic blue-and-white corporate palette with a dark navy sidebar. While functional, it lacks visual identity, premium feel, and thematic coherence. The UI is dense, visually flat, and difficult to navigate at a glance.

### Vision
Transform Sinaran ERP into a **premium denim-native experience** — a UI that feels like it was crafted by and for the world's finest denim manufacturers. The redesign honors the material (raw indigo, washed blue, gold selvage thread, cotton white) while delivering a world-class enterprise dashboard aesthetic on par with Linear, Vercel, or Notion's best moments.

### Goals
- **No API/functionality changes** — pure visual/layout redesign
- Establish a cohesive "Premium Denim" design language
- Improve information hierarchy and scannability
- Add premium polish: depth, texture, micro-interactions
- Maintain all role-based behavior (admin/factory/jakarta/user)

### Scope
- `app/globals.css` — Complete token redesign
- `components/layout/sidebar/` — Sidebar redesign
- `components/ui/` — All base components
- `components/denim/` — All denim module pages
- Login page, Dashboard, Analytics, Pipeline, Approvals

---

## 2. Design Principles

### 2.1 Raw to Refined
Like denim itself — raw fabric that gains beauty over use — every screen should feel **purposefully crafted**, not corporate-generic. Dark depths, rich indigo blues, and golden selvage accents tell the story of the material.

### 2.2 Data First, Beautiful Always
This is a manufacturing operations tool. Data density matters. But density ≠ cluttered. We achieve **spacious clarity**: generous padding, clear hierarchy, and breathing room that makes dense tables readable.

### 2.3 Premium Without Pretense
Glassmorphism, depth, and sophisticated shadows — but never decoration for decoration's sake. Every visual treatment must serve the user's ability to read, act, or understand.

### 2.4 System Coherence
Every component speaks the same design language: consistent radius, consistent shadows, consistent spacing, consistent motion timing. The whole feels like one material, one thread.

---

## 3. Design System — Colors

### 3.1 Brand Color Philosophy

| Channel | Inspiration | Role |
|---------|------------|------|
| **Indigo Dark** | Raw unwashed denim | Sidebar, dark surfaces, navigation |
| **Denim Blue** | Washed indigo | Primary actions, links, active states |
| **Cotton** | Undyed cotton thread | Page backgrounds, content surfaces |
| **Selvage Gold** | Gold thread/rivets | Accents, premium CTA, highlights |
| **Slate** | Stone-washed neutrals | Text, borders, muted elements |

### 3.2 Complete Color Token Table

Paste this into `app/globals.css`:

```css
/* ============================================================
   SINARAN ERP — PREMIUM DENIM DESIGN SYSTEM v2.0
   ============================================================ */

:root {
  /* ──────────────────────────────────────
     INDIGO DARK CHANNEL (sidebar & dark surfaces)
     Inspired by: raw 14oz Japanese selvedge denim
     ────────────────────────────────────── */
  --indigo-950:  #08101F;   /* Near-black, like pure overdyed indigo */
  --indigo-900:  #0D1B3E;   /* Base sidebar background - raw denim */
  --indigo-850:  #111F47;   /* Sidebar section headers */
  --indigo-800:  #162150;   /* Hover state on dark */
  --indigo-750:  #1C2960;   /* Active item background */
  --indigo-700:  #1E3A8A;   /* Used in dark accents */

  /* Sidebar surface variables */
  --sidebar-bg:              var(--indigo-900);
  --sidebar-surface:         var(--indigo-850);
  --sidebar-hover:           rgba(255, 255, 255, 0.055);
  --sidebar-active-bg:       rgba(245, 158, 11, 0.12);
  --sidebar-border:          rgba(255, 255, 255, 0.07);
  --sidebar-divider:         rgba(255, 255, 255, 0.04);

  /* Sidebar text */
  --sidebar-text:            rgba(255, 255, 255, 0.52);
  --sidebar-text-muted:      rgba(255, 255, 255, 0.28);
  --sidebar-text-active:     #FFFFFF;
  --sidebar-text-section:    rgba(255, 255, 255, 0.30);

  /* Selvage gold accent (threads, rivets, premium details) */
  --sidebar-accent:          #F59E0B;
  --sidebar-accent-dim:      rgba(245, 158, 11, 0.14);
  --sidebar-accent-glow:     rgba(245, 158, 11, 0.32);
  --sidebar-accent-line:     rgba(245, 158, 11, 0.60);

  /* ──────────────────────────────────────
     DENIM BLUE CHANNEL (primary actions & links)
     Inspired by: 8oz washed indigo chambray
     ────────────────────────────────────── */
  --denim-950:  #0A1628;
  --denim-900:  #0F2448;
  --denim-800:  #1E3A8A;   /* Dark primary */
  --denim-700:  #1D4ED8;   /* Primary (current) - keep for compat */
  --denim-600:  #2563EB;   /* Primary hover */
  --denim-500:  #3B82F6;   /* Links, info */
  --denim-400:  #60A5FA;   /* Light accents */
  --denim-300:  #93C5FD;   /* Focus rings */
  --denim-200:  #BFDBFE;   /* Tint border */
  --denim-100:  #DBEAFE;   /* Tint background */
  --denim-50:   #EFF6FF;   /* Subtlest tint */

  /* Primary semantic aliases */
  --primary:             var(--denim-700);
  --primary-hover:       var(--denim-600);
  --primary-active:      var(--denim-800);
  --primary-dim:         rgba(29, 78, 216, 0.10);
  --primary-ring:        rgba(59, 130, 246, 0.24);

  /* ──────────────────────────────────────
     COTTON CHANNEL (backgrounds & content)
     Inspired by: undyed premium cotton warp
     ────────────────────────────────────── */
  --cotton-white:    #FAFBFF;   /* Page background — very slight cool tint */
  --cotton-surface:  #FFFFFF;   /* Card / panel surface */
  --cotton-muted:    #F3F5FB;   /* Subtle fill, alternating rows */
  --cotton-subtle:   #EDF0F9;   /* Hover state on light */
  --cotton-wash:     #E4E8F5;   /* Input border on focus, dividers */

  /* Content area semantic */
  --page-bg:          var(--cotton-white);
  --content-bg:       var(--cotton-surface);
  --card-bg:          var(--cotton-surface);
  --card-bg-muted:    var(--cotton-muted);
  --card-hover:       var(--cotton-subtle);

  /* ──────────────────────────────────────
     SELVAGE GOLD (premium accent)
     Inspired by: gold selvage thread, copper rivets
     ────────────────────────────────────── */
  --gold-600:   #B45309;
  --gold-500:   #D97706;
  --gold-400:   #F59E0B;   /* Primary gold accent */
  --gold-300:   #FCD34D;
  --gold-200:   #FDE68A;
  --gold-100:   #FEF3C7;
  --gold-50:    #FFFBEB;

  /* ──────────────────────────────────────
     SLATE NEUTRALS (text, borders, UI elements)
     Inspired by: stone-washed denim tones
     ────────────────────────────────────── */
  --slate-950:  #0A0E1A;
  --slate-900:  #0F172A;
  --slate-800:  #1E293B;
  --slate-700:  #334155;
  --slate-600:  #475569;
  --slate-500:  #64748B;
  --slate-400:  #94A3B8;
  --slate-300:  #CBD5E1;
  --slate-200:  #E2E8F0;
  --slate-150:  #EBF0F6;
  --slate-100:  #F1F5F9;
  --slate-50:   #F8FAFC;

  /* Text semantic */
  --text-primary:    var(--slate-900);
  --text-secondary:  var(--slate-600);
  --text-muted:      var(--slate-400);
  --text-disabled:   var(--slate-300);
  --text-inverse:    #FFFFFF;
  --text-brand:      var(--denim-700);

  /* Border semantic */
  --border:       var(--slate-200);
  --border-2:     var(--slate-300);
  --border-focus: var(--denim-500);
  --border-error: #EF4444;

  /* ──────────────────────────────────────
     SEMANTIC / STATUS COLORS
     ────────────────────────────────────── */

  /* Success — like green cotton weft */
  --success:        #059669;
  --success-hover:  #047857;
  --success-bg:     #ECFDF5;
  --success-border: #A7F3D0;
  --success-text:   #065F46;

  /* Warning — amber thread */
  --warning:        #D97706;
  --warning-hover:  #B45309;
  --warning-bg:     #FFFBEB;
  --warning-border: #FDE68A;
  --warning-text:   #92400E;

  /* Danger — red flag */
  --danger:         #DC2626;
  --danger-hover:   #B91C1C;
  --danger-bg:      #FEF2F2;
  --danger-border:  #FECACA;
  --danger-text:    #991B1B;

  /* Info — cool blue */
  --info:           #2563EB;
  --info-hover:     #1D4ED8;
  --info-bg:        #EFF6FF;
  --info-border:    #BFDBFE;
  --info-text:      #1E40AF;

  /* Pipeline stage colors — thread spectrum */
  --stage-warping:        #6366F1;   /* Violet — thread warping */
  --stage-warping-bg:     #EEF2FF;
  --stage-indigo:         #1D4ED8;   /* Deep indigo — dyeing */
  --stage-indigo-bg:      #EFF6FF;
  --stage-weaving:        #0891B2;   /* Teal — loom weaving */
  --stage-weaving-bg:     #ECFEFF;
  --stage-inspect-gray:   #64748B;   /* Slate — gray fabric */
  --stage-inspect-bg:     #F8FAFC;
  --stage-bbsf:           #D97706;   /* Amber — finishing */
  --stage-bbsf-bg:        #FFFBEB;
  --stage-complete:       #059669;   /* Emerald — complete */
  --stage-complete-bg:    #ECFDF5;
  --stage-rejected:       #DC2626;   /* Red — rejected */
  --stage-rejected-bg:    #FEF2F2;
  --stage-draft:          #94A3B8;   /* Muted — draft */
  --stage-draft-bg:       #F8FAFC;
  --stage-sacon:          #7C3AED;   /* Purple — Sacon approval */
  --stage-sacon-bg:       #F5F3FF;
  --stage-approved:       #059669;
  --stage-approved-bg:    #ECFDF5;
  --stage-pending:        #D97706;
  --stage-pending-bg:     #FFFBEB;
  --stage-staled:         #94A3B8;
  --stage-staled-bg:      #F1F5F9;

  /* ──────────────────────────────────────
     CARD & SURFACE TOKENS
     ────────────────────────────────────── */
  --card-border:        var(--slate-200);
  --card-border-hover:  var(--slate-300);
  --card-radius:        14px;
  --card-radius-sm:     10px;
  --card-radius-lg:     18px;
  --card-shadow:        0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --card-shadow-md:     0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);
  --card-shadow-hover:  0 8px 24px rgba(15, 23, 42, 0.12), 0 3px 8px rgba(15, 23, 42, 0.06);
  --card-shadow-lg:     0 16px 40px rgba(15, 23, 42, 0.14), 0 6px 16px rgba(15, 23, 42, 0.08);

  /* ──────────────────────────────────────
     RADIUS TOKENS
     ────────────────────────────────────── */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius:      8px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   18px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ──────────────────────────────────────
     FOCUS RING
     ────────────────────────────────────── */
  --ring:        0 0 0 3px var(--primary-ring);
  --ring-error:  0 0 0 3px rgba(239, 68, 68, 0.20);
  --ring-gold:   0 0 0 3px rgba(245, 158, 11, 0.24);

  /* ──────────────────────────────────────
     LAYOUT TOKENS
     ────────────────────────────────────── */
  --sidebar-width:           272px;
  --sidebar-collapsed-width: 68px;
  --header-height:           60px;
  --content-max-width:       1440px;

  /* ──────────────────────────────────────
     BACKGROUND (top-level, used by shadcn)
     ────────────────────────────────────── */
  --background:  #FAFBFF;
  --foreground:  var(--slate-900);

  /* Legacy compat */
  --navy:   var(--indigo-900);
  --white:  #FFFFFF;
}
```

### 3.3 Color Usage Guide

| Token | Usage | Don'ts |
|-------|-------|--------|
| `--indigo-900` | Sidebar background only | Never use on content area |
| `--gold-400` | Accent highlights, CTAs, active nav | Don't overuse — keep precious |
| `--denim-700` | Primary buttons, links, active states | Don't use as background at large scale |
| `--cotton-white` | Page background | Don't use for cards (use `--cotton-surface`) |
| `--slate-600` | Secondary text, subtitles | Don't use for body text (too light) |
| `--stage-*` | Pipeline status only | Don't repurpose for general UI |

---

## 4. Design System — Typography

### 4.1 Font Stack

**Keep all 3 existing Google Fonts** (Inter, IBM Plex Mono, Plus Jakarta Sans). Adjust sizing and weight usage.

### 4.2 Type Scale

| Name | Size | Weight | Line-height | Font | Usage |
|------|------|--------|-------------|------|-------|
| `display-2xl` | 36px | 700 | 1.15 | Plus Jakarta Sans | Hero numbers on dashboard |
| `display-xl` | 28px | 700 | 1.2 | Plus Jakarta Sans | Page hero title |
| `display-lg` | 22px | 700 | 1.25 | Plus Jakarta Sans | Section headers |
| `display-md` | 18px | 600 | 1.3 | Plus Jakarta Sans | Card title, modal title |
| `text-xl` | 16px | 600 | 1.4 | Inter | Subheadings |
| `text-lg` | 15px | 500 | 1.5 | Inter | Table column headers |
| `text-base` | 14px | 400 | 1.55 | Inter | Body text (↑ from 13px) |
| `text-sm` | 13px | 400 | 1.5 | Inter | Secondary text, form helpers |
| `text-xs` | 12px | 500 | 1.4 | Inter | Labels, tags, badges |
| `text-2xs` | 11px | 500 | 1.4 | Inter | Tiny metadata |
| `mono-base` | 13px | 400 | 1.5 | IBM Plex Mono | KP codes, data values |
| `mono-sm` | 12px | 400 | 1.5 | IBM Plex Mono | Dense data tables |

### 4.3 CSS Type Utilities

Add to `globals.css`:

```css
/* ──────────────────────────────────────
   TYPOGRAPHY UTILITIES
   ────────────────────────────────────── */
body {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;          /* ↑ from 13px */
  line-height: 1.55;
  color: var(--text-primary);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-display {
  font-family: var(--font-display), system-ui, sans-serif;
  font-feature-settings: 'cv01', 'cv02', 'ss01';
}

.mono, code, .font-mono {
  font-family: var(--font-mono), 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* Heading styles */
h1, .h1 { font-family: var(--font-display); font-size: 28px; font-weight: 700; line-height: 1.2; }
h2, .h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; line-height: 1.25; }
h3, .h3 { font-size: 18px; font-weight: 600; line-height: 1.3; }
h4, .h4 { font-size: 16px; font-weight: 600; line-height: 1.4; }

/* Display number (KPI stats) */
.display-number {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Large KPI */
.kpi-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
}
```

---

## 5. Design System — Spacing & Radius

### 5.1 Spacing Scale (Tailwind defaults apply, key values)

| Token | Value | Usage |
|-------|-------|-------|
| 0.5 | 2px | Tight inline gaps |
| 1 | 4px | Icon-label gap |
| 1.5 | 6px | Compact padding |
| 2 | 8px | Small padding, badge padding |
| 3 | 12px | Card content gap |
| 4 | 16px | Default padding, form group gap |
| 5 | 20px | Section padding |
| 6 | 24px | Card padding |
| 8 | 32px | Section gap |
| 10 | 40px | Page padding |
| 12 | 48px | Hero spacing |

### 5.2 Content Padding

- **Page container:** `px-8 py-7` (32px/28px)
- **Card body:** `p-6` (24px)
- **Card header:** `px-6 py-5` (24px/20px)
- **Table cell:** `px-4 py-3` (16px/12px)
- **Table header cell:** `px-4 py-3` (16px/12px)
- **Form field gap:** `gap-5` (20px)
- **Section gap:** `gap-7` (28px)
- **Sidebar item:** `px-3 py-2.5`

---

## 6. Design System — Shadows & Effects

### 6.1 Shadow System

```css
/* In globals.css */

/* Flat — divider-level */
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.05);

/* Card rest state */
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06),
             0 1px 2px rgba(15, 23, 42, 0.04);

/* Card hover, dropdown */
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08),
             0 2px 4px rgba(15, 23, 42, 0.04);

/* Modal, elevated panel */
--shadow-lg: 0 10px 28px rgba(15, 23, 42, 0.12),
             0 4px 10px rgba(15, 23, 42, 0.06);

/* Sidebar, drawer */
--shadow-xl: 0 20px 48px rgba(15, 23, 42, 0.18),
             0 8px 18px rgba(15, 23, 42, 0.08);

/* Sidebar gold glow accent */
--shadow-gold-sm: 0 0 12px rgba(245, 158, 11, 0.20);
--shadow-gold-md: 0 0 24px rgba(245, 158, 11, 0.30);

/* Primary button glow */
--shadow-primary: 0 4px 14px rgba(29, 78, 216, 0.30);
--shadow-primary-hover: 0 6px 20px rgba(29, 78, 216, 0.40);
```

### 6.2 Glassmorphism (Dashboard stat cards)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.60);
  box-shadow: var(--shadow-md);
}

/* Dark glass (sidebar popups, tooltips on dark bg) */
.glass-dark {
  background: rgba(13, 27, 62, 0.80);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 6.3 Gradient Backgrounds

```css
/* Hero gradient for dashboard */
.gradient-hero {
  background: linear-gradient(135deg,
    var(--indigo-900) 0%,
    #1a2d6b 50%,
    var(--indigo-800) 100%
  );
}

/* Subtle page gradient */
.gradient-page {
  background: linear-gradient(180deg,
    #F0F3FF 0%,           /* faint indigo at top */
    var(--cotton-white) 280px
  );
}

/* Gold gradient (premium CTA) */
.gradient-gold {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

/* Denim card accent top border trick */
.card-indigo-accent::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--denim-700), var(--denim-500));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

/* Gold card accent */
.card-gold-accent::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold-400), var(--gold-300));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
```

---

## 7. Component Specs — Core UI

### 7.1 Button Component

**File:** `components/ui/button.tsx`

#### Variant Specifications:

| Variant | Background | Text | Border | Hover | Shadow |
|---------|-----------|------|--------|-------|--------|
| `primary` | `--denim-700` (#1D4ED8) | White | None | `--denim-600` | `--shadow-primary` |
| `secondary` | `--cotton-muted` (#F3F5FB) | `--slate-700` | `--slate-200` | `--cotton-subtle` | None |
| `outline` | Transparent | `--denim-700` | `--denim-200` | `--denim-50` bg | None |
| `ghost` | Transparent | `--slate-600` | None | `--cotton-subtle` | None |
| `danger` | `--danger` (#DC2626) | White | None | `--danger-hover` | None |
| `gold` | `--gold-400` | `--slate-900` | None | `--gold-500` | `--shadow-gold-sm` |

#### Size Specifications:

| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| `xs` | 28px | `px-3 py-1.5` | 12px, weight 500 | `--radius-sm` |
| `sm` | 32px | `px-3.5 py-2` | 13px, weight 500 | `--radius-sm` |
| `default` | 38px | `px-4 py-2.5` | 14px, weight 500 | `--radius` |
| `lg` | 44px | `px-5 py-3` | 15px, weight 600 | `--radius-md` |

#### Button CSS Changes:
```css
/* Primary button — add glow shadow */
.btn-primary {
  background-color: var(--denim-700);
  color: white;
  box-shadow: var(--shadow-primary);
  transition: background-color 150ms, box-shadow 150ms, transform 100ms;
}
.btn-primary:hover {
  background-color: var(--denim-600);
  box-shadow: var(--shadow-primary-hover);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

/* Gold button */
.btn-gold {
  background: linear-gradient(135deg, var(--gold-400), var(--gold-500));
  color: var(--slate-900);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.28);
}
```

---

### 7.2 Card Component

**File:** `components/ui/card.tsx`

**Core Card Style:**
```css
.card {
  background: var(--cotton-surface);
  border: 1px solid var(--slate-200);
  border-radius: var(--card-radius);        /* 14px */
  box-shadow: var(--shadow-sm);
  transition: box-shadow 200ms, border-color 200ms;
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--slate-300);
}

/* Card with accent stripe */
.card-accent-top {
  /* Use .card-indigo-accent::before or .card-gold-accent::before */
}

/* Stat card variant */
.card-stat {
  background: var(--cotton-surface);
  border: 1px solid var(--slate-150);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}
```

**CardHeader:** `px-6 pt-5 pb-4` with a 1px bottom border `var(--slate-100)`
**CardContent:** `px-6 py-5`
**CardFooter:** `px-6 pb-5 pt-4` with 1px top border `var(--slate-100)`

---

### 7.3 Input Component

**File:** `components/ui/input.tsx`

```css
.input {
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  border-radius: var(--radius);            /* 8px */
  border: 1.5px solid var(--slate-200);
  background: var(--cotton-surface);
  color: var(--text-primary);
  transition: border-color 150ms, box-shadow 150ms;
}

.input::placeholder {
  color: var(--slate-400);
  font-size: 13px;
}

.input:hover {
  border-color: var(--slate-300);
}

.input:focus {
  border-color: var(--denim-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
  outline: none;
}

.input:disabled {
  background: var(--cotton-muted);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

---

### 7.4 Badge Component

**File:** `components/ui/badge.tsx`

All badges: `border-radius: var(--radius-full)`, `font-size: 12px`, `font-weight: 500`, `padding: 2px 10px`

| Variant | Background | Text Color | Border |
|---------|-----------|------------|--------|
| `default` | `--denim-100` | `--denim-800` | None |
| `success` | `--success-bg` | `--success-text` | None |
| `warning` | `--warning-bg` | `--warning-text` | None |
| `danger` | `--danger-bg` | `--danger-text` | None |
| `outline` | Transparent | `--text-secondary` | `--border` |
| `gold` | `--gold-100` | `--gold-600` | None |
| `indigo` | `--denim-50` | `--denim-700` | `--denim-200` |

---

### 7.5 StatusBadge Component

**File:** `components/ui/StatusBadge.tsx`

Each status maps to a CSS class using stage tokens. Updated palette:

| Status | Color var | Background var |
|--------|-----------|----------------|
| DRAFT | `--stage-draft` | `--stage-draft-bg` |
| PENDING_APPROVAL | `--stage-pending` | `--stage-pending-bg` |
| WARPING | `--stage-warping` | `--stage-warping-bg` |
| INDIGO | `--stage-indigo` | `--stage-indigo-bg` |
| WEAVING | `--stage-weaving` | `--stage-weaving-bg` |
| INSPECT_GRAY | `--stage-inspect-gray` | `--stage-inspect-bg` |
| BBSF | `--stage-bbsf` | `--stage-bbsf-bg` |
| INSPECT_FINISH | `--stage-bbsf` | `--stage-bbsf-bg` |
| SACON | `--stage-sacon` | `--stage-sacon-bg` |
| APPROVED | `--stage-approved` | `--stage-approved-bg` |
| COMPLETE | `--stage-complete` | `--stage-complete-bg` |
| REJECTED | `--stage-rejected` | `--stage-rejected-bg` |
| STALED | `--stage-staled` | `--stage-staled-bg` |

**StatusBadge Shape:**
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.status-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Animate dot for active states */
.status-badge-dot.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

### 7.6 Table Design

All tables in the app use a consistent style. Update to:

```css
/* Table wrapper */
.table-container {
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--cotton-surface);
  box-shadow: var(--shadow-sm);
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

/* Header */
thead tr {
  background: var(--cotton-muted);
  border-bottom: 1px solid var(--slate-200);
}

thead th {
  padding: 11px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--slate-500);
  text-align: left;
  white-space: nowrap;
}

/* Body rows */
tbody tr {
  border-bottom: 1px solid var(--slate-100);
  transition: background-color 120ms;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: var(--cotton-muted);
}

tbody td {
  padding: 12px 16px;
  color: var(--text-primary);
  vertical-align: middle;
}

/* Zebra stripe option */
tbody tr:nth-child(even) {
  background: rgba(243, 245, 251, 0.5);
}
tbody tr:nth-child(even):hover {
  background: var(--cotton-muted);
}
```

---

### 7.7 PageShell Component

**File:** `components/ui/erp/PageShell.tsx`

Redesigned layout:

```
┌─────────────────────────────────────────────────────┐
│ [← Back]    Page Title                  [Action Btn] │
│             Subtitle / metadata                      │
├─────────────────────────────────────────────────────┤
│                   page content                      │
└─────────────────────────────────────────────────────┘
```

**CSS for PageShell:**
```css
.page-shell-header {
  padding: 28px 32px 24px;
  border-bottom: 1px solid var(--slate-100);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  background: var(--cotton-surface);
  /* Subtle gradient top */
  background-image: linear-gradient(180deg,
    rgba(238, 241, 249, 0.60) 0%,
    transparent 100%
  );
}

.page-shell-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.page-shell-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.page-shell-content {
  padding: 28px 32px;
}
```

---

### 7.8 Pagination

**File:** `components/ui/Pagination.tsx`

```css
.pagination-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--cotton-surface);
  transition: all 150ms;
}

.pagination-btn:hover {
  border-color: var(--denim-300);
  color: var(--denim-700);
  background: var(--denim-50);
}

.pagination-btn.active {
  background: var(--denim-700);
  border-color: var(--denim-700);
  color: white;
  box-shadow: var(--shadow-primary);
}
```

---

## 8. Component Specs — Layout

### 8.1 Sidebar Redesign

**File:** `components/layout/sidebar/Sidebar.tsx`

#### Visual Concept
The sidebar embodies **raw denim** — dark indigo-black with precisely placed gold selvage thread accents. The top has a subtle gold horizontal line (like selvage tape). Active items glow with warm gold backlight. The brand mark features an interlocking thread motif in gold.

#### Layout Structure:
```
┌────────────────────┐
│ ▲ SINARAN ERP  (×) │  ← Header: logo + brand name + collapse toggle
│   Manufacturing    │    Gold top border line
├────────────────────┤
│ [Section Header]   │  ← section label (small caps, ultra-muted)
│   • Item           │  ← nav item: icon + label + optional badge
│   • Item (active)  │  ← gold left border + gold bg + bright text
│   • Item           │
│  ∨ Section         │  ← collapsible section header
│     ○ Sub item     │
│     ○ Sub item     │
├────────────────────┤
│ [User Profile]     │  ← bottom: avatar + name + role badge + logout
└────────────────────┘
```

#### Sidebar CSS Tokens (update `tokens.ts`):
```typescript
export const sidebarTokens = {
  // Background layers
  bg: '#0D1B3E',                         // raw indigo
  bgSection: 'rgba(255,255,255,0.025)',   // slightly lighter sections
  bgHover: 'rgba(255,255,255,0.055)',
  bgActive: 'rgba(245,158,11,0.12)',

  // Gold accent line at top
  accentLine: '#F59E0B',
  accentLineGlow: 'rgba(245,158,11,0.60)',

  // Active item left border
  activeItemBorder: '#F59E0B',

  // Text hierarchy
  text: 'rgba(255,255,255,0.52)',
  textBold: 'rgba(255,255,255,0.80)',
  textActive: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.28)',
  textSection: 'rgba(255,255,255,0.26)',

  // Icon colors
  iconDefault: 'rgba(255,255,255,0.42)',
  iconActive: '#F59E0B',

  // Badge colors
  badge: {
    admin: { bg: 'rgba(245,158,11,0.18)', text: '#F59E0B' },
    factory: { bg: 'rgba(96,165,250,0.18)', text: '#60A5FA' },
    jakarta: { bg: 'rgba(196,181,253,0.18)', text: '#C4B5FD' },
    user: { bg: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.60)' },
  },

  // Dimensions
  widthExpanded: '272px',
  widthCollapsed: '68px',

  // Effects
  topBorderGlow: '0 1px 12px rgba(245,158,11,0.35)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
}
```

#### Active Nav Item Style:
```css
.sidebar-item-active {
  background: rgba(245, 158, 11, 0.10);
  border-left: 2.5px solid #F59E0B;
  /* Compensate with -2.5px margin or padding */
  padding-left: calc(12px - 2.5px);
  color: white;
}

.sidebar-item-active .sidebar-icon {
  color: #F59E0B;
}
```

#### Section Header:
```css
.sidebar-section-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.26);
  padding: 20px 16px 6px;
}
```

#### Brand Logo area:
```
Exact style: Gold top bar (3px, full width, glow)
Logo: Text "S" in bold Plus Jakarta Sans, 22px, white
       Or circular mark with gold ring
Brand: "SINARAN" 15px, font-display, white, letter-spacing -0.01em
       "ERP" — same line, gold color, weight 700
Subtitle: "Manufacturing" 11px, rgba white 0.40, letter-spacing 0.08em
```

---

### 8.2 Main Layout

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (272px)  │  CONTENT AREA (flex-1)                    │
│   dark indigo    │  ┌──────────────────────────────────────┐ │
│                  │  │  PAGE HEADER (title + actions)       │ │
│   nav items      │  ├──────────────────────────────────────┤ │
│   with gold      │  │  PAGE CONTENT                        │ │
│   accents        │  │  (px-8 py-7, max-w content)          │ │
│                  │  │                                      │ │
│   [user profile] │  └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Page background:** Subtle gradient — `linear-gradient(180deg, #EEF1F8 0%, #FAFBFF 320px)`
This gives a faint "denim tint" at the top that fades to cotton white.

---

## 9. Page Redesigns

### 9.1 Login Page

**Files:** `app/login/page.tsx`, any `LoginPageShell.tsx`, `LoginPageContent.tsx`

#### Layout: Split-screen — 55% / 45%

```
┌──────────────────────┬─────────────────────────┐
│                      │                         │
│   LEFT PANEL         │   RIGHT PANEL           │
│   Dark Denim         │   Login Form            │
│   (55%)              │   (45%)                 │
│                      │                         │
│  [Denim texture bg]  │  Logo + Brand           │
│  [Logo centered]     │  "Welcome back"         │
│  [Brand name]        │  Email field            │
│  [Tagline]           │  Password field         │
│                      │  [Sign In Button]       │
│  "PT Triputra"       │                         │
│  "Textile"           │                         │
└──────────────────────┴─────────────────────────┘
```

**Left Panel Design:**
- Background: `gradient-hero` (indigo-900 to indigo-800, 135deg)
- Subtle denim texture overlay: radial dot pattern at 6% opacity
- Large brand mark (centered): White "SINARAN ERP" in Plus Jakarta Sans 34px
- Below: Tagline "Manufacturing Intelligence" in gold, 14px, tracking wide
- Bottom-left: "PT Triputra Textile" in small white 12px text

**Right Panel Design:**
- Background: `--cotton-white` (#FAFBFF)
- Centered card with max-width 420px
- Logo mark (mini version): 40px
- "Welcome back" — 28px, font-display, font-bold
- "Sign in to Sinaran ERP" — 14px, text-secondary
- Fields with 40px height, clear labels above
- Primary sign-in button: full width, 44px height, `btn-primary` with glow
- Fine print below: company name + version

---

### 9.2 Denim Landing Dashboard

**File:** `components/denim/DenimLandingDashboard.tsx`

#### Layout Redesign:

```
┌──────────────────────────────────────────────────────────┐
│  HERO SECTION                                            │
│  "Good morning, [Name]" — gradient text                  │
│  "Here's what's happening in your factory today."        │
│  Role badge (pill)                                       │
│  [date + time]                                           │
├──────────────────────────────────────────────────────────┤
│  STAT CARDS (4 columns)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Total    │ │ Pending  │ │ In Prod  │ │ Complete │   │
│  │ Orders   │ │          │ │          │ │          │   │
│  │   142    │ │   18     │ │   67     │ │   57     │   │
│  │ ↑8 today │ │ 5 urgent │ │ on track │ │ this wk  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├──────────────────────────────────────────────────────────┤
│  TWO COLUMNS                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐     │
│  │  PIPELINE STATUS     │  │  QUICK ACTIONS        │     │
│  │  (mini progress bars │  │  [New Order]          │     │
│  │   per stage)         │  │  [View All Orders]    │     │
│  │                      │  │  [Approvals]          │     │
│  │  Warping  ████░ 65%  │  │  [Analytics]          │     │
│  │  Indigo   ████ 89%   │  └──────────────────────┘     │
│  │  Weaving  ███░░ 52%  │                               │
│  └──────────────────────┘                               │
└──────────────────────────────────────────────────────────┘
```

#### Stat Card Design:
```css
.stat-card {
  background: var(--cotton-surface);
  border: 1px solid var(--slate-150);
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: box-shadow 200ms, transform 200ms;
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Accent stripe */
.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--denim-700), var(--denim-500));
  opacity: 0;
  transition: opacity 200ms;
}
.stat-card:hover::after {
  opacity: 1;
}

/* Stat number */
.stat-card .value {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 8px 0 6px;
}

/* Trend */
.stat-card .trend-up {
  color: var(--success);
  font-size: 12px;
  font-weight: 600;
}
.stat-card .trend-down {
  color: var(--danger);
  font-size: 12px;
  font-weight: 600;
}

/* Icon container */
.stat-card .icon-wrap {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--denim-50);
  color: var(--denim-700);
  display: flex; align-items: center; justify-content: center;
}
```

---

### 9.3 Admin Dashboard

**File:** `components/denim/admin/AdminDashboardPage.tsx`

#### Tab Bar Design:
```css
.tab-bar {
  display: flex;
  gap: 2px;
  padding: 4px;
  background: var(--cotton-muted);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.tab-item {
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms;
}

.tab-item.active {
  background: var(--cotton-surface);
  color: var(--denim-700);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
```

#### Dashboard KPI Cards:
Use `display-number` class for large stats. Add gold "highlight" card for most important metric:

```css
.kpi-card-gold {
  background: linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%);
  color: white;
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow-primary);
}

.kpi-card-gold .value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.03em;
}

.kpi-card-gold .label {
  font-size: 13px;
  opacity: 0.75;
  margin-top: 4px;
}
```

---

### 9.4 Pipeline Inbox Pages

**Files:** `components/denim/InboxPageClient.tsx`, `InboxTable.tsx`

#### Page Header Design:
```
┌──────────────────────────────────────────────────────────┐
│  STAGE HEADER                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [Stage Icon in colored circle] Stage Name          │ │
│  │ "Processing queue for [stage] production items"    │ │
│  │ [badge: X items pending]   [Filter] [Export]       │ │
│  └────────────────────────────────────────────────────┘ │
│  Breadcrumb: Pipeline / Warping                          │
└──────────────────────────────────────────────────────────┘
```

Each pipeline stage has a distinct color:
- Warping → violet icon circle (`--stage-warping`)
- Indigo → deep blue (`--stage-indigo`)
- Weaving → teal (`--stage-weaving`)
- Inspect Gray → slate (`--stage-inspect-gray`)
- BBSF → amber (`--stage-bbsf`)
- Inspect Finish → emerald (`--stage-complete`)

#### Table Design for Inbox:
- Sticky header row
- KP code in `mono` font with colored left border matching stage
- Status badge using updated StatusBadge design
- Row action button (process/view) appears on row hover
- Alternating row shading (very subtle, 50% opacity of cotton-muted)

---

### 9.5 Order Detail Page

**Files:** `components/denim/admin/KpDetailModal.tsx`, order pages

#### Layout:
```
┌──────────────────────────────────────────────────────────┐
│ ← Back   KP-2024-001                         [Actions ▾] │
│          Sales Contract: SC-001 | Created: 2024-01-15    │
│          Status: IN PRODUCTION                           │
├─────────────────────────┬────────────────────────────────┤
│  LEFT (60%)             │  RIGHT (40%)                   │
│  ORDER DETAILS          │  PIPELINE TIMELINE             │
│  ─ Client               │                                │
│  ─ Fabric type          │  ●─────────────────            │
│  ─ Quantity             │  Warping COMPLETE              │
│  ─ Delivery date        │  ●─────────────────            │
│  ─ Specs                │  Indigo COMPLETE               │
│                         │  ●─────────────────            │
│  DIMENSION TABLE        │  Weaving IN PROGRESS    ← now  │
│  (collapsible)          │  ○─────────────────            │
│                         │  Inspect Gray PENDING           │
│                         │  ○─────────────────            │
└─────────────────────────┴────────────────────────────────┘
```

#### Timeline CSS:
```css
.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 20px;
  position: relative;
}

/* Vertical line */
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 9px; top: 20px;
  width: 2px;
  height: calc(100% - 10px);
  background: var(--slate-200);
}

.timeline-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 2.5px solid;
  background: white;
  flex-shrink: 0;
  margin-top: 1px;
  position: relative;
  z-index: 1;
}

.timeline-dot.complete {
  background: var(--success);
  border-color: var(--success);
}
.timeline-dot.active {
  border-color: var(--denim-700);
  box-shadow: 0 0 0 4px var(--denim-100);
  animation: pulse-ring 2s infinite;
}
.timeline-dot.pending {
  border-color: var(--slate-300);
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 4px var(--denim-100); }
  50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0.10); }
}
```

---

### 9.6 Analytics Page

**File:** `components/denim/admin/AdminAnalyticsPage.tsx`

#### Chart Color Palette (replace recharts colors):

```typescript
export const CHART_COLORS = {
  primary:    '#1D4ED8',   // denim blue
  secondary:  '#6366F1',   // indigo violet
  accent:     '#F59E0B',   // gold
  success:    '#10B981',   // emerald
  warning:    '#F97316',   // orange
  danger:     '#EF4444',   // red
  muted:      '#94A3B8',   // slate
  teal:       '#0891B2',   // teal
  purple:     '#7C3AED',   // violet
};

export const CHART_PALETTE = [
  '#1D4ED8', '#6366F1', '#0891B2', '#059669',
  '#F59E0B', '#F97316', '#EF4444', '#7C3AED',
];
```

#### Chart Card Design:
```css
.chart-card {
  background: var(--cotton-surface);
  border: 1px solid var(--slate-200);
  border-radius: var(--card-radius);
  padding: 0;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.chart-card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--slate-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-card-body {
  padding: 20px 24px 24px;
}
```

---

### 9.7 Approvals Pages

**Files:** `components/denim/PendingApprovalsPage.tsx`, `SaconApprovalsPage.tsx`

#### Empty State Design:
```css
.empty-state {
  text-align: center;
  padding: 64px 32px;
}

.empty-state-icon {
  width: 56px; height: 56px;
  border-radius: var(--radius-xl);
  background: var(--cotton-muted);
  color: var(--slate-400);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state-desc {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 320px;
  margin: 0 auto;
}
```

---

### 9.8 Forms (New Order, New Production, etc.)

All form pages follow this pattern:

#### Form Card Layout:
```
┌──────────────────────────────────────────────────────────┐
│ PAGE HEADER                                              │
│  ← Back   New Order               [Save Draft] [Submit] │
├──────────────────────────────────────────────────────────┤
│  FORM CARD                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Section 1: Order Information         (heading)  │   │
│  │  ─────────────────────────────────────────────   │   │
│  │  [Field Group: 2 columns]                        │   │
│  │                                                  │   │
│  │  Section 2: Specifications                       │   │
│  │  ─────────────────────────────────────────────   │   │
│  │  [Field Group: 3 columns]                        │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Section divider style:**
```css
.form-section-header {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--slate-500);
  padding-bottom: 12px;
  border-bottom: 1.5px solid var(--slate-200);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section-header::before {
  content: '';
  width: 3px;
  height: 14px;
  background: var(--denim-700);
  border-radius: var(--radius-xs);
}
```

---

## 10. Animation & Motion

### 10.1 Timing Functions

```css
/* In globals.css */
:root {
  --ease-default: cubic-bezier(0.16, 1, 0.3, 1);  /* snappy spring */
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-fast:   120ms;
  --duration-base:   200ms;
  --duration-slow:   350ms;
  --duration-enter:  400ms;
}
```

### 10.2 Framer Motion Presets

**Page entry animation:**
```typescript
// Use in all major page components
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

// Stagger children (use on card grids)
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } }
};

export const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};
```

### 10.3 Micro-interactions

| Element | Interaction | Effect |
|---------|------------|--------|
| Stat cards | Hover | `translateY(-2px)` + shadow ↑ |
| Buttons | Hover | `translateY(-1px)` + glow |
| Nav items | Hover | Background fade 120ms |
| Nav active | Mount | Left border slides in 200ms |
| Table rows | Hover | Background 120ms |
| Sidebar collapse | Toggle | Width animates 250ms ease |
| Page load | Mount | FadeSlideUp 350ms |
| Card grid | Mount | Stagger 60ms per card |
| Number stats | Mount | NumberTicker animation |

### 10.4 Sidebar Animation

```typescript
// Sidebar width animation
const sidebarVariants = {
  expanded: { width: 272, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  collapsed: { width: 68, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
};

// Nav item text fade
const navTextVariants = {
  expanded: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
  collapsed: { opacity: 0, x: -8, transition: { duration: 0.15 } }
};
```

---

## 11. Implementation Phases

### Phase 1: Design Foundation (globals.css + tokens)
**Effort:** 1 session | **Risk:** Low (pure CSS changes)

Files to change:
- `app/globals.css` — Replace all color tokens, add new tokens
- `components/layout/sidebar/tokens.ts` — Update sidebar color palette

Verify: Sidebar renders with correct indigo background and gold accents. Page backgrounds show correct cotton-white with faint blue tint.

---

### Phase 2: Core UI Components
**Effort:** 1-2 sessions | **Risk:** Low

Files to change:
- `components/ui/button.tsx` — New variants, sizes, shadows
- `components/ui/card.tsx` — New radius, shadow, hover state
- `components/ui/input.tsx` — New border treatment, focus ring
- `components/ui/badge.tsx` — New stage color palette
- `components/ui/StatusBadge.tsx` — Refined design with new tokens
- `components/ui/erp/PageShell.tsx` — New header gradient, spacing

---

### Phase 3: Sidebar Redesign
**Effort:** 1 session | **Risk:** Medium (visual-only, no logic changes)

Files to change:
- `components/layout/sidebar/Sidebar.tsx` — Visual polish: gold accent line, new hover states, active item border
- `components/layout/sidebar/SidebarItem.tsx` — Active state redesign
- `components/layout/sidebar/SidebarSection.tsx` — Section label styling
- `components/layout/sidebar/SidebarProfile.tsx` — Profile area redesign

---

### Phase 4: Login Page
**Effort:** 1 session | **Risk:** Low

Files to change:
- `app/login/page.tsx`
- Any `LoginPageShell.tsx` / `LoginPageContent.tsx` files

Implementation: Split-screen layout with denim-inspired left panel.

---

### Phase 5: Dashboard & Stat Cards
**Effort:** 1 session | **Risk:** Low

Files to change:
- `components/denim/DenimLandingDashboard.tsx`
- `components/ui/stat-card.tsx`
- `components/denim/admin/AdminDashboardPage.tsx`

---

### Phase 6: Tables & Lists
**Effort:** 1-2 sessions | **Risk:** Low

Files to change:
- `components/denim/InboxTable.tsx`
- `components/denim/admin/AdminOrdersPage.tsx`
- Any table-rendering component
- Add shared table CSS to `components/ui/shared.css`

---

### Phase 7: Forms
**Effort:** 1-2 sessions | **Risk:** Low

Files to change:
- `components/ui/erp/SectionCard.tsx` — Form section styling
- `components/ui/FormGroup.tsx` — Form field layout
- Any `*FormPage.tsx` — Section headers and spacing

---

### Phase 8: Analytics & Charts
**Effort:** 1 session | **Risk:** Low

Files to change:
- `components/denim/admin/AdminAnalyticsPage.tsx`
- All `*Chart.tsx` files — Update `COLORS` arrays
- Chart card CSS

---

### Phase 9: Pipeline Inbox & Approvals
**Effort:** 1 session | **Risk:** Low

Files to change:
- `components/denim/InboxPageClient.tsx`
- `components/denim/PendingApprovalsPage.tsx`
- `components/denim/SaconApprovalsPage.tsx`

---

### Phase 10: Polish & Micro-interactions
**Effort:** 1 session | **Risk:** Low

- Add hover effects to all interactive elements
- Verify animation presets applied consistently
- Check spacing consistency across all pages
- Add empty state illustrations to all pages
- Final QA pass on all routes

---

## 12. File Changelist

The following files require visual changes ONLY (no API/logic changes):

### CSS / Token Files
| File | Change Type |
|------|------------|
| `app/globals.css` | Full redesign of CSS tokens |
| `components/layout/sidebar/tokens.ts` | Color/geometry token update |
| `components/ui/shared.css` | Add table, form, animation utilities |
| `components/ui/DataGrid.css` | Update table styles |
| `components/AdminPanel.css` | Update admin styles |
| `components/Production.css` | Update production styles |

### Layout Components
| File | Change |
|------|--------|
| `components/layout/sidebar/Sidebar.tsx` | Visual redesign |
| `components/layout/sidebar/SidebarItem.tsx` | Active state redesign |
| `components/layout/sidebar/SidebarSection.tsx` | Label styling |
| `components/layout/sidebar/SidebarProfile.tsx` | Profile area redesign |

### Core UI Components
| File | Change |
|------|--------|
| `components/ui/button.tsx` | New variants, shadows |
| `components/ui/card.tsx` | New radius, shadows |
| `components/ui/input.tsx` | New border treatment |
| `components/ui/badge.tsx` | New stage color palette |
| `components/ui/StatusBadge.tsx` | Refined design |
| `components/ui/erp/PageShell.tsx` | Header gradient, spacing |
| `components/ui/erp/SectionCard.tsx` | Form section styling |
| `components/ui/stat-card.tsx` | Premium stat card design |
| `components/ui/EmptyState.tsx` | Better empty state |
| `components/ui/Pagination.tsx` | Cleaner pagination |
| `components/ui/FilterBar.tsx` | Updated filter style |

### Page Components
| File | Change |
|------|--------|
| `app/login/page.tsx` (+ children) | Split-screen redesign |
| `components/denim/DenimLandingDashboard.tsx` | Hero + stat cards |
| `components/denim/admin/AdminDashboardPage.tsx` | KPI cards, tab bar |
| `components/denim/admin/AdminAnalyticsPage.tsx` | Chart colors |
| `components/denim/InboxPageClient.tsx` | Stage header design |
| `components/denim/InboxTable.tsx` | Table redesign |
| `components/denim/PendingApprovalsPage.tsx` | Empty state, table |
| `components/denim/SaconApprovalsPage.tsx` | Table, status badges |
| All `*Chart.tsx` files | Update color arrays |

---

## Appendix A: Design Reference Links

### Premium SaaS Dashboards for Reference
- Linear (linear.app) — Best-in-class sidebar + data density
- Vercel Dashboard — Clean cards, excellent typography
- Supabase Dashboard — Dark sidebar with clear data hierarchy
- Raycast (raycast.com) — Premium product feel, subtle animations
- Stripe Dashboard — Information hierarchy benchmark

### Denim Brand References
- Momotaro Denim — Raw denim premium aesthetic
- Japan Blue Jeans — Selvage thread details
- Fullcount Japan — Rich indigo color depth

---

## Appendix B: Accessibility Requirements

- All text must maintain WCAG AA contrast ratio (4.5:1 for normal, 3:1 for large)
- Dark channel (sidebar): White text on #0D1B3E — ratio 14.5:1 ✓
- Gold accent text on dark: #F59E0B on #0D1B3E — ratio 9.2:1 ✓
- Content text: #0F172A on #FAFBFF — ratio 17.5:1 ✓
- Secondary text: #475569 on white — ratio 6.1:1 ✓
- Focus rings must be visible: 3px solid ring with minimum 3:1 contrast
- All interactive elements: minimum 44×44px touch target on mobile

---

## Appendix C: Before/After Summary

| Element | Before | After |
|---------|--------|-------|
| Sidebar bg | `#0A192F` navy | `#0D1B3E` raw indigo |
| Sidebar accent | `#F0C040` warm gold | `#F59E0B` selvage gold |
| Page bg | `#F8FAFC` cold gray | `#FAFBFF` cotton white + blue tint |
| Primary button | `#1D4ED8` flat | `#1D4ED8` + glow shadow |
| Card radius | `16px` | `14px` (more refined) |
| Card shadow | `0 2px 8px rgba(0,0,0,0.04)` | Multi-layer shadow |
| Body font size | `13px` | `14px` |
| Table headers | Title case, gray | UPPERCASE, 10.5px, tracked |
| Active nav item | Gold background | Gold left border + bg tint |
| Status badges | Flat colored | Rounded pill with dot |
| Stage colors | Basic colors | Full `--stage-*` token system |
| Charts | Default recharts palette | Curated denim palette |
| Login page | Unknown/basic | Split-screen premium |
| Empty states | Minimal | Illustrated with icons |
| Stat numbers | No specific style | `display-number` 36px bold |

---

*End of PRD — Sinaran ERP Premium Denim Redesign v2.0*
*PT Triputra Textile — Manufacturing Intelligence Platform*

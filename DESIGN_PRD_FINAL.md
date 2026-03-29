# Sinaran ERP — Design & Architecture PRD
**Version 3.0 — FINAL APPROVED**
**PT Triputra Textile Industry**
**Last updated: 2026-03-28**

> This document is the single source of truth for all frontend design and architecture work.
> Cursor must read this entire file before touching any component.
> Supersedes all previous design documents (DESIGN_SYSTEM_V3.md, DESIGN_PRD.md v1 and v2).

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Specs](#5-component-specs)
6. [Page-by-Page Specs](#6-page-by-page-specs)
7. [Role & Access System](#7-role--access-system)
8. [Architecture Changes Required](#8-architecture-changes-required)
9. [Backend Changes Required](#9-backend-changes-required)
10. [Implementation Phases](#10-implementation-phases)
11. [Clean Slate Procedure](#11-clean-slate-procedure)

---

## 1. Design Philosophy

### 1.1 Core Principle
Raw Denim. Every design decision traces back to the material this factory produces. Dark indigo depths, washed mid-blues, pale cotton whites. No gold. No warm accents. One palette, one material, total coherence.

### 1.2 The Three Rules
1. **Information first.** A factory manager must read every number on screen in under 2 seconds. If decoration competes with data, remove the decoration.
2. **Dense where it must be. Spacious where it earns it.** Tables are compact — maximum data visible at once. Dashboard KPI cards are spacious — one number, breathe around it. Forms are comfortable — enough room to fill in without stress.
3. **Never pure white. Never pure black.** Pure white (#FFFFFF) and pure black (#000000) are forbidden everywhere. Use near-white and near-black from the denim palette.

### 1.3 What Is Explicitly Forbidden
- Gold, amber, or warm accent colors anywhere in the UI
- Pure white (#FFFFFF) or pure black (#000000) backgrounds
- Neumorphic dual shadows
- Gradient backgrounds on content areas
- Tinted blue backgrounds as page backgrounds (#E8F1F8, #DCE8F2, etc.)
- Decorative animations on page load
- Pill-shaped buttons (use 8px radius rectangles)
- Any shadow heavier than `0 2px 8px rgba(0,0,0,0.12)`

---

## 2. Color System

### 2.1 The Denim Palette
Extracted from the denim fabric reference image. Five tones from darkest to lightest.

```css
:root {
  /* ─────────────────────────────────────
     DENIM DARK CHANNEL
     Sidebar, dark surfaces, deep accents
     ───────────────────────────────────── */
  --denim-950: #0D1F3C;   /* Near-black navy — page backgrounds never use this */
  --denim-900: #1A3050;   /* Deep sidebar tone */
  --denim-800: #2B506E;   /* Primary dark denim — sidebar background */
  --denim-700: #3A6480;   /* Hover states on dark surfaces */
  --denim-600: #4A7A9B;   /* Mid denim — primary action color */

  /* ─────────────────────────────────────
     DENIM LIGHT CHANNEL
     Content surfaces, backgrounds
     ───────────────────────────────────── */
  --denim-400: #6A96B2;   /* Muted accents, focus rings */
  --denim-300: #8BA8BE;   /* Light denim — borders, dividers */
  --denim-200: #B8CDD9;   /* Very light — hover on light surfaces */
  --denim-100: #D8E6EE;   /* Near-white tint */
  --denim-50:  #F0F4F8;   /* Cotton near-white — page background */

  /* ─────────────────────────────────────
     SEMANTIC ALIASES
     ───────────────────────────────────── */
  --page-bg:          #F0F4F8;   /* Cotton near-white */
  --content-bg:       #F7F9FB;   /* Cards, panels */
  --sidebar-bg:       #2B506E;   /* + denim texture overlay */
  --primary:          #4A7A9B;   /* Buttons, links, active states */
  --primary-hover:    #3A6480;
  --primary-dark:     #2B506E;

  /* Text */
  --text-primary:     #0F1E2E;   /* Near-black — main text */
  --text-secondary:   #4A6478;   /* Muted labels */
  --text-muted:       #7A96A8;   /* Very muted — captions, placeholders */
  --text-on-dark:     #EEF3F7;   /* Text on denim sidebar */
  --text-on-dark-muted: rgba(238,243,247,0.50);
  --text-on-black:    #E8EEF2;   /* Text on black login panel */

  /* Borders */
  --border:           #D0DDE6;   /* Default 1px border */
  --border-strong:    #B8CDD9;   /* Emphasized borders */
  --border-focus:     #4A7A9B;   /* Input focus */

  /* ─────────────────────────────────────
     SEMANTIC STATUS COLORS
     These are the ONLY non-denim colors allowed.
     Used exclusively for status badges and alerts.
     ───────────────────────────────────── */
  --success:        #059669;
  --success-bg:     #ECFDF5;
  --success-text:   #065F46;
  --warning:        #D97706;
  --warning-bg:     #FFFBEB;
  --warning-text:   #92400E;
  --danger:         #DC2626;
  --danger-bg:      #FEF2F2;
  --danger-text:    #991B1B;
  --info:           #0891B2;
  --info-bg:        #F0FDFA;
  --info-text:      #155E75;
  --purple:         #7C3AED;
  --purple-bg:      #F5F3FF;
  --purple-text:    #4C1D95;
  --orange:         #EA580C;
  --orange-bg:      #FFF7ED;
  --orange-text:    #9A3412;
}
```

### 2.2 Pipeline Stage Colors
Used only in badges and left-border row indicators. Never as backgrounds.

```
PENDING_APPROVAL  text #D97706  bg #FFFBEB  border #D97706
SACON             text #7C3AED  bg #F5F3FF  border #7C3AED
WARPING           text #4A7A9B  bg #EBF3F8  border #4A7A9B
INDIGO            text #0891B2  bg #F0FDFA  border #0891B2
WEAVING           text #059669  bg #ECFDF5  border #059669
INSPECT_GRAY      text #D97706  bg #FFFBEB  border #D97706
BBSF              text #EA580C  bg #FFF7ED  border #EA580C
INSPECT_FINISH    text #2B506E  bg #EBF3F8  border #2B506E
COMPLETE          text #059669  bg #ECFDF5  border #059669
REJECTED          text #DC2626  bg #FEF2F2  border #DC2626
STALED            text #7A96A8  bg #F0F4F8  border #7A96A8
```

### 2.3 Denim Texture
The sidebar uses a CSS denim weave texture overlaid on `--denim-800`:
```css
.denim-texture {
  background-color: #2B506E;
  background-image:
    repeating-linear-gradient(
      135deg,
      rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px,
      transparent 1px, transparent 4px
    ),
    repeating-linear-gradient(
      45deg,
      rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px,
      transparent 1px, transparent 4px
    );
}
```

The same texture at lower opacity (0.02 / 0.03) can be applied to:
- Login page left panel
- Dark hero cards on the admin dashboard
- Section header strips inside cards (optional, very subtle)

---

## 3. Typography

### 3.1 Font Choice
**IBM Plex Sans** — technical, industrial, precise. Suits a manufacturing operations tool. Carries the right weight for dense data without feeling corporate.

```html
<!-- In layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
```

Remove: Inter, Roboto, Plus Jakarta Sans, DM Sans — all of them.

**Monospace (KP codes only):** IBM Plex Mono — weight 600, color `--primary`.

### 3.2 Type Scale

```
Display:     32px / weight 700 / line-height 1.1   KPI numbers on dashboard
Headline:    22px / weight 600 / line-height 1.2   Page titles
Title:       17px / weight 600 / line-height 1.3   Card section headers
Body Large:  15px / weight 400 / line-height 1.5   Primary body text
Body:        14px / weight 400 / line-height 1.5   Table cells, form fields
Label:       12px / weight 500 / line-height 1.4   Badges, tags, metadata
Caption:     11px / weight 500 / line-height 1.4   Table headers (uppercase, letter-spacing 0.06em)
KP Code:     13px / weight 600 / IBM Plex Mono     color: --primary
```

---

## 4. Spacing & Layout

### 4.1 Page Layout
```
Sidebar width (expanded):   220px
Sidebar width (collapsed):  56px
Main content padding:       28px 32px
Page header height:         56px (sticky)
Gap between cards:          16px
Section gap inside page:    24px
```

### 4.2 Card Specs
```
Border radius:    10px
Padding:          20px 24px
Background:       var(--content-bg)   #F7F9FB
Border:           1px solid var(--border)
Shadow:           none (borders create separation)
Dark card bg:     var(--denim-950)    #0D1F3C  + denim texture
Dark card border: 1px solid rgba(255,255,255,0.08)
```

### 4.3 Button Specs
```
Border radius:   8px  (NOT pill shaped)
Height:          36px default / 32px small / 40px large
Padding:         0 16px

Primary:    bg var(--primary) #4A7A9B  text #EEF3F7   hover bg var(--primary-hover)
Secondary:  bg var(--content-bg)       text --text-primary  border 1px --border  hover bg --denim-100
Danger:     bg var(--danger-bg)        text --danger
Ghost:      bg transparent             text --text-secondary  hover bg --denim-100
Dark:       bg var(--denim-950)        text --text-on-dark    (used in dark cards)
```

### 4.4 Input Specs
```
Height:          36px
Border radius:   8px
Border:          1px solid var(--border)
Background:      var(--page-bg)   #F0F4F8
Focus border:    1px solid var(--border-focus)
Focus shadow:    0 0 0 3px rgba(74,122,155,0.15)
Padding:         0 12px
Font size:       14px
Placeholder:     var(--text-muted)
Label:           13px / weight 500 / --text-secondary / margin-bottom 6px
```

### 4.5 Table Specs
```
Container:       bg var(--content-bg), border 1px --border, border-radius 10px
Header row:      bg var(--page-bg), border-bottom 1px --border
Header text:     11px / uppercase / --text-muted / letter-spacing 0.06em / weight 500
Cell height:     40px (compact — maximum rows visible)
Cell padding:    0 14px
Cell text:       14px / --text-primary (primary col), --text-secondary (metadata cols)
Row border:      border-bottom 1px solid var(--denim-100)
Row hover:       bg var(--denim-50)  #F0F4F8
Left border:     3px solid [stage color] on the first cell — primary status indicator
KP code cells:   IBM Plex Mono 13px weight 600 color --primary
```

---

## 5. Component Specs

### 5.1 Sidebar

**Structure:**
```
Top:    Logo area (Sinaran wordmark + Triputra Textile Industry subtitle)
        Global search bar (⌘K shortcut indicator)
Middle: Navigation sections with uppercase section labels
        Notification count badges on relevant items
Bottom: User profile area (avatar initials + name + role badge)
        Triggers profile menu on click
```

**Visual:**
- Background: `--denim-800` (#2B506E) + denim texture overlay
- Text: `--text-on-dark` rgba(238,243,247,0.55)
- Section labels: 10px uppercase letter-spacing 0.07em rgba(238,243,247,0.30)
- Nav item height: 36px, border-radius 8px, padding 0 10px
- Nav item hover: `background: rgba(255,255,255,0.07)`
- **Active item (expanded):** Left border `2.5px solid rgba(238,243,247,0.90)`, background `rgba(255,255,255,0.10)`, text white, border-radius `0 8px 8px 0`
- **Active item (collapsed):** Pill highlight `background: rgba(255,255,255,0.18)`, border-radius 8px
- Icon size: 16px
- Collapsed width: 56px (icon only + tooltip on hover)
- Expanded width: 220px

**Responsive behavior:**
- Desktop (≥1024px): Expanded by default. Toggle button inside sidebar collapses/expands.
- Tablet (768–1023px): Collapsed by default (icon only). Toggle expands.
- Mobile (<768px): Hidden. Hamburger button in top header opens a drawer sliding from left. Overlay covers content.

**Notification badges:** Show count on Pending Approvals and the active stage inbox if count > 0.

**User profile menu (on click):**
```
[Avatar] Name
[Role badge]
──────────────
Profile
Change Password
──────────────
Sign Out
```

### 5.2 Status Badge
```
Border-radius: 6px
Padding:       2px 8px
Font-size:     11px
Font-weight:   500
Colors:        from Section 2.2 pipeline stage colors
```
Never use colored backgrounds on anything larger than a badge.

### 5.3 Sticky Page Header
- Height: 56px
- Background: `var(--content-bg)` with `border-bottom: 1px solid var(--border)`
- Sticky — stays visible while scrolling
- Contains: Page title (17px weight 600) + subtitle + right-side action buttons
- On mobile: Hamburger menu button on the left

### 5.4 KPI Stat Card
```
Dark variant (dashboard hero cards):
  bg: var(--denim-950) + denim texture at 0.02 opacity
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 10px
  padding: 20px 24px
  label: 11px uppercase --text-on-dark-muted
  number: 32px weight 700 --text-on-dark
  sublabel: 12px --text-on-dark-muted

Light variant (secondary stat cards):
  bg: var(--content-bg)
  border: 1px solid var(--border)
  number: 28px weight 700 --text-primary
  label: 11px uppercase --text-muted
```

---

## 6. Page-by-Page Specs

### 6.1 Login Page
**Layout:** Split screen. Left panel 55% width, right panel 45% width.

**Left panel:**
- Background: `#1A1A1A` near-black (NOT pure black)
- Logo: "S" monogram in a rounded square (rgba(255,255,255,0.12) bg)
- Brand name: "Sinaran" — 28px weight 700 color #E8EEF2
- Divider: thin horizontal denim-weave stripe (repeating CSS pattern)
- Tagline: "Denim Production, every meter tracked." — 14px rgba(232,238,242,0.55)
- Company: "PT Triputra Textile Industry" — 12px rgba(232,238,242,0.35)

**Right panel:**
- Background: `#F0F4F8` cotton near-white
- Title: "Welcome back" 22px weight 600 --text-primary
- Subtitle: "Sign in to your account" 13px --text-secondary
- Email field + Password field
- "Sign In" primary button (full width)
- On error: red inline message below the button

**Responsive:** Below 768px, the left panel hides. Only the right form is shown, centered on the denim-textured full background.

---

### 6.2 Admin Dashboard (`/denim/admin/dashboard`)
**Access:** Admin role only.

**Layout:** Bento grid — packed into one screen view on desktop (1280px+). No scroll required on a standard 1080p display.

**Grid structure:**
```
Row 1 (3 columns):
  [Hero dark card — Pipeline Overview 2/3 width] [KPI dark — Total Active 1/3]

Row 2 (4 columns equal):
  [Light — Contracts Made Today] [Light — Warping Done Today] [Light — BBSF Done Today] [Light — Completed Today]

Row 3 (2 columns):
  [Dark — Throughput chart (iOS Screen Time style bar chart, per stage, D/W/M toggle)] [Light — Weaving Efficiency (avg % this week, trend line)]

Row 4 (2 columns):
  [Light — Stale Orders (top 5 oldest active)] [Dark — Recent Activity (last 10 KP movements)]
```

**Throughput chart (Row 3 left):**
- Horizontal grouped bar chart per pipeline stage
- Toggle: Day / Week / Month
- Each bar shows count of KPs that completed that stage in the selected period
- This is the "Screen Time" view — how many units moved through each stage
- Requires new backend endpoint (see Section 9)

**On all dark cards:** IBM Plex Mono for KP codes, denim texture at very low opacity.

---

### 6.3 Factory Dashboard (`/denim/inbox/dashboard` or as the landing page for factory role)
**Access:** Factory role only.

**Layout:** Single focused view — no bento grid.

**Content:**
- Their stage name as the page title (e.g. "Warping Station")
- 3 KPI cards: KPs pending in their queue / KPs completed today / Avg cycle time
- Quick link to their Inbox and History

---

### 6.4 Jakarta Dashboard (`/denim/jakarta/dashboard`)
**Access:** Jakarta role only.

**Layout:** Clean, approval-focused.

**Content:**
- 4 KPI cards: Total Contracts / Pending Approvals / Pending Sacon / Completed This Month
- List: Last 5 pending approvals with quick Approve/Reject action
- List: Last 5 pending sacon decisions

---

### 6.5 Sales Contract Page (`/denim/admin/orders`)
**Replaces:** Old All Orders + Old Sales Contract pages (both merged here).
**Removes:** Separate Approved and Rejected pages (ACC status lives as a column here).

**Columns:**
```
[status left border] | Date | KP | Construction | Type | TE | ACC | Stage
```

**Filters (collapsed behind "Filters" button):**
- KP search input
- Pipeline stage dropdown (all stages + All)
- ACC status dropdown (All / ACC / TIDAK ACC / Pending)
- Date range (from / to)
- Type dropdown (SC / WS / Other)
- Construction search input

**Row behavior:** Click any row → navigate to `/denim/admin/orders/[kp]` (Order Detail).

**Actions:** "New Contract" button — only visible to factory role. Navigates to new contract form.

**Pagination:** 50 per page.

---

### 6.6 Order Detail Page (`/denim/admin/orders/[kp]`)
**Access:** Admin (full), Jakarta (read-only), Factory (read-only for their own KPs).

**Layout:**
- Sticky pipeline timeline at the top — 8 stage circles connected by lines
- Active stage is filled denim blue. Completed stages are filled success green. Not-yet-reached stages are dimmed gray.
- Timeline scrolls horizontally on mobile.
- As you scroll down through sections, the timeline highlights which section you're currently viewing (scroll spy).

**Sections (stacked vertically):**
1. Sales Contract info
2. SACON
3. Warping
4. Indigo
5. Weaving (read-only — data comes from TRIPUTRA sync)
6. Inspect Gray
7. BBSF (Washing + Sanfor 1 + Sanfor 2 sub-sections)
8. Inspect Finish

**Stages not yet reached:** Section card is shown but dimmed (opacity 0.4) with a placeholder message "Process not started yet."

**Section card header:** Stage name + status badge + date completed (if done).

---

### 6.7 Factory Inbox Pages (`/denim/inbox/[stage]`)
**Access:** Factory role, stage-specific only.

**Layout:**
- Page title: "[Stage] Inbox" (e.g. "Warping Inbox")
- Subtitle: count of pending KPs
- Table with columns: Date | KP | Construction | Type | TE | Color | Action
- Left border stripe on each row by pipeline stage color
- "Fill Form →" button on each row

**Row click or "Fill Form" button:** Navigates to `/denim/inbox/[stage]/[kp]` — full page form. After successful submit, navigates back to inbox. KP disappears from the list (moved to next stage).

**Separate History page** at `/denim/inbox/[stage]/history`:
- Shows all submissions across all factory accounts
- Filter: "My submissions only" toggle for logged-in user
- Read-only table: Date | KP | Construction | Submitted by | Status

---

### 6.8 Approval Pages

**Pending Approvals (`/denim/approvals/pending`):**
- Table: Date | KP | Construction | Type | Customer | TE | Stage left border
- Click row or "Review" button → opens a centered Dialog
- Dialog shows: order summary + Approve button + Reject button (requires reason)

**Sacon Inbox (`/denim/inbox/sacon`):**
- Two sections on same page: "Pending Submission" and "Awaiting HQ Decision"
- foto_sacon field: COMPLETELY REMOVED from both form and display

**Sacon Approvals (`/denim/approvals/sacon`):**
- Table: Date | KP | Construction | Customer | Sacon Date | J | B/C | TB | TB Real
- foto_sacon column: COMPLETELY REMOVED
- ACC and TIDAK ACC buttons inline on each row

---

### 6.9 Analytics Page (`/denim/admin/analytics`)
**Access:** Admin and Jakarta (read-only).

**Two tabs only: Overview and KP Comparison.**

**Overview tab — long scroll, clearly separated sections:**

Section 1 — Production Throughput
- Bar chart: KPs completed per stage per week (last 8 weeks)
- Toggle: Week / Month
- Requires new backend endpoint

Section 2 — Weaving Efficiency
- Area chart: Weekly avg efficiency % (last 8 weeks)
- Horizontal bar chart: Efficiency per machine (top 30, sorted descending)
- Color: green >80%, amber 70-80%, red <70%

Section 3 — Production Volume
- Grouped bar chart: Weekly meters + picks (last 8 weeks)
- Two bars per week — meters in denim blue, picks in denim light

Section 4 — Chemical Usage
- Multi-line chart: Monthly Indigo / Caustic / Hydro concentrations

Section 5 — BBSF Shrinkage
- Weekly avg shrinkage % per sanfor type

Section 6 — Cycle Time
- Distribution of days from contract to weaving completion (per KP)
- Horizontal bar or dot plot

**KP Comparison tab:**

Layout:
- Search bar at top: search by KP code, construction, type. Results appear as a dropdown.
- Pinned chips row: shows selected KPs (max 5). Each chip has a remove button.
- Full-width comparison table below

Comparison table structure:
- Columns: Field label | KP1 | KP2 | KP3 | KP4 | KP5
- Rows grouped by pipeline stage (Sales Contract / Warping / Indigo / Weaving / Inspect Gray / BBSF / Inspect Finish)
- All fields from each stage are shown
- Stages not yet reached for a KP: dimmed cell with "—" and italic "not started"
- **Auto-highlighting:** For numeric fields across the same row, best value = green background, worst value = red background, middle = amber. Applied automatically when 2+ KPs are pinned.
- Sticky column headers

---

### 6.10 KP Archive (`/denim/admin/kp-archive`)
No structural changes — design update only.

### 6.11 Fabric Specs (`/denim/admin/fabric-specs`)
No structural changes — design update only. Edit/create via slideout panel stays the same.

### 6.12 User Management (`/denim/admin/users`) — NEW PAGE
**Access:** Admin only.

**Table columns:** Name | Email | Role | Stage (factory only) | Created | Status | Actions

**Create User form (new page or slideout):**
- Name, Email, Password (auto-generated or set manually)
- Role: admin / factory / jakarta
- Stage (only shown if role = factory): Warping / Indigo / Weaving / Inspect Gray / BBSF / Inspect Finish / Sacon
- Assign stage determines which inbox the factory user sees

**Actions per row:** Edit, Deactivate/Activate, Reset Password

---

## 7. Role & Access System

### 7.1 Role Definitions

| Role | Who | What they see |
|------|-----|---------------|
| `admin` | Factory owner, management | Everything. Full read/write across all pages. |
| `jakarta` | HQ approvals team | Jakarta Dashboard, Sacon Approvals, Pending Approvals, Sales Contract (read-only), Order Detail (read-only), Fabric Specs (read-only), Analytics (read-only). Cannot access factory inboxes or admin settings. |
| `factory` | Production floor workers | Their role-specific dashboard, their stage inbox only, their stage history only, their stage form. Cannot access /admin/* at all. |

### 7.2 Factory Stage Assignment
- Stored as `user.stage` field in the database
- Values: `warping | indigo | weaving | inspect_gray | bbsf | inspect_finish | sacon`
- A `sacon` stage factory user sees the Sacon Inbox and can create new Sales Contracts
- Only admin can assign/change a user's stage
- Factory users cannot change their own stage

### 7.3 Route Guards
**Frontend (middleware.ts):**
- Any route starting with `/denim/admin/*` requires role `admin`
- Any route starting with `/denim/approvals/*` requires role `admin` or `jakarta`
- Any route starting with `/denim/inbox/*` requires role `admin` or `factory`
- Factory users accessing `/denim/inbox/[stage]` are verified that their `user.stage` matches the route stage
- Unauthenticated users: redirect to `/login`
- Wrong role: redirect to their home page (factory → their inbox, jakarta → their dashboard)

**Backend (all API routes):**
- `requireAuth` middleware on every route (verify JWT)
- `requireRole(...)` on all admin-only and jakarta-only endpoints
- Stage-specific factory endpoints: verify `user.stage` matches the requested stage
- A warping factory user calling a BBSF endpoint must receive 403

### 7.4 Sidebar Navigation by Role

**Admin nav:**
```
OVERVIEW
  Dashboard
  Sales Contract
  KP Archive
  Fabric Specs
  Analytics
  Users

PIPELINE
  Warping Inbox [count]
  Indigo Inbox [count]
  Weaving Inbox [count]
  Inspect Gray [count]
  BBSF [count]
  Inspect Finish [count]

APPROVALS
  Pending [count]
  Sacon
```

**Jakarta nav:**
```
OVERVIEW
  Dashboard
  Sales Contract
  Analytics

APPROVALS
  Pending [count]
  Sacon [count]
```

**Factory nav (example: Warping stage):**
```
WARPING
  Inbox [count]
  History
```
Section label and items change based on `user.stage`.
Sacon stage factory user sees:
```
SACON
  New Order
  Sacon Inbox [count]
  History
```

---

## 8. Architecture Changes Required

### 8.1 Clean Slate (do first, before any design work)
See Section 11 for the exact procedure.

### 8.2 Removed Pages
- `/denim/approvals/approved` — removed. Functionality merged into Sales Contract page (ACC column + filter).
- `/denim/approvals/rejected` — removed. Same.
- `/denim/admin/orders` (old) — renamed/replaced by unified Sales Contract page.
- `/denim/sales-contract` (old legacy page) — removed. Replaced by unified Sales Contract page.

### 8.3 New Pages Required
- `/denim/admin/users` — User Management (new, admin only)
- `/denim/inbox/[stage]/history` — Submission history per stage
- `/denim/jakarta/dashboard` — Jakarta-specific dashboard (currently the tab, now a standalone page)

### 8.4 foto_sacon Removal
- Remove `foto_sacon` field from `SaconInboxPage.tsx` submit form
- Remove `foto_sacon` column from `SaconApprovalsPage.tsx` table
- Leave the database field as-is (do not run a migration to remove it — just stop displaying it)

### 8.5 Inbox Flow Change
Current: inbox row click → order detail page
New: inbox row click (or "Fill Form" button) → full-page form at `/denim/inbox/[stage]/[kp]`

The `InboxTable` component's `formBasePath` prop needs to be updated:
- Warping: `formBasePath="/denim/inbox/warping"`
- Indigo: `formBasePath="/denim/inbox/indigo"`
- Inspect Gray: `formBasePath="/denim/inbox/inspect-gray"`
- BBSF: `formBasePath="/denim/inbox/bbsf"`
- Inspect Finish: `formBasePath="/denim/inbox/inspect-finish"`
- Weaving: stays as order detail (it's a confirmation, not a data-entry form)

---

## 9. Backend Changes Required

### 9.1 New Endpoint: Production Throughput
Required for admin dashboard throughput chart and analytics overview.

```
GET /api/denim/admin/throughput?period=day|week|month&from=&to=
```

Returns: for each pipeline stage, how many KPs completed (transitioned through) that stage in the given period.

Implementation: query `SalesContract.updated_at` grouped by `pipeline_status` transitions. This requires either a pipeline event log table or approximating from current `updated_at` per stage record.

Suggested approach: create a new `PipelineEvent` table:
```prisma
model PipelineEvent {
  id         Int      @id @default(autoincrement())
  kp         String
  from_stage String?
  to_stage   String
  created_at DateTime @default(now())
  @@index([to_stage, created_at])
  @@index([kp])
}
```
Write to this table whenever `pipeline_status` changes on a SalesContract.

### 9.2 New Endpoint: User Management
```
GET    /api/auth/users           — list all users (admin only)
POST   /api/auth/users           — create user (admin only)
PUT    /api/auth/users/:id       — update user role/stage/name (admin only)
DELETE /api/auth/users/:id       — deactivate user (admin only)
POST   /api/auth/users/:id/reset — reset password (admin only)
```

User model needs a `stage` field:
```prisma
model User {
  ...existing fields...
  stage String?   // warping | indigo | weaving | inspect_gray | bbsf | inspect_finish | sacon
}
```

### 9.3 Missing Analytics Data (productionVelocity + machineHeatmap)
These are expected by the frontend but missing from the backend. Add to `GET /analytics/full`:

`productionVelocity`: already exists as `weeklyProduction` — the frontend just needs to be updated to use the correct field name.

`machineHeatmap`: build from `WeavingRecord`. Group by machine + week. Return:
```json
{ "machine": "M-001", "week": "2026-W12", "avg_efficiency": 84.2, "record_count": 6 }
```

Note: WeavingRecord data comes from TRIPUTRA server sync which is currently down. Build the endpoint correctly now with mock data fallback. When the server reconnects, real data flows in automatically.

### 9.4 Role Security on All Routes
Add `requireRole` checks to all endpoints that are missing them. Specifically:
- All `/analytics/*` endpoints: require `admin` or `jakarta`
- All `/admin/*` endpoints: require `admin`
- All stage-specific inbox endpoints: require `factory` with matching `user.stage`
- KP archive + fabric specs GET: allow `admin` and `jakarta`

---

## 10. Implementation Phases

Execute in strict order. Commit after every single file. Never let Cursor run git commands.

### Phase 0 — Clean Slate
Run the clean slate procedure (Section 11) before any other work.
One Cursor session. Commit message: `chore: clean slate — reset globals.css and purge broken styles`

### Phase 1 — Backend: Security + New Endpoints
1. Add `stage` field to User model. Migrate.
2. Add `PipelineEvent` model. Migrate.
3. Write to `PipelineEvent` on every pipeline status change.
4. Build `/admin/throughput` endpoint.
5. Build `/auth/users` CRUD endpoints.
6. Add `requireRole` to all missing routes.
7. Add stage verification to factory-specific routes.
One Cursor session per task. Commit after each.

### Phase 2 — Design Tokens (globals.css)
Replace entire globals.css with the token system from Section 2.
Swap font to IBM Plex Sans in layout.tsx.
Verify sidebar and page background render correctly.

### Phase 3 — Sidebar
Rewrite Sidebar.tsx completely per Section 5.1.
Three nav configs: ADMIN_NAV, JAKARTA_NAV, FACTORY_NAV (stage-aware).
Collapsed/expanded toggle. Mobile drawer. Notification badges.

### Phase 4 — Core UI Components
In order: button.tsx, input.tsx, badge.tsx, StatusBadge.tsx, stat-card.tsx, SectionCard.tsx, PageShell.tsx.
Each gets a single focused Cursor session referencing the exact spec section.

### Phase 5 — Login Page
Rewrite login page per Section 6.1. Split screen. Black right panel.

### Phase 6 — Admin Dashboard
Bento grid per Section 6.2. Dark/light mixed cards. Throughput chart with mock data.

### Phase 7 — Sales Contract Page
Unified page replacing All Orders + Sales Contract legacy.
Remove old Sales Contract page. Remove Approved/Rejected nav items.
Add ACC column. Add collapsible filter panel.

### Phase 8 — Order Detail + Pipeline Timeline
Scroll-spy sticky timeline. Stacked sections. Dimmed placeholder for unstarted stages.

### Phase 9 — Factory Inbox Pages
Update InboxTable formBasePath to point to inbox form routes.
Build history page at /inbox/[stage]/history.
Remove foto_sacon from sacon pages.

### Phase 10 — Analytics
Overview tab: 6 sections, long scroll. KP Comparison tab: search + pin + auto-highlight table.

### Phase 11 — Form Pages
Apply design tokens to all form pages (Warping, Indigo, InspectGray, BBSF, InspectFinish).
No structural changes — design pass only.

### Phase 12 — User Management
New /denim/admin/users page. Table + create/edit form + stage assignment.

### Phase 13 — Route Guards
Implement middleware.ts frontend route protection. Test all role combinations.

### Phase 14 — Jakarta + Factory Dashboards
Jakarta dashboard standalone page. Factory dashboard standalone page.

### Phase 15 — QA + Responsive
Full pipeline walkthrough as each role (admin, jakarta, factory/warping, factory/sacon).
Tablet (768px) and mobile (375px) viewport testing.
TypeScript: npx tsc --noEmit — fix all errors.
Deploy: git push → Vercel + Render auto-deploy.

---

## 11. Clean Slate Procedure

Run this FIRST before any design work. This prevents Cursor from anchoring to broken existing styles.

**Cursor Prompt — Clean Slate:**
```
Do the following in this exact order. Do not edit any other files.

1. Replace the ENTIRE contents of app/globals.css with exactly this:
   /* SINARAN ERP — Design System v3.0 — CLEAN SLATE */
   /* All tokens will be added in Phase 2 */
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   body { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: #F0F4F8; color: #0F1E2E; }

2. Find every CSS file in the codebase that contains neumorphic styles:
   - Any file with box-shadow containing two shadow values (neumorphic dual shadow)
   - Any file with background-color: #E0E5EC
   - Any file with background: #DCE8F2 or #E8F1F8
   Delete ONLY those specific CSS rules. Do not delete the files.

3. Do not touch any TypeScript, TSX, or JS files.
4. Do not run any git commands.
```

---

## Appendix A — Sidebar Navigation Structure (Complete)

```
ADMIN ROLE
──────────────────────────
[S] Sinaran
    Triputra Textile Industry

[⌕ Search...                ⌘K]

OVERVIEW
  ⊞  Dashboard
  ◫  Sales Contract
  ◈  KP Archive
  ◉  Fabric Specs
  ∿  Analytics
  ◎  Users

PIPELINE
  →  Warping Inbox        [n]
  ⬡  Indigo Inbox         [n]
  ≡  Weaving Inbox        [n]
  ◫  Inspect Gray         [n]
  ▣  BBSF                 [n]
  ◆  Inspect Finish       [n]

APPROVALS
  ✓  Pending              [n]
  ◎  Sacon

──────────────────────────
[AD] Admin User
     Administrator
──────────────────────────

JAKARTA ROLE
──────────────────────────
[S] Sinaran
    Triputra Textile Industry

[⌕ Search...                ⌘K]

OVERVIEW
  ⊞  Dashboard
  ◫  Sales Contract
  ∿  Analytics

APPROVALS
  ✓  Pending              [n]
  ◎  Sacon                [n]

──────────────────────────
[HQ] Jakarta User
     HQ Approvals
──────────────────────────

FACTORY ROLE (example: Warping stage)
──────────────────────────
[S] Sinaran
    Triputra Textile Industry

WARPING
  ▷  Inbox                [n]
  ◷  History

──────────────────────────
[WP] Budi Warping
     Factory · Warping
──────────────────────────

FACTORY ROLE (Sacon stage)
──────────────────────────
[S] Sinaran
    Triputra Textile Industry

SACON
  +  New Order
  ◎  Sacon Inbox          [n]
  ◷  History

──────────────────────────
[SC] Sacon User
     Factory · Sacon
──────────────────────────
```

---

## Appendix B — Accessibility

- All text: WCAG AA contrast ratio (4.5:1 minimum)
- Sidebar text on #2B506E: rgba(238,243,247,0.55) — ratio 4.7:1 ✓
- Active sidebar text white on #2B506E — ratio 8.2:1 ✓
- Content text #0F1E2E on #F0F4F8 — ratio 16.1:1 ✓
- Secondary text #4A6478 on #F7F9FB — ratio 5.2:1 ✓
- All interactive elements: minimum 44×44px touch target on mobile
- Focus rings: 3px solid `rgba(74,122,155,0.4)` on all interactive elements
- Keyboard navigation: all modals and dialogs must trap focus

---

## Appendix C — Before / After Summary

| Element | Before | After |
|---------|--------|-------|
| Sidebar bg | Dark navy `#0A192F` | Denim `#2B506E` + weave texture |
| Sidebar accent | Gold `#F59E0B` | White active border / pill (no accent color) |
| Page bg | Cold gray `#F8FAFC` | Cotton near-white `#F0F4F8` |
| Content cards | White `#FFFFFF` | Denim-tinted `#F7F9FB` |
| Primary button | Electric blue `#1D4ED8` | Denim `#4A7A9B` |
| Font | Roboto / Inter mix | IBM Plex Sans (uniform) |
| KP codes | Various | IBM Plex Mono, weight 600, `#4A7A9B` |
| Table rows | No status indicator | Left border stripe = stage color |
| Table row height | ~48px | 40px (denser) |
| Table headers | Mixed case | 11px uppercase letter-spaced |
| Login | Unknown broken state | Split screen, black right panel |
| Analytics | 5 tabs | 2 tabs (Overview + KP Comparison) |
| Sales Contract | 2 duplicate pages | 1 unified page with ACC column |
| Approved/Rejected pages | 404 (broken) | Removed — merged into Sales Contract |
| Factory inbox flow | → Order detail (extra step) | → Form directly |
| Role security | Client-side only | Frontend middleware + backend requireRole |
| User management | No page exists | New /admin/users page |
| foto_sacon | Text string display | Completely removed |
| Spinning nav | Hidden by comment | Removed from DOM entirely |

---

*End of PRD — Sinaran ERP Design & Architecture v3.0*
*PT Triputra Textile Industry — Denim Production, every meter tracked.*

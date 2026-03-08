
## ERP Sinaran – Project Documentation

This document explains the overall architecture, setup, and main workflows for the ERP Sinaran monorepo, covering the **Spinning / Quality**, **Production**, and **Indigo Division** modules.

- **Root package**: Monorepo meta-package (scripts, shared tooling)
- **Backend API**: `apps/api` (Node.js, Express, Prisma, PostgreSQL)
- **Frontend (monorepo app)**: `src` (React SPA mounted at project root, typically for development)
- **Frontend (apps)**: `apps/frontend` (React SPA packaged for deployment)
- **Shared database layer**: `packages/prisma` (Prisma schema and migrations)

---

## 1. Project Structure

- **Root**
  - `package.json`: Root scripts and workspace configuration.
  - `SETUP.md`: Original setup instructions (Node, PNPM/NPM, DB).
  - `README.md`: High‑level notes and migration context.
  - `MIGRATION_*.md`, `SHARED_DATA_*.md`, `LETTERCODE_MIGRATION.md`, etc.: Design and migration notes.
  - `schema.sql`, `seed.ts`: Raw SQL schema snapshot and seeding helpers.
  - CSV files (e.g. `CLSP-Table 1.csv`, `Std IPIs-Table 1.csv`, `INDIGO-Table 1.csv`): Source spreadsheets used to derive the schema and calculations.

- **Backend API – `apps/api`**
  - `src/server.ts`: Express app entry point.
  - `src/lib/prisma.ts`: Prisma client and database health check.
  - `src/routes/quality.ts`: Yarn quality (Spinning) routes.
  - `src/routes/production.ts`: Production routes.
  - `src/routes/unified.ts`: Shared/unified dimension routes.
  - `src/routes/indigo.ts`: Indigo division routes.
  - `src/utils/calculations.ts`: Core yarn/production formulas (TPI, TPM, tenacity, CLSP, IPI, efficiency, losses, etc.).
  - `src/utils/serialization.ts`: Helpers for serializing `bigint`/`Decimal` to JSON.
  - `dist/`: Compiled JavaScript output for production.

- **Frontend – monorepo root app (`src`)**
  - `src/index.js`: React entry (development).
  - `src/App.js`: Router and layout for the original SPA.
  - `src/components/**`: Quality and production components (forms, lists, admin).
  - `src/config/api.js`: API base URL configuration and fetch helper.

- **Frontend – apps (`apps/frontend`)**
  - `apps/frontend/src/index.js`: React entry point.
  - `apps/frontend/src/App.js`: Router and module-level layout for deployed app.
  - `apps/frontend/src/components/**`: Main UI for all modules (Spinning/Quality, Production, Indigo).
  - `apps/frontend/src/config/api.js`: API endpoint configuration for the deployed frontend.
  - `apps/frontend/build/`: Production build artifacts.

- **Shared Prisma package – `packages/prisma`**
  - `schema.prisma`: Canonical data model for all modules.
  - `migrations/**`: Prisma migrations (SQL + metadata).
  - `populate-letter-codes.ts`: Helper for backfilling letter codes.
  - `index.ts`: Re‑export/wrapper for Prisma client in a package form.

---

## 2. Data Model Overview

The system uses a **single PostgreSQL database** with shared dimensions and module‑specific fact tables, modeled via Prisma (`packages/prisma/schema.prisma`).

- **Shared dimensions**
  - `CountDescription`: Central code (numeric) and description string, used across quality, production, and indigo.
  - `CountNe`: Count values (Ne).
  - `Lot`, `Spk`: Lot and SPK identifiers.
  - `YarnType`: Yarn type, with `letterCode` for encoding in `CountDescription`.
  - `Blend`, `SlubCode`, `MillsUnit`: Blends, slub patterns, and mill/spinning units (also with letter codes).
  - Production‑specific: `WarnaConeCheese` (cone/cheese color), `RayonBrand`.
  - Quality‑specific: `Supplier`, `ProcessStep`, `TestType`, `Side`.

- **Fact tables**
  - `YarnTest` (Quality / Spinning)
    - Identification: mill unit, machine, shift, operator.
    - Spinning parameters: count, twist, TM, delivery, spindle speed, etc.
    - Results: count variation, strength, evenness, IPIs, hairiness, spectrogram, remarks.
    - Derived fields: total draft, TPI, TPM, tenacity, CLSP, aggregated IPI metrics.
  - `ProductionRecord` (Production)
    - Identification: date, mill unit, machine, count, lot, SPK, yarn type, color, rayon brand.
    - Machine and setting data: spindles/rotors, speed, TM, etc.
    - Output metrics: kg, lbs, bales, target vs actual, efficiency, stoppages, total losses.
  - `IndigoDivisionRecord` (Indigo Division)
    - Date, code, count description, and a large set of Indigo‑specific fields:
      chemical dosages, bath conditions, line settings, and performance KPIs – designed to map directly from the Indigo Excel table.

---

## 3. Backend API – Architecture & Endpoints

### 3.1 Server Setup

- **File**: `apps/api/src/server.ts`
- Responsibilities:
  - Load environment (`.env`), configure CORS and JSON body parsing.
  - Register routers:
    - `/api/quality` → Quality (yarn tests and dimensions).
    - `/api/production` → Production (records and dimensions).
    - `/api/unified` → Shared dimensions.
    - `/api/indigo` → Indigo division.
  - Health check:
    - `GET /api/health` → uses `testDatabaseConnection()` from `lib/prisma.ts`.

### 3.2 Quality / Spinning Module – `/api/quality`

- **File**: `apps/api/src/routes/quality.ts`
- Purpose: Manage yarn test data and related reference tables.

- **Dimension endpoints** (for dropdowns and admin):
  - `GET /api/quality/count-descriptions`
  - `GET/POST/PUT/DELETE /api/quality/lots`
  - `GET/POST/PUT/DELETE /api/quality/spks`
  - `GET/POST/PUT/DELETE /api/quality/yarn-types`
  - `GET/POST/PUT/DELETE /api/quality/suppliers`
  - `GET/POST/PUT/DELETE /api/quality/mills-units`
  - `GET/POST/PUT/DELETE /api/quality/process-steps`
  - `GET/POST/PUT/DELETE /api/quality/test-types`
  - `GET/POST/PUT/DELETE /api/quality/sides`

  Most of these support:
  - `isActive` soft deletion.
  - Lookup by code or name where useful (e.g. `lots/lookup/by-value/:value`).

- **Yarn test endpoints**:
  - `GET /api/quality/yarn-tests`
    - Filters: date period (`daily`, `monthly`, `yearly`, `range`), count description, lot, machine, etc.
    - Includes all relevant relations (count, lot, SPK, yarn type, blend, supplier, unit, process step, test type, side).
    - Returns:
      - `tests`: list of full records.
      - `summary.byCountDescription`: counts by count description for quick overviews.
  - `GET /api/quality/yarn-tests/summary`
    - Monthly/yearly aggregated statistics for key metrics (count variation, strength, evenness, IPIs, hairiness, CLSP).
  - `GET /api/quality/yarn-tests/summary/monthly-breakdown`
    - Excel‑style monthly breakdown preferred for CLSP/IPI reports.
  - `GET /api/quality/yarn-tests/export`
    - CSV export for filtered yarn tests (semicolon‑separated).
  - `GET /api/quality/yarn-tests/:id`
    - Full details for a single test (with relations).
  - `POST /api/quality/yarn-tests`
    - Create a new yarn test; server:
      - Parses numbers safely.
      - Auto‑computes derived values using `calculateFields()` in `utils/calculations.ts`.
      - Auto‑generates `countDescriptionCode` using a composition of mill, blend, yarn type, lot, and count.
  - `PUT /api/quality/yarn-tests/:id`
    - Update existing test with the same calculation and `countDescriptionCode` logic.
  - `DELETE /api/quality/yarn-tests/:id`
    - Delete a specific record (BigInt ID).

### 3.3 Production Module – `/api/production`

- **File**: `apps/api/src/routes/production.ts`
- Purpose: Manage daily spinning production records and production‑side dimensions.

- **Dimension endpoints**:
  - Units: `GET/POST/PUT/DELETE /api/production/units` (alias over `MillsUnit`).
  - Mills units: `GET/POST/PUT/DELETE /api/production/mills-units`.
  - Yarn types: `.../yarn-types`.
  - Counts: `.../counts` (maps to `CountNe`).
  - Slub codes: `.../slub-codes`.
  - Lots: `.../lots`.
  - SPKs: `.../spks`.
  - Colors: `.../colors` (`WarnaConeCheese`).
  - Rayon brands: `.../rayon-brands`.

- **Production record endpoints**:
  - `GET /api/production/records`
    - Filters:
      - Date: `period` + `day/month/year`, or `startDate/endDate`.
      - Dimensions: `millsUnitId`, `yarnTypeId`, `countNeId`, `lotId`, `spkId`, `slubCodeId`, `colorId`.
      - Numeric ranges: `produksiKgsMin/Max`, `aktualBalesMin/Max`, `effProduksiMin/Max`, etc.
    - Includes uniform relations to support rich UI filtering and views.
  - `GET /api/production/records/:id`
    - Single record with relations, with `BigInt` IDs serialized for JSON.
  - `POST /api/production/records`
    - Create a new production row; server:
      - Parses IDs and numeric values.
      - Looks up `CountNe` to get `countNeValue`.
      - Uses `utils/calculations.ts` to compute:
        - **Thread parameters**: derive TPI if missing (`TPI = TM * sqrt(countNe)`).
        - **Production**: kg, lbs, bales (`produksiKgs`, `produksiLbs`, `aktualProduksiBales`).
        - **Capacity and targets**: 100% production, target OPR/OPS.
        - **OPS/OPR & efficiency**: actual operations vs targets.
        - **Stoppages and losses**: aggregate stoppage minutes, power/maintenance/count change losses, total loss.
  - `PUT /api/production/records/:id`
    - Update existing production rows, recomputing derived fields when inputs change.
  - `GET /api/production/records/summary`
    - Aggregated monthly/yearly summary, grouped by unit, yarn type, count, etc.
  - `DELETE /api/production/records/:id`
    - Delete by ID.

### 3.4 Unified Dimensions – `/api/unified`

- **File**: `apps/api/src/routes/unified.ts`
- Purpose: Provide **single, central CRUD** for shared dimensions used by multiple modules.

- Endpoints:
  - `/api/unified/count-descriptions`
  - `/api/unified/lots`
  - `/api/unified/spks`
  - `/api/unified/yarn-types`
  - `/api/unified/blends`

Each supports:
  - `GET /` (with `?all=true` to include inactive).
  - `GET /:id` or `/:code` (depending on entity).
  - `POST`, `PUT`, `DELETE` (soft delete via `isActive`).

### 3.5 Indigo Division – `/api/indigo`

- **File**: `apps/api/src/routes/indigo.ts`
- Purpose: Capture detailed Indigo division records aligned to `INDIGO-Table 1.csv`.

- Endpoints:
  - `GET /api/indigo/records`
    - Filters: date ranges (`startDate/endDate` or `dateFrom/dateTo`), `code`, `countDescriptionCode`.
    - Pagination: `page`, `limit`.
  - `GET /api/indigo/records/:id`
    - Fetch single Indigo record.
  - `POST /api/indigo/records`
    - Create record using `buildIndigoDataFromBody()` (conversion of all numeric fields via safe decimal parsing).
  - `PUT /api/indigo/records/:id`
    - Update existing record using the same mapping logic.

---

## 4. Frontend – Architecture & Navigation

### 4.1 Entry Points

- **Monorepo root SPA (`src`)**
  - `src/index.js`: Bootstraps React via `ReactDOM.createRoot`.
  - `src/App.js`: Defines routes for early versions of the quality/production UI.

- **Deployed SPA (`apps/frontend`)**
  - `apps/frontend/src/index.js`: Bootstraps the deployed app.
  - `apps/frontend/src/App.js`:
    - Wraps the app with `BrowserRouter`.
    - Renders `ModuleNavbar` with tabs:
      - **Spinning**
      - **Indigo**
      - **Production**
    - Renders headers and sub‑navigation:
      - Spinning: `Navigation` (Login, Enter Data, View Data, Settings).
      - Production: `ProductionNavigation` (Enter Data, View Data, Settings).

- **Main routes (`apps/frontend/src/App.js`)**
  - `/login` → `Login`
  - `/register` → `Register`
  - `/` → `YarnExcelGridPage` (Spinning / Quality main view)
  - `/tests` → `YarnExcelGridPage` (alias)
  - `/indigo` → `IndigoDivisionPage`
  - `/production` → `ProductionList`
  - `/production/new` → `ProductionForm`
  - `/production/view/:id` → `ProductionView`
  - `/production/edit/:id` → `ProductionForm`
  - `/production/report` → `DailyProductionReport`
  - `/production/count-wise-summary` → `CountWiseSummaryReport`
  - `/production/admin` → `ProductionAdminPanel`
  - `/admin` → `AdminPanel` (Spinning / Quality settings)

### 4.2 API Configuration

- **File**: `apps/frontend/src/config/api.js`
- Logic:
  - Base URL: `REACT_APP_API_BASE_URL` (default `http://localhost`).
  - Port:
    - `REACT_APP_API_PORT` if set.
    - Defaults to `3001` on `localhost`.
    - No port appended for production URLs (starting with `https://` or non‑localhost `http://`).
  - Exposes:
    - `API_ENDPOINTS.quality = {base}/api/quality`
    - `API_ENDPOINTS.production = {base}/api/production`
    - `API_ENDPOINTS.unified = {base}/api/unified`
    - `API_ENDPOINTS.indigo = {base}/api/indigo`
  - `apiCall(url, options)`: wrapper around `fetch` with JSON body handling and friendly error messages.

### 4.3 Key UI Components

- **Spinning / Quality**
  - `YarnExcelGridPage`: Spreadsheet‑style view for yarn tests; supports bulk entry and editing mapped to `/api/quality/yarn-tests`.
  - `YarnTestForm`: Detailed entry form; uses dropdowns populated from quality/unified dimension endpoints.
  - `YarnTestList`: Tabular view of tests with filters; uses `GET /api/quality/yarn-tests`.
  - `AdminPanel`: Settings for lots, SPKs, yarn types, suppliers, process steps, etc.

- **Production**
  - `ProductionForm`: Data entry for `ProductionRecord`, posts to `/api/production/records`.
  - `ProductionList`: Tabular listing and filters for production records.
  - `ProductionView`: Detailed read‑only view.
  - `ProductionAdminPanel`: Manage units, yarn types, counts, slub codes, lots, SPKs, colors, rayon brands.
  - `DailyProductionReport`: Uses `/api/production/records/summary` to render daily/monthly/yearly reports.
  - `CountWiseSummaryReport`: Count‑wise summary UI leveraging summary endpoint(s).

- **Indigo Division**
  - `IndigoDivisionPage`: Indigo‑specific grid and form mapped to `/api/indigo/records` CRUD.

- **Auth**
  - `Login`, `Register`: Simple authentication views (currently focused on UI; backend auth may be handled separately or by environment).

---

## 5. Setup & Running the Project

### 5.1 Prerequisites

- Node.js (LTS recommended).
- PostgreSQL running and accessible.
- Environment variables configured (see `.env.example` or `SETUP.md` for details).

Essential variables (names may vary slightly by environment):

- `DATABASE_URL`: Prisma/PostgreSQL connection string.
- `PORT`: API server port (default often `3001`).
- `REACT_APP_API_BASE_URL`: Base URL that frontend uses to talk to backend (e.g. `http://localhost` in development).
- `REACT_APP_API_PORT`: API port for local development (e.g. `3001`).

### 5.2 Install Dependencies

From the project root:

- Using npm:
  - `npm install`
  - `cd apps/api && npm install`
  - `cd ../frontend && npm install`
  - `cd ../../packages/prisma && npm install` (if used as a standalone package manager)

### 5.3 Database Migration & Seeding

- Ensure PostgreSQL is running and `DATABASE_URL` is set.
- From `packages/prisma`:
  - Run Prisma migrations: `npx prisma migrate deploy` (or `migrate dev` in development).
  - Optionally run any seed scripts (`seed.ts`, `populate-letter-codes.ts`) if documented.

Refer to `SETUP.md` and `SHARED_DATA_ARCHITECTURE.md` for more detail on data initialization.

### 5.4 Running the Backend

From `apps/api`:

- Development:
  - `npm run dev` (or the equivalent script defined in `apps/api/package.json`).
- Production build:
  - `npm run build`
  - `npm start`

The API should be available at something like `http://localhost:3001/api` (depending on `PORT`).

### 5.5 Running the Frontend

From `apps/frontend`:

- Development:
  - `npm start`
  - Default URL: `http://localhost:3000`
  - Ensure `REACT_APP_API_BASE_URL` and `REACT_APP_API_PORT` are configured so the frontend can call the backend.

- Production build:
  - `npm run build` (outputs to `apps/frontend/build`).
  - Serve the static build via your hosting of choice (e.g. Vercel, Nginx, Node static server).

---

## 6. Typical User Workflows

### 6.1 Spinning / Quality

1. Open the app at `/` (Spinning module).
2. Load dropdowns from `/api/quality` or `/api/unified` endpoints (lots, SPKs, yarn types, units, etc.).
3. Enter test data via `YarnExcelGridPage` or `YarnTestForm`.
4. Submit to `POST /api/quality/yarn-tests`; backend computes derived metrics and `CountDescription`.
5. Use `YarnTestList` and export functions (e.g. `/api/quality/yarn-tests/export`) for reporting.

### 6.2 Production

1. Navigate to the **Production** tab.
2. Load dimensions (units, yarn types, counts, lots, SPKs, slub codes, colors, rayon brands) via `/api/production` or `/api/unified`.
3. Enter daily production data in `ProductionForm` and submit to `POST /api/production/records`.
4. View data in `ProductionList` or `ProductionView`.
5. Use `DailyProductionReport` and `CountWiseSummaryReport` for aggregated operational analysis.

### 6.3 Indigo Division

1. Navigate to the **Indigo** tab.
2. Filter or list `IndigoDivisionRecord`s via `GET /api/indigo/records`.
3. Add/update rows using the Indigo form bound to `POST`/`PUT` `/api/indigo/records`.
4. Analyze Indigo performance and parameters in line with the original Indigo Excel tables.

---

## 7. Extensibility Notes

- **Adding new dimensions**
  - Extend `schema.prisma` under `packages/prisma`.
  - Generate migrations and run them.
  - Add unified routes under `/api/unified` when needed by multiple modules.
  - Create or extend admin UI tables on the frontend.

- **Adding new derived metrics**
  - Add formulas in `apps/api/src/utils/calculations.ts`.
  - Wire them into the relevant route (`quality.ts`, `production.ts`, or `indigo.ts`) when creating/updating records.

- **Integrating authentication/authorization**
  - Wrap Express routes with auth middleware.
  - Integrate token/session handling into `apiCall` on the frontend and the `Login`/`Register` components.

This document is intended as a high‑level guide; for detailed schema and column mappings to the original Excel files, see `SHARED_DATA_ARCHITECTURE.md`, `DATABASE_ARCHITECTURE_COMPARISON.md`, and the relevant `*-Table 1.csv` files.


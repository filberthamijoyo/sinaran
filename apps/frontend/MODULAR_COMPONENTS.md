# Modular Component Architecture

## Overview

Your Next.js frontend now has a modular, reusable component structure that eliminates code duplication and makes the codebase more maintainable.

## ✅ What's Been Created

### 1. Reusable UI Components (`components/ui/`)

- **Button.tsx** - Reusable button with variants (primary, secondary, danger, success) and sizes
- **Input.tsx** - Form input with label, error, and helper text support
- **Select.tsx** - Dropdown select with label, error, and helper text support
- **PageHeader.tsx** - Consistent page headers with title, description, and actions
- **FilterBar.tsx** - Configurable filter bar component
- **DataGrid.tsx** - Excel-like data grid for rapid data entry
- **Pagination.tsx** - Reusable pagination controls
- **DivisionPageLayout.tsx** - Complete layout wrapper for division pages
- **index.ts** - Barrel export for easy imports

### 2. Custom Hooks (`hooks/`)

- **useDataGrid.ts** - Hook for managing grid state, pagination, filtering, and CRUD operations

### 3. Utility Functions (`lib/utils.ts`)

- `toYMD()` - Convert date to YYYY-MM-DD format
- `toStr()` - Safe string conversion
- `formatDate()` - Format date for display
- `displayValue()` - Display value or dash if empty
- `getYear()`, `getYearMonth()` - Date extraction utilities
- `addNumber()` - Safe numeric addition

## 📁 Project Structure

```
apps/next-frontend/
├── components/
│   ├── ui/                    # ✨ NEW: Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── PageHeader.tsx
│   │   ├── FilterBar.tsx
│   │   ├── DataGrid.tsx
│   │   ├── Pagination.tsx
│   │   ├── DivisionPageLayout.tsx
│   │   ├── index.ts
│   │   └── README.md
│   ├── IndigoDivisionPage.tsx
│   ├── IndigoDivisionPage.refactored.tsx  # ✨ Example refactored page
│   └── ... (other components)
├── hooks/
│   ├── useDataGrid.ts         # ✨ NEW: Grid management hook
│   └── usePersistedState.ts
└── lib/
    ├── utils.ts               # ✨ NEW: Common utilities
    ├── api.ts
    └── numberFormat.ts
```

## 🎯 Benefits

1. **Reusability**: Components can be used across all division pages
2. **Consistency**: UI elements look and behave consistently
3. **Maintainability**: Changes to components propagate to all usages
4. **Type Safety**: Full TypeScript support
5. **Reduced Duplication**: Common patterns extracted into reusable components
6. **Easier Testing**: Isolated components are easier to test

## 📝 Usage Example

See `IndigoDivisionPage.refactored.tsx` for a complete example showing how to:

1. Use `DivisionPageLayout` for consistent page structure
2. Use `FilterBar` with configuration-driven filters
3. Use `DataGrid` for Excel-like data entry
4. Use `useDataGrid` hook for state management

## 🔄 Migration Path

To refactor existing division pages:

1. **Replace manual header/filter code** with `DivisionPageLayout` and `FilterBar`
2. **Replace custom grid code** with `DataGrid` component
3. **Replace state management** with `useDataGrid` hook
4. **Use utility functions** from `lib/utils.ts` instead of inline helpers

### Before (Duplicated Code):
```tsx
// Each division page had its own header, filters, and grid implementation
<div className="indigo-page-header">
  <h2>Indigo Division</h2>
  <button onClick={addRow}>+ Add Row</button>
</div>
<div className="indigo-filter-bar">
  <input type="date" ... />
  <input type="date" ... />
</div>
{/* 200+ lines of grid rendering code */}
```

### After (Modular):
```tsx
<DivisionPageLayout
  title="Indigo Division"
  filters={filters}
  filterConfigs={filterConfigs}
  onFilterChange={handleFilterChange}
  onAddRow={grid.addRow}
>
  <DataGrid
    columns={COLUMNS}
    rows={grid.rows}
    visibleRows={grid.visibleRows}
    // ... other props
  />
</DivisionPageLayout>
```

## 🚀 Next Steps

1. **Refactor remaining division pages** to use the new components:
   - `InspectGrayDivisionPage.tsx`
   - `WarpingDivisionPage.tsx`
   - `WeavingDivisionPage.tsx`

2. **Extract common CSS** into shared styles (consider CSS modules or Tailwind)

3. **Add more reusable components** as patterns emerge:
   - Form components
   - Modal/Dialog
   - Toast notifications
   - Loading states

4. **Create shared types** file for common interfaces

## 📚 Documentation

See `components/ui/README.md` for detailed component documentation and API references.

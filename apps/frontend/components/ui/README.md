# Modular UI Components

This directory contains reusable, modular React components designed to make the frontend more maintainable and reduce code duplication.

## Components

### Button
A reusable button component with variants and sizes.

```tsx
import { Button } from './ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- All standard button HTML attributes

### Input
A form input with label, error, and helper text support.

```tsx
import { Input } from './ui';

<Input
  type="text"
  label="Name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  helperText="Enter your full name"
/>
```

### Select
A select dropdown with label, error, and helper text support.

```tsx
import { Select } from './ui';

<Select
  label="Category"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### PageHeader
A consistent page header with title, description, and action buttons.

```tsx
import { PageHeader, Button } from './ui';

<PageHeader
  title="Page Title"
  description="Page description"
  actions={<Button onClick={handleAction}>Action</Button>}
/>
```

### FilterBar
A reusable filter bar component that renders filters based on configuration.

```tsx
import { FilterBar, FilterConfig } from './ui';

const filterConfigs: FilterConfig[] = [
  { type: 'date', key: 'dateFrom', label: 'Date from' },
  { type: 'date', key: 'dateTo', label: 'Date to' },
  { 
    type: 'select', 
    key: 'category', 
    label: 'Category',
    options: [
      { value: '', label: 'All' },
      { value: '1', label: 'Category 1' }
    ]
  }
];

<FilterBar
  filters={filters}
  filterConfigs={filterConfigs}
  onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
/>
```

### DataGrid
An Excel-like data grid component for rapid data entry.

```tsx
import { DataGrid, ColumnConfig, ColumnGroup } from './ui';

const columns: ColumnConfig[] = [
  { id: 'name', label: 'Name', width: 200, type: 'text' },
  { id: 'value', label: 'Value', width: 150, type: 'number' }
];

const columnGroups: ColumnGroup[] = [
  { label: 'Details', children: ['name', 'value'] }
];

<DataGrid
  columns={columns}
  columnGroups={columnGroups}
  rows={rows}
  visibleRows={visibleRows}
  activeCell={activeCell}
  onCellChange={handleCellChange}
  onCellFocus={handleCellFocus}
  onKeyDown={handleKeyDown}
  onSaveRow={handleSaveRow}
  // ... other props
/>
```

### DivisionPageLayout
A complete layout wrapper for division pages that combines header, filters, and content.

```tsx
import { DivisionPageLayout, FilterConfig } from './ui';

<DivisionPageLayout
  title="Division Name"
  description="Page description"
  filters={filters}
  filterConfigs={filterConfigs}
  onFilterChange={handleFilterChange}
  onAddRow={handleAddRow}
>
  {/* Your grid or other content */}
</DivisionPageLayout>
```

## Hooks

### useDataGrid
A custom hook that manages data grid state, pagination, and CRUD operations.

```tsx
import { useDataGrid } from '../hooks/useDataGrid';

const grid = useDataGrid({
  columns: COLUMNS,
  pageSize: 10,
  createEmptyRow,
  filters,
  validateRow: (row) => {
    if (!row.requiredField) return 'Required field is missing';
    return null;
  },
  onLoadData: async (filters) => {
    // Fetch data from API
    const response = await apiCall('/api/records', { params: filters });
    return response.records;
  },
  onSaveRow: async (row, rowIndex) => {
    // Save row to API
    const saved = await apiCall('/api/records', {
      method: row.id ? 'PUT' : 'POST',
      body: row
    });
    return saved;
  }
});
```

## Usage Example

See `IndigoDivisionPage.refactored.tsx` for a complete example of how to use these modular components together.

## Benefits

1. **Reusability**: Components can be used across multiple pages
2. **Consistency**: UI elements look and behave consistently
3. **Maintainability**: Changes to components propagate to all usages
4. **Type Safety**: Full TypeScript support with proper types
5. **Reduced Duplication**: Common patterns extracted into reusable components

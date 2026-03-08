/**
 * Shared TypeScript types and interfaces
 */

export type RowStatus = 'new' | 'clean' | 'dirty' | 'saving' | 'error';

export interface BaseGridRow {
  _localId: string;
  _status: RowStatus;
  _error: string;
  id: number | null;
  [key: string]: unknown;
}

export interface ColumnDefinition {
  id: string;
  label: string;
  width: number;
  type: 'text' | 'number' | 'date';
  placeholder?: string;
  readOnly?: boolean;
}

export interface ColumnGroup {
  label: string;
  children: string[];
}

export interface FilterState {
  [key: string]: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataGridConfig {
  columns: ColumnDefinition[];
  columnGroups?: ColumnGroup[];
  apiEndpoint?: string; // Optional - if not provided, works in local-only mode
  dateField?: string; // Field name for date filtering (e.g., 'tanggal', 'tgl')
  requiredFields?: string[]; // Fields required for saving
  createEmptyRow: () => BaseGridRow;
  mapRecordToRow: (record: Record<string, unknown>) => BaseGridRow;
  buildSubmitPayload: (row: BaseGridRow) => Record<string, unknown>;
}

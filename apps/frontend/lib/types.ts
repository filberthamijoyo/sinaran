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

// ─── Shared Denim Types ──────────────────────────────────────────────────────

/** Sales Contract data — shared across Warping, Indigo, BBSF, Inspect Gray/Finish */
export interface SCData {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  te: number | null;
  // Additional fabric spec fields used by forms
  kons_kode: string | null;
  kode_number: string | null;
  lot_lusi: string | null;
  ne_k_lusi: string | null;
  ne_lusi: number | null;
  sp_lusi: string | null;
  p_kons: string | null;
  sisir: string | null;
  ne_k_pakan: string | null;
  ne_pakan: number | null;
  sp_pakan: string | null;
}

// ─── Shared Defect Types (Inspect Gray & Inspect Finish) ─────────────────────

export const DEFECT_CRITICAL = [
  'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly', 'ls', 'lpb',
  'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na'
] as const;

export const DEFECT_MEDIUM = [
  'lm', 'lkc', 'lks', 'ld', 'pts', 'pd', 'lkt', 'pk', 'lp', 'plc', 'j', 'kk', 'bta',
  'pj', 'rp', 'pb', 'xpd'
] as const;

export const DEFECT_LOW = [
  'br', 'pss', 'luper', 'ptn', 'b_bercak', 'r_rusak', 'sl', 'p_timbul', 'b_celup',
  'p_tumpuk', 'b_bar', 'sml', 'p_slub', 'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
] as const;

export const ALL_DEFECTS = [...DEFECT_CRITICAL, ...DEFECT_MEDIUM, ...DEFECT_LOW] as const;

export const DEFECT_LABELS: Record<string, string> = {
  btl: 'BTL', bts: 'BTS', pp: 'PP', pks: 'PKS', ko: 'KO', db: 'DB', bl: 'BL',
  ptr: 'PTR', pkt: 'PKT', fly: 'FLY', ls: 'LS', lpb: 'LPB', p_bulu: 'P.BULU',
  smg: 'SMG', sms: 'SMS', aw: 'AW', pl: 'PL', na: 'NA',
  lm: 'LM', lkc: 'LKC', lks: 'LKS', ld: 'LD', pts: 'PTS', pd: 'PD', lkt: 'LKT',
  pk: 'PK', lp: 'LP', plc: 'PLC', j: 'J', kk: 'KK', bta: 'BTA', pj: 'PJ', rp: 'RP',
  pb: 'PB', xpd: 'XPD',
  br: 'BR', pss: 'PSS', luper: 'LUPER', ptn: 'PTN', b_bercak: 'B.BERKAK',
  r_rusak: 'R.RUSAK', sl: 'SL', p_timbul: 'P.TIMBUL', b_celup: 'B.CELUP',
  p_tumpuk: 'P.TUMPUK', b_bar: 'B.BAR', sml: 'SML', p_slub: 'P.SLUB',
  p_belang: 'P.BELANG', crossing: 'CROSSING', x_sambang: 'X.SAMBUNG',
  p_jelek: 'P.JELEK', lipatan: 'LIPATAN'
};

export interface DefectFields {
  [key: string]: string;
}

export function calculateBMC(defects: DefectFields): number {
  return ALL_DEFECTS.reduce((sum, key) => sum + (parseInt(defects[key]) || 0), 0);
}

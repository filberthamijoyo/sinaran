// Shared Sacon column metadata, used by list/form pages and (previously) the grid.
// Keeping this in a standalone module allows us to remove the old SaconDivisionPage
// component while still having a single source of truth for field ids and labels.

export const SACON_COLUMNS = [
  // Leading metadata / identifiers
  { id: 'tgl', label: 'TGL', width: 180, type: 'date' as const, placeholder: 'YYYY-MM-DD' },
  { id: 'permintaan', label: 'Permintaan', width: 260, type: 'text' as const },
  { id: 'codename', label: 'CODENAME', width: 180, type: 'text' as const },
  { id: 'kp', label: 'KP', width: 120, type: 'text' as const },
  { id: 'konsKode', label: 'Kons Kode', width: 140, type: 'text' as const },
  { id: 'kode', label: 'KODE', width: 160, type: 'text' as const },
  { id: 'katKode', label: 'Kat Kode', width: 140, type: 'text' as const },

  // Nullable descriptive / optional metadata fields
  { id: 'ketCtWs', label: 'Ket CT /WS', width: 160, type: 'text' as const }, // nullable
  { id: 'ketWarna', label: 'Ket Warna', width: 160, type: 'text' as const }, // nullable
  { id: 'status', label: 'Status', width: 120, type: 'text' as const },

  // Technical & construction fields (several nullable)
  { id: 'te', label: 'TE', width: 110, type: 'text' as const }, // nullable
  { id: 'sisir', label: 'SISIR', width: 110, type: 'text' as const }, // nullable
  { id: 'pKons', label: 'P (Kons)', width: 130, type: 'text' as const }, // nullable
  { id: 'neKLusi', label: 'Ne K Lusi', width: 140, type: 'text' as const }, // nullable
  { id: 'neLusi', label: 'Ne Lusi', width: 140, type: 'text' as const }, // nullable
  { id: 'spLusi', label: 'Sp Lusi', width: 140, type: 'text' as const },
  { id: 'lotLusi', label: 'Lot Lusi', width: 160, type: 'text' as const }, // nullable
  { id: 'neKPakan', label: 'Ne K Pakan', width: 150, type: 'text' as const }, // nullable
  { id: 'nePakan', label: 'Ne Pakan', width: 140, type: 'text' as const }, // nullable
  { id: 'spPakan', label: 'Sp Pakan', width: 140, type: 'text' as const },
  { id: 'j', label: 'J', width: 90, type: 'text' as const },
  { id: 'jPerC', label: 'J/C', width: 110, type: 'text' as const }, // nullable
  { id: 'bPerC', label: 'B/C', width: 110, type: 'text' as const }, // nullable
  { id: 'tb', label: 'TB', width: 110, type: 'text' as const }, // nullable
  { id: 'tbReal', label: 'TB REAL', width: 130, type: 'text' as const }, // nullable
  { id: 'baleLusi', label: 'BALE LUSI', width: 140, type: 'text' as const }, // nullable
  { id: 'totalPakan', label: 'TOTAL PAKAN', width: 160, type: 'text' as const }, // nullable
  { id: 'balePakan', label: 'BALE PAKAN', width: 150, type: 'text' as const }, // nullable

  // Trailing decision / workflow fields
  { id: 'ts', label: 'TS', width: 120, type: 'text' as const },
  { id: 'sacon', label: 'SACON', width: 140, type: 'text' as const },
  { id: 'accStatus', label: 'ACC / TIDAK ACC', width: 180, type: 'text' as const },
  { id: 'proses', label: 'PROSES', width: 130, type: 'text' as const },
  { id: 'fotoSacon', label: 'Foto Sacon', width: 180, type: 'text' as const },
  { id: 'remarks', label: 'Remarks', width: 220, type: 'text' as const }, // nullable
];
 
// No additional column groupings for Sacon at the moment. Kept for parity
// with other division configs in case we reintroduce the grid in future.
export const SACON_COLUMN_GROUPS: never[] = [];


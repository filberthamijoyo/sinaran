// Defect type definitions — re-exported from shared lib/types.ts
export {
  DEFECT_CRITICAL,
  DEFECT_MEDIUM,
  DEFECT_LOW,
  ALL_DEFECTS,
  DEFECT_LABELS,
  type SCData,
  type DefectFields,
  calculateBMC,
} from '../../../lib/types';

import type { DefectFields } from '../../../lib/types';

export interface RollRow {
  no_roll: string;
  sn: string;
  tgl_potong: string;
  lebar: string;
  kg: string;
  susut_lusi: string;
  grade: string;
  point: string;
  noda: string;
  kotor: string;
  bkrt: string;
  ket: string;
  defects: DefectFields;
  expanded: boolean;
}

export interface InspectFinishFormState {
  shift: string;
  operator: string;
  rolls: RollRow[];
}

export interface InspectFinishSummary {
  totalRolls: number;
  totalKg: number;
  totalBMC: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  rejectCount: number;
}

export function emptyRoll(): RollRow {
  return {
    no_roll: '',
    sn: '',
    tgl_potong: '',
    lebar: '',
    kg: '',
    susut_lusi: '',
    grade: '',
    point: '',
    noda: '',
    kotor: '',
    bkrt: '',
    ket: '',
    defects: {},
    expanded: false,
  };
}

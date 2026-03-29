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
  panjang: string;
  lebar: string;
  berat: string;
  grade: string;
  cacat: string;
  opg: string;
  defects: DefectFields;
  expanded: boolean;
}

export interface InspectGrayFormState {
  inspector_name: string;
  sj: string;
  opg: string;
  rolls: RollRow[];
}

export interface InspectGraySummary {
  totalRolls: number;
  totalPanjang: number;
  totalBerat: number;
  totalBMC: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  rejectCount: number;
}

export function emptyRoll(): RollRow {
  return {
    no_roll: '',
    panjang: '',
    lebar: '',
    berat: '',
    grade: '',
    cacat: '',
    opg: '',
    defects: {},
    expanded: false,
  };
}

export interface AnalyticsData {
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  weeklyProduction: Array<{ week: string; total_meters: number; total_picks: number; record_count: number }>;
  monthlyChemicals: Array<{ month: string; avg_indigo: number; avg_caustic: number; avg_hydro: number }>;
  cycleTimeDistribution: Array<{ kp: string; days_contract_to_weaving: number | null }>;
  machineList: string[];
  efficiencyByMachine: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
  productionVelocity: Array<{ day: string; total_meters: number; machines: number }>;
  machineHeatmap: Array<{ machine: string; week: string; avg_efficiency: number; records: number }>;
}

export interface KpData {
  sc: { kp: string; codename: string; kat_kode: string; te: string; ket_warna: string; tgl: Date } | null;
  warping: { tgl: Date; no_mc: string; rpm: number; total_beam: number; total_putusan: number; elongasi: number; strength: number; cv_pct: number; tension_badan: number; tension_pinggir: number } | null;
  indigo: { tgl: Date; mc: string; speed: number; bak_celup: number; indigo: number; caustic: number; hydro: number; temp_dryer: number; strength: number; elongasi: number } | null;
  weavingSummary: { totalRecords: number; avgEfficiency: number; totalMeters: number; uniqueMachines: number; firstDate: string; lastDate: string } | null;
}

export type KpSearchResult = {
  kp: string;
  codename: string;
  kat_kode: string;
  ket_warna: string | null;
  tgl: string;
  pipeline_status: string;
  has_warping: boolean;
  has_indigo: boolean;
  weaving_count: number;
  avg_efficiency: number | null;
};

export type Tab = 'efficiency' | 'production' | 'comparison' | 'machines';

export interface FilterState {
  fromDate: string;
  toDate: string;
  selectedMachine: string;
}

export interface ComparisonProps {
  initialData?: {
    searchResults?: KpSearchResult[];
    codenameOptions?: string[];
    katKodeOptions?: string[];
  };
}

export interface KPComparisonTabProps extends ComparisonProps {
  initialData?: {
    searchResults?: KpSearchResult[];
    codenameOptions?: string[];
    katKodeOptions?: string[];
  };
}

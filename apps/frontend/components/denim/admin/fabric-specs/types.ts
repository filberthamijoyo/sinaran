export type FabricSpec = {
  id: number;
  item: string;
  kons_kode: string;
  kode: string;
  kat_kode: string;
  te: number | null;
  lusi_type: string | null;
  lusi_ne: string | null;
  pakan_type: string | null;
  pakan_ne: string | null;
  sisir: string | null;
  pick: number | null;
  anyaman: string | null;
  arah: string | null;
  lg_inches: number | null;
  lf_inches: number | null;
  susut_pakan: number | null;
  warna: string | null;
  pretreatment: string | null;
  indigo_i: number | null;
  indigo_bak_i: number | null;
  sulfur_s: number | null;
  sulfur_bak_s: number | null;
  posttreatment: string | null;
  finish: string | null;
  oz_g: number | null;
  oz_f: number | null;
  p_kons: string | null;
  remarks: string | null;
  usage_count: number;
};

export type ExpandedSections = {
  identity: boolean;
  threadWeave: boolean;
  dimensions: boolean;
  colorProcess: boolean;
};

export type FormData = Partial<FabricSpec>;

export const KAT_KODE_OPTIONS = ['SC', 'WS', 'Other'] as const;
export type KatKode = (typeof KAT_KODE_OPTIONS)[number];

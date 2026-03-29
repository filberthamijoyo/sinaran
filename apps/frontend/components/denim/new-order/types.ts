export type FabricSpec = {
  id: number;
  item: string;
  kons_kode: string;
  kode: string;
  kat_kode: string;
  te: number | null;
  lusi_ne: string | null;
  pakan_ne: string | null;
  sisir: string | null;
  pick: number | null;
  warna: string | null;
  oz_g: number | null;
  oz_f: number | null;
  arah: string | null;
  anyaman: string | null;
  usage_count?: number;
};

export type FormState = {
  tgl: string;
  permintaan: string;
  status: string;
  selectedSpec: FabricSpec | null;
  ket_warna: string;
  proses: string;
  te: string;
  catatan: string;
  anyaman: string;
  arah: string;
};

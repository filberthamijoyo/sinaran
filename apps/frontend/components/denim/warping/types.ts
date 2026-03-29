export interface BeamRow {
  beam_number: string;
  panjang_beam: string;
  jumlah_ends: string;
  putusan: string;
}

export interface WarpingFormState {
  tgl: string;
  start: string;
  stop: string;
  rpm: string;
  mtr_per_min: string;
  no_mc: string;
  elongasi: string;
  strength: string;
  cv_pct: string;
  tension_badan: string;
  tension_pinggir: string;
  lebar_creel: string;
  jam: string;
  beams: BeamRow[];
}

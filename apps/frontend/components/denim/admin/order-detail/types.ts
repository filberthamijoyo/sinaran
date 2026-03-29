// ─── Raw API response ────────────────────────────────────────────────────────

export type SalesContract = {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  te: number | null;
  acc: string | null;
  pipeline_status: string;
  ne_lusi: string | null;
  ne_pakan: string | null;
  sisir: string | null;
  pick: string | null;
  sacon: boolean;
  ts: string | null;
  j: number | null;
  j_c: number | null;
  b_c: number | null;
  tb: number | null;
  tb_real: number | null;
  bale_lusi: number | null;
  total_pakan: number | null;
  foto_sacon: string | null;
};

export type WarpingBeam = {
  id: number;
  warping_run_id: number;
  kp: string;
  position: number;
  beam_number: number;
  putusan: number | null;
  jumlah_ends: number | null;
  panjang_beam: number | null;
};

export type WarpingRun = {
  id: number;
  kp: string;
  tgl: string;
  start_time: string | null;
  stop_time: string | null;
  kode_full: string | null;
  benang: string | null;
  lot: string | null;
  sp: string | null;
  pt: number | null;
  te: number | null;
  rpm: number | null;
  mtr_min: number | null;
  total_putusan: number | null;
  data_putusan: string | null;
  total_beam: number | null;
  cn_1: number | null;
  jam: number | null;
  total_waktu: number | null;
  eff_warping: number | null;
  no_mc: number | null;
  elongasi: number | null;
  strength: number | null;
  cv_pct: number | null;
  tension_badan: number | null;
  tension_pinggir: number | null;
  lebar_creel: number | null;
  mtr_per_min: number | null;
  start: string | null;
  stop: string | null;
  beams: WarpingBeam[];
};

export type IndigoRun = {
  id: number;
  kp: string;
  tgl: string;
  tanggal: string;
  mc: number | null;
  kode_full: string | null;
  ne: string | null;
  p: number | null;
  te: number | null;
  bb: number | null;
  speed: number | null;
  bak_celup: number | null;
  bak_sulfur: number | null;
  konst_idg: number | null;
  konst_sulfur: number | null;
  visc: number | null;
  ref: number | null;
  size_box: number | null;
  scoring: number | null;
  jetsize: number | null;
  polisize_hs: number | null;
  polisize_1_2: number | null;
  armosize: number | null;
  armosize_1_1: number | null;
  armosize_1_2: number | null;
  armosize_1_3: number | null;
  armosize_1_5: number | null;
  armosize_1_7: number | null;
  quqlaxe: number | null;
  armo_c: number | null;
  vit_e: number | null;
  armo_d: number | null;
  tapioca: number | null;
  a_308: number | null;
  indigo: number | null;
  caustic: number | null;
  hydro: number | null;
  solopol: number | null;
  serawet: number | null;
  primasol: number | null;
  cottoclarin: number | null;
  setamol: number | null;
  granular: number | null;
  granule: number | null;
  grain: number | null;
  wet_matic: number | null;
  fisat: number | null;
  breviol: number | null;
  csk: number | null;
  comee: number | null;
  dirsol_rdp: number | null;
  primasol_nf: number | null;
  zolopol_phtr: number | null;
  cottoclarin_2: number | null;
  sanwet: number | null;
  marcerize_caustic: number | null;
  sanmercer: number | null;
  sancomplex: number | null;
  exsess_caustic: number | null;
  exsess_hydro: number | null;
  dextoor: number | null;
  ltr: number | null;
  Direcsol_black_kas: number | null;
  sansul_sdc: number | null;
  caustic_2: number | null;
  dextros: number | null;
  solopol_2: number | null;
  primasol_2: number | null;
  serawet_2: number | null;
  cottoclarin_3: number | null;
  saneutral: number | null;
  dextrose_adjust: number | null;
  optifik_rsl: number | null;
  ekalin_f: number | null;
  solopol_phtr: number | null;
  moisture_mahlo: number | null;
  temp_dryer: number | null;
  temp_mid_dryer: number | null;
  temp_size_box_1: number | null;
  temp_size_box_2: number | null;
  size_box_1: number | null;
  size_box_2: number | null;
  indigo_conc: number | null;
  sulfur_bak: number | null;
  sulfur_conc: number | null;
  squeezing_roll_1: number | null;
  squeezing_roll_2: number | null;
  immersion_roll: number | null;
  dryer: number | null;
  take_off: number | null;
  winding: number | null;
  press_beam: number | null;
  hardness: number | null;
  unwinder: number | null;
  dyeing_tens_wash: number | null;
  dyeing_tens_warna: number | null;
  mc_idg: number | null;
  tenacity: number | null;
  elongasi_idg: number | null;
  strength_idg: number | null;
  strength: number | null;
  elongasi: number | null;
  start: string | null;
  stop: string | null;
  jumlah_rope: number | null;
  panjang_rope: number | null;
  total_meters: number | null;
  keterangan: string | null;
};

export type WeavingRecord = {
  id: number;
  kp: string;
  tanggal: string;
  shift: string | null;
  machine: string | null;
  beam: number | null;
  kpicks: number | null;
  meters: number | null;
  a_pct: number | null;
};

export type InspectGrayRecord = {
  id: number;
  kp: string;
  tg: string;
  mc: string | null;
  no_roll: number | null;
  panjang: number | null;
  lebar: number | null;
  berat: number | null;
  gd: string | null;
};

export type InspectGrayRecordFull = {
  id: number;
  kp: string;
  tg: string;
  mc: string | null;
  bm: number | null;
  sn: string | null;
  gd: string | null;
  w: string | null;
  bmc: number | null;
};

export type BBSFWashingRun = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  mc: string | null;
  speed: string | null;
  lebar_awal: string | null;
  permasalahan: string | null;
};

export type BBSFSanforRun = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  sanfor_type: string | null;
  speed: string | null;
  susut: number | null;
  permasalahan: string | null;
};

export type BBSFRecord = {
  id: number;
  kp: string;
  tgl: string;
  ws_shift: string | null;
  ws_mc: string | null;
  ws_speed: string | null;
  ws_larutan_1: string | null;
  ws_temp_1: string | null;
  ws_padder_1: string | null;
  ws_dancing_1: string | null;
  ws_larutan_2: string | null;
  ws_temp_2: string | null;
  ws_padder_2: string | null;
  ws_dancing_2: string | null;
  ws_skew: string | null;
  ws_tekanan_boiler: string | null;
  ws_temp_1_zone: string | null;
  ws_temp_2_zone: string | null;
  ws_temp_3_zone: string | null;
  ws_temp_4_zone: string | null;
  ws_temp_5_zone: string | null;
  ws_temp_6_zone: string | null;
  ws_lebar_awal: string | null;
  ws_panjang_awal: string | null;
  ws_permasalahan: string | null;
  ws_pelaksana: string | null;
  sf1_shift: string | null;
  sf1_mc: string | null;
  sf1_speed: string | null;
  sf1_damping: string | null;
  sf1_press: string | null;
  sf1_tension: string | null;
  sf1_tension_limit: string | null;
  sf1_temperatur: string | null;
  sf1_susut: string | null;
  sf1_permasalahan: string | null;
  sf1_pelaksana: string | null;
  sf2_shift: string | null;
  sf2_mc: string | null;
  sf2_speed: string | null;
  sf2_damping: string | null;
  sf2_press: string | null;
  sf2_tension: string | null;
  sf2_temperatur: string | null;
  sf2_susut: string | null;
  sf2_awal: string | null;
  sf2_akhir: string | null;
  sf2_panjang: string | null;
  sf2_permasalahan: string | null;
  sf2_pelaksana: string | null;
};

export type InspectFinishRecord = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  operator: string | null;
  no_roll: number | null;
  sn: string | null;
  tgl_potong: string | null;
  lebar: number | null;
  kg: number | null;
  susut_lusi: number | null;
  grade: string | null;
  point: number | null;
  btl: number | null;
  bts: number | null;
  slub: number | null;
  snl: number | null;
  losp: number | null;
  lb: number | null;
  ptr: number | null;
  p_slub: number | null;
  pb: number | null;
  lm: number | null;
  aw: number | null;
  ptm: number | null;
  j: number | null;
  bta: number | null;
  pts: number | null;
  pd: number | null;
  pp: number | null;
  pks: number | null;
  pss: number | null;
  pkl: number | null;
  pk: number | null;
  plc: number | null;
  lp: number | null;
  lks: number | null;
  lkc: number | null;
  ld: number | null;
  lkt: number | null;
  lki: number | null;
  lptd: number | null;
  bmc: number | null;
  exst: number | null;
  smg: number | null;
  noda: string | null;
  kotor: string | null;
  bkrt: string | null;
  ket: string | null;
};

// ─── API response ─────────────────────────────────────────────────────────────

export type PipelineApiResponse = {
  sc: SalesContract | null;
  warping: WarpingRun | null;
  indigo: IndigoRun | null;
  weaving: WeavingRecord[];
  inspectGray?: InspectGrayRecordFull[];
  bbsfWashing?: BBSFWashingRun[];
  bbsfSanfor?: BBSFSanforRun[];
  inspectFinish?: InspectFinishRecord[];
};

// ─── Internal shape used throughout ───────────────────────────────────────────

export type PipelineData = {
  sc: SalesContract | null;
  warping: WarpingRun | null;
  indigo: IndigoRun | null;
  weaving: WeavingRecord[];
  inspectGray: InspectGrayRecordFull[];
  bbsfWashing: BBSFWashingRun[];
  bbsfSanfor: BBSFSanforRun[];
  inspectFinish: InspectFinishRecord[];
};

// ─── Shared stage helpers ──────────────────────────────────────────────────────

export type PipelineStages = {
  approval: boolean;
  sacon: boolean;
  warping: boolean;
  indigo: boolean;
  weaving: boolean;
  inspect: boolean;
  bbsf: boolean;
  inspectFinish: boolean;
  complete: boolean;
};

export const STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Approval' },
  { key: 'SACON', label: 'Sacon' },
  { key: 'WARPING', label: 'Warping' },
  { key: 'INDIGO', label: 'Indigo' },
  { key: 'WEAVING', label: 'Weaving' },
  { key: 'INSPECT_GRAY', label: 'Inspect Gray' },
  { key: 'BBSF', label: 'BBSF' },
  { key: 'INSPECT_FINISH', label: 'Inspect Finish' },
  { key: 'COMPLETE', label: 'Complete' },
] as const;

export type StageKey = typeof STAGES[number]['key'];

export function getPipelineStages(data: PipelineData): PipelineStages {
  const hasApproval = !!data.sc;
  const hasSacon = !!data.sc && data.sc.pipeline_status === 'SACON';
  const hasWarping = !!data.warping;
  const hasIndigo = !!data.indigo;
  const hasWeaving = data.weaving && data.weaving.length > 0;
  const hasInspect = data.inspectGray && data.inspectGray.length > 0;
  const hasBBSF =
    (data.bbsfWashing && data.bbsfWashing.length > 0) ||
    (data.bbsfSanfor && data.bbsfSanfor.length > 0);
  const hasInspectFinish = data.inspectFinish && data.inspectFinish.length > 0;
  const isComplete = hasInspectFinish;

  return {
    approval: hasApproval,
    sacon: hasSacon,
    warping: hasWarping,
    indigo: hasIndigo,
    weaving: hasWeaving,
    inspect: hasInspect,
    bbsf: hasBBSF,
    inspectFinish: hasInspectFinish,
    complete: isComplete,
  };
}

export function getCurrentStage(stages: PipelineStages): StageKey {
  if (stages.complete) return 'COMPLETE';
  if (stages.inspectFinish) return 'INSPECT_FINISH';
  if (stages.bbsf) return 'BBSF';
  if (stages.inspect) return 'INSPECT_GRAY';
  if (stages.weaving) return 'WEAVING';
  if (stages.indigo) return 'INDIGO';
  if (stages.warping) return 'WARPING';
  if (stages.sacon) return 'SACON';
  return 'PENDING_APPROVAL';
}

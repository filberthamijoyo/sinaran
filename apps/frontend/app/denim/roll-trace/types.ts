export interface DecodedSN {
  machine: string;
  beam: number;
  lot: string;
}

export interface SalesContract {
  kp: string;
  kons_kode: string;
  kode: string;
  item: string;
  quantity: number;
  delivery_date: string;
}

export interface WeavingRecord {
  id: number;
  kp: string;
  machine: string;
  tanggal: string;
  shift: string;
  efficiency: number;
  total_picks: number;
}

export interface InspectGrayRecord {
  id: number;
  kp: string;
  mc: string;
  bm: number;
  sn: string;
  sn_combined: string;
  tg: string;
  grade: string;
  lebar: number;
  berat: number;
  panjang: number;
}

export interface InspectFinishRecord {
  id: number;
  kp: string;
  sn_combined: string;
  tgl: string;
  grade: string;
  lebar: number;
  kg: number;
  susut_lusi: number;
  point: number;
}

export interface SearchResult {
  sn: string;
  source: 'gray' | 'finish';
  kp: string;
  grade: string;
}

export interface WarpingData {
  kp: string;
  tgl: string;
  total_beams: number;
}

export interface BeamData {
  beam_number: number;
  weight_kg: number;
  length_meters: number;
}

export interface IndigoData {
  kp: string;
  tanggal: string;
  bb: number;
}

export interface BbsfWashingData {
  tgl: string;
  speed: number;
  temp_1: number;
}

export interface BbsfSanforData {
  tgl: string;
  susut: number;
}

export interface RollTraceData {
  sn: string;
  decoded: DecodedSN | null;
  salesContract: SalesContract | null;
  warping: WarpingData | null;
  beam: BeamData | null;
  weavingRecords: WeavingRecord[];
  indigoRun: IndigoData | null;
  inspectGray: InspectGrayRecord | null;
  bbsfWashing: BbsfWashingData[];
  bbsfSanfor: BbsfSanforData[];
  inspectFinish: InspectFinishRecord[];
}

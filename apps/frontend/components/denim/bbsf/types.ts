export type { SCData } from '../../../lib/types';

export interface BBSFFormState {
  // Line selection
  line: number | null;
  // Washing
  ws_shift: string;
  ws_speed: string;
  ws_jam_proses: string;
  ws_larutan_1: string;
  ws_temp_1: string;
  ws_padder_1: string;
  ws_dancing_1: string;
  ws_press_dancing_1: string;
  ws_press_dancing_2: string;
  ws_press_dancing_3: string;
  ws_larutan_2: string;
  ws_temp_2: string;
  ws_padder_2: string;
  ws_dancing_2: string;
  ws_skew: string;
  ws_skala_skew: string;
  ws_tekanan_boiler: string;
  ws_temp_1_zone: string;
  ws_temp_2_zone: string;
  ws_temp_3_zone: string;
  ws_temp_4_zone: string;
  ws_temp_5_zone: string;
  ws_temp_6_zone: string;
  ws_lebar_awal: string;
  ws_panjang_awal: string;
  ws_permasalahan: string;
  ws_pelaksana: string;
  // Sanfor 1
  sf1_shift: string;
  sf1_jam: string;
  sf1_speed: string;
  sf1_damping: string;
  sf1_press: string;
  sf1_tension: string;
  sf1_tension_limit: string;
  sf1_temperatur: string;
  sf1_susut: string;
  sf1_permasalahan: string;
  sf1_pelaksana: string;
  // Sanfor 2
  sf2_shift: string;
  sf2_jam: string;
  sf2_speed: string;
  sf2_damping: string;
  sf2_press: string;
  sf2_tension: string;
  sf2_temperatur: string;
  sf2_susut: string;
  sf2_awal: string;
  sf2_akhir: string;
  sf2_panjang: string;
  sf2_permasalahan: string;
  sf2_pelaksana: string;
}

export type TabType = 'washing' | 'sanfor1' | 'sanfor2';

export interface BbsfWashingRow {
  line?: number | null;
  shift?: string | null;
  mc?: string | null;
  speed?: number | null;
  larutan_1?: number | null;
  temp_1?: number | null;
  padder_1?: number | null;
  dancing_1?: number | null;
  larutan_2?: number | null;
  temp_2?: number | null;
  padder_2?: number | null;
  dancing_2?: number | null;
  skew?: number | null;
  tekanan_boiler?: number | null;
  temp_1_zone?: number | null;
  temp_2_zone?: number | null;
  temp_3_zone?: number | null;
  temp_4_zone?: number | null;
  temp_5_zone?: number | null;
  temp_6_zone?: number | null;
  lebar_awal?: number | null;
  panjang_awal?: number | null;
  permasalahan?: string | null;
  pelaksana?: string | null;
}

export interface BbsfSanforRow {
  shift?: string | null;
  mc?: string | null;
  jam?: number | null;
  speed?: number | null;
  damping?: number | null;
  press?: number | null;
  tension?: number | null;
  tension_limit?: number | null;
  temperatur?: number | null;
  susut?: number | null;
  permasalahan?: string | null;
  pelaksana?: string | null;
}

export interface PipelineResponse {
  bbsfWashing?: BbsfWashingRow[];
  bbsfSanfor?: BbsfSanforRow[];
}

export const emptyForm = (): BBSFFormState => ({
  line: null,
  ws_shift: '',
  ws_speed: '',
  ws_jam_proses: '',
  ws_larutan_1: '',
  ws_temp_1: '',
  ws_padder_1: '',
  ws_dancing_1: '',
  ws_press_dancing_1: '',
  ws_press_dancing_2: '',
  ws_press_dancing_3: '',
  ws_larutan_2: '',
  ws_temp_2: '',
  ws_padder_2: '',
  ws_dancing_2: '',
  ws_skew: '',
  ws_skala_skew: '',
  ws_tekanan_boiler: '',
  ws_temp_1_zone: '',
  ws_temp_2_zone: '',
  ws_temp_3_zone: '',
  ws_temp_4_zone: '',
  ws_temp_5_zone: '',
  ws_temp_6_zone: '',
  ws_lebar_awal: '',
  ws_panjang_awal: '',
  ws_permasalahan: '',
  ws_pelaksana: '',
  sf1_shift: '',
  sf1_jam: '',
  sf1_speed: '',
  sf1_damping: '',
  sf1_press: '',
  sf1_tension: '',
  sf1_tension_limit: '',
  sf1_temperatur: '',
  sf1_susut: '',
  sf1_permasalahan: '',
  sf1_pelaksana: '',
  sf2_shift: '',
  sf2_jam: '',
  sf2_speed: '',
  sf2_damping: '',
  sf2_press: '',
  sf2_tension: '',
  sf2_temperatur: '',
  sf2_susut: '',
  sf2_awal: '',
  sf2_akhir: '',
  sf2_panjang: '',
  sf2_permasalahan: '',
  sf2_pelaksana: '',
});

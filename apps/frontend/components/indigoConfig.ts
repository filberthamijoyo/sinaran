import type { ColumnDefinition, ColumnGroup } from '../lib/types';
import { toStr, toYMD } from '../lib/utils';

// Full Indigo grid columns based on INDIGO-Table 1.csv
export const INDIGO_COLUMNS: ColumnDefinition[] = [
  // Ungrouped (leading)
  { id: 'tanggal', label: 'TANGGAL', width: 180, type: 'date', placeholder: 'YYYY-MM-DD' },
  { id: 'mc', label: 'MC', width: 110, type: 'text' },
  { id: 'kp', label: 'KP', width: 140, type: 'text' },
  { id: 'code', label: 'CODE', width: 210, type: 'text' },
  { id: 'ne', label: 'NE', width: 150, type: 'text' },
  { id: 'p', label: 'P', width: 110, type: 'text' },
  { id: 'te', label: 'TE', width: 110, type: 'text' },
  { id: 'bb', label: 'BB', width: 120, type: 'text' },
  { id: 'speed', label: 'SPEED', width: 150, type: 'number' },
  { id: 'bakCelup', label: 'BAK CELUP', width: 150, type: 'number' },
  { id: 'bakSulfur', label: 'BAK SULFUR', width: 150, type: 'number' },
  { id: 'konstIdg', label: 'KONST IDG', width: 150, type: 'number' },
  { id: 'konstSulfur', label: 'KONST SULFUR', width: 165, type: 'number' },

  // PEMAKAIAN OBAT
  { id: 'visc', label: 'VISC', width: 135, type: 'number' },
  { id: 'ref', label: 'REF', width: 135, type: 'number' },
  { id: 'sizeBox', label: 'SIZE BOX', width: 150, type: 'number' },
  { id: 'scoring', label: 'SCORING', width: 150, type: 'number' },
  { id: 'jetsize', label: 'JETSIZE', width: 150, type: 'number' },
  { id: 'polisizeHs', label: 'POLISIZE HS', width: 165, type: 'number' },
  { id: 'polisize12', label: 'POLISIZE 1.2', width: 165, type: 'number' },
  { id: 'armosize', label: 'ARMOSIZE', width: 150, type: 'number' },
  { id: 'armosize11', label: 'ARMOSIZE 1.1', width: 165, type: 'number' },
  { id: 'armosize12', label: 'ARMOSIZE 1.2', width: 165, type: 'number' },
  { id: 'armosize13', label: 'ARMOSIZE 1.3', width: 165, type: 'number' },
  { id: 'armosize15', label: 'ARMOSIZE 1.5', width: 165, type: 'number' },
  { id: 'armosize17', label: 'ARMOSIZE 1.7', width: 165, type: 'number' },
  { id: 'quqlaxe', label: 'QUQLAXE', width: 150, type: 'number' },
  { id: 'armoC', label: 'ARMO C', width: 150, type: 'number' },
  { id: 'vitE', label: 'VIT E', width: 135, type: 'number' },
  { id: 'armoD', label: 'ARMO D', width: 150, type: 'number' },
  { id: 'tapioca', label: 'TAPIOCA', width: 150, type: 'number' },
  { id: 'a308', label: 'A 308', width: 135, type: 'number' },

  // PEMASAKAN INDIGO (AKTUAL)
  { id: 'indigo', label: 'INDIGO', width: 150, type: 'number' },
  { id: 'causticPemasakanIndigo', label: 'CAUSTIC', width: 150, type: 'number' },
  { id: 'hydro', label: 'HYDRO', width: 150, type: 'number' },
  { id: 'solopolPemasakanIndigo', label: 'SOLOPOL', width: 150, type: 'number' },
  { id: 'serawetPemasakanIndigo', label: 'SERAWET', width: 150, type: 'number' },
  { id: 'primasolPemasakanIndigo', label: 'PRIMASOL', width: 150, type: 'number' },
  { id: 'cottoclarinPemasakanIndigo', label: 'COTTOCLARIN', width: 180, type: 'number' },
  { id: 'setamol', label: 'SETAMOL', width: 150, type: 'number' },

  // Ungrouped chemicals between groups
  { id: 'granular', label: 'GRANULAR', width: 150, type: 'number' },
  { id: 'granule', label: 'GRANULE', width: 150, type: 'number' },
  { id: 'grain', label: 'GRAIN', width: 135, type: 'number' },
  { id: 'wetMatic', label: 'WET MATIC', width: 165, type: 'number' },
  { id: 'fisat', label: 'FISAT', width: 135, type: 'number' },
  { id: 'breviol', label: 'BREVIOL', width: 150, type: 'number' },
  { id: 'csk', label: 'CSK', width: 120, type: 'number' },
  { id: 'comee', label: 'COMEE', width: 150, type: 'number' },

  // PEMASAKAN CAUSTIK
  { id: 'dirsolRdp', label: 'DIRSOL RDP', width: 165, type: 'number' },
  { id: 'primasolNf', label: 'PRIMASOL NF', width: 165, type: 'number' },
  { id: 'zolopolPhtrZb', label: 'ZOLOPOL PHTR/ZB', width: 195, type: 'number' },
  { id: 'cottoclarinPemasakanCaustik', label: 'COTTOCLARIN', width: 180, type: 'number' },
  { id: 'sanwet', label: 'SANWET', width: 150, type: 'number' },

  // PEMASAKAN CAUSTIC
  { id: 'marcerizeCoustic', label: 'MARCERIZE COUSTIC', width: 210, type: 'number' },
  { id: 'sanmercer', label: 'SANMERCER', width: 165, type: 'number' },
  { id: 'sancomplex', label: 'SANCOMPLEX', width: 165, type: 'number' },

  // PEMASAKAN HYDRO AKSES
  { id: 'exsessCaustic', label: 'EXSESS CAUSTIC', width: 180, type: 'number' },
  { id: 'exsessHydro', label: 'EXSESS HYDRO', width: 180, type: 'number' },

  // Ungrouped between HYDRO AKSES and SULFUR FEEDING
  { id: 'dextoor', label: 'DEXTOOR', width: 150, type: 'number' },
  { id: 'ltr', label: 'LTR', width: 120, type: 'number' },

  // PEMASAKAN SULFUR (FEEDING)
  {
    id: 'diresolBlackKasRotkas',
    label: 'DIRESOL BLACK KAS (ROTKAS)',
    width: 240,
    type: 'number',
  },
  { id: 'sansulSdc', label: 'SANSUL SDC', width: 180, type: 'number' },
  { id: 'causticPemasakanSulfur', label: 'CAUSTIC', width: 150, type: 'number' },
  { id: 'dextros', label: 'DEXTROS', width: 150, type: 'number' },
  { id: 'solopolPemasakanSulfur', label: 'SOLOPOL', width: 150, type: 'number' },
  { id: 'primasolPemasakanSulfur', label: 'PRIMASOL', width: 150, type: 'number' },
  { id: 'serawetPemasakanSulfur', label: 'SERAWET', width: 150, type: 'number' },
  { id: 'cottoclarinPemasakanSulfur', label: 'COTTOCLARIN', width: 180, type: 'number' },

  // FEEDING
  { id: 'saneutral', label: 'SANEUTRAL', width: 165, type: 'number' },
  { id: 'dextroseAdjust', label: 'DEXTROSE (ADJUST)', width: 210, type: 'number' },

  // Ungrouped between FEEDING and SETINGAN INDIGO
  { id: 'optifikRsl', label: 'OPTIFIK RSL', width: 180, type: 'number' },
  { id: 'ekalinF', label: 'EKALIN F', width: 150, type: 'number' },
  { id: 'solopolPhtr', label: 'SOLOPOL PHTR', width: 180, type: 'number' },

  // SETINGAN INDIGO
  { id: 'moitureMahlo', label: 'MOITURE MAHLO', width: 195, type: 'number' },
  { id: 'tempDryer', label: 'TEMP DRYER', width: 165, type: 'number' },
  { id: 'tempMidDryer', label: 'TEMP MID DRYER', width: 195, type: 'number' },
  { id: 'tempSizeBox1', label: 'TEMP SIZE BOX 1', width: 210, type: 'number' },
  { id: 'tempSizeBox2', label: 'TEMP SIZE BOX 2', width: 210, type: 'number' },
  { id: 'sizeBox1', label: 'SIZE BOX 1', width: 165, type: 'number' },
  { id: 'sizeBox2', label: 'SIZE BOX 2', width: 165, type: 'number' },
  { id: 'squeezingRoll1', label: 'SQUEEZING ROLL 1', width: 210, type: 'number' },
  { id: 'squeezingRoll2', label: 'SQUEEZING ROLL 2', width: 210, type: 'number' },
  { id: 'immersionRoll', label: 'IMMERSION ROLL', width: 195, type: 'number' },
  { id: 'dryer', label: 'DRYER', width: 150, type: 'number' },
  { id: 'takeOff', label: 'TAKE OFF', width: 165, type: 'number' },
  { id: 'winding', label: 'WINDING', width: 165, type: 'number' },
  { id: 'pressBeam', label: 'PRESS BEAM', width: 180, type: 'number' },
  { id: 'hydrolicPump1', label: 'HYDROLIC PUMP 1', width: 210, type: 'number' },
  { id: 'hydrolicPump2', label: 'HYDROLIC PUMP 2', width: 210, type: 'number' },
  { id: 'unwinder', label: 'UNWINDER', width: 165, type: 'number' },
  { id: 'dyeingTensWash', label: 'DYEING TENS WASH', width: 225, type: 'number' },
  { id: 'dyeingTensWarna', label: 'DYEING TENS WARNA', width: 240, type: 'number' },

  // Ungrouped trailing
  { id: 'mcIdg', label: 'MC IDG', width: 150, type: 'number' },
  { id: 'strength', label: 'STRENGTH', width: 165, type: 'number' },
  { id: 'elongasiIdg', label: 'ELONGASI IDG', width: 195, type: 'number' },
  { id: 'cvPercent', label: 'CV%', width: 135, type: 'number' },
];

// Column group configuration for the multi-row header
export const INDIGO_COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: 'PEMAKAIAN OBAT',
    children: [
      'visc',
      'ref',
      'sizeBox',
      'scoring',
      'jetsize',
      'polisizeHs',
      'polisize12',
      'armosize',
      'armosize11',
      'armosize12',
      'armosize13',
      'armosize15',
      'armosize17',
      'quqlaxe',
      'armoC',
      'vitE',
      'armoD',
      'tapioca',
      'a308',
    ],
  },
  {
    label: 'PEMASAKAN INDIGO (AKTUAL)',
    children: [
      'indigo',
      'causticPemasakanIndigo',
      'hydro',
      'solopolPemasakanIndigo',
      'serawetPemasakanIndigo',
      'primasolPemasakanIndigo',
      'cottoclarinPemasakanIndigo',
      'setamol',
    ],
  },
  {
    label: 'PEMASAKAN CAUSTIK',
    children: ['dirsolRdp', 'primasolNf', 'zolopolPhtrZb', 'cottoclarinPemasakanCaustik', 'sanwet'],
  },
  {
    label: 'PEMASAKAN CAUSTIC',
    children: ['marcerizeCoustic', 'sanmercer', 'sancomplex'],
  },
  {
    label: 'PEMASAKAN HYDRO AKSES',
    children: ['exsessCaustic', 'exsessHydro'],
  },
  {
    label: 'PEMASKAN SULFUR (FEEDING)',
    children: [
      'diresolBlackKasRotkas',
      'sansulSdc',
      'causticPemasakanSulfur',
      'dextros',
      'solopolPemasakanSulfur',
      'primasolPemasakanSulfur',
      'serawetPemasakanSulfur',
      'cottoclarinPemasakanSulfur',
    ],
  },
  {
    label: 'FEEDING',
    children: ['saneutral', 'dextroseAdjust'],
  },
  {
    label: 'SETINGAN INDIGO',
    children: [
      'moitureMahlo',
      'tempDryer',
      'tempMidDryer',
      'tempSizeBox1',
      'tempSizeBox2',
      'sizeBox1',
      'sizeBox2',
      'squeezingRoll1',
      'squeezingRoll2',
      'immersionRoll',
      'dryer',
      'takeOff',
      'winding',
      'pressBeam',
      'hydrolicPump1',
      'hydrolicPump2',
      'unwinder',
      'dyeingTensWash',
      'dyeingTensWarna',
    ],
  },
];

export const INDIGO_REQUIRED_FIELDS = ['tanggal'] as const;

export type IndigoValues = Record<string, string>;

export const createEmptyIndigoValues = (): IndigoValues => {
  const base: IndigoValues = {};
  INDIGO_COLUMNS.forEach((col) => {
    base[col.id] = '';
  });
  return base;
};

export const mapIndigoRecordToValues = (record: Record<string, unknown>): IndigoValues => {
  const values = createEmptyIndigoValues();
  INDIGO_COLUMNS.forEach((col) => {
    if (col.id === 'tanggal') {
      values.tanggal = toYMD(record.tanggal as any);
    } else {
      values[col.id] = toStr(record[col.id]);
    }
  });
  return values;
};

export const buildIndigoPayload = (values: IndigoValues): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  INDIGO_COLUMNS.forEach((col) => {
    payload[col.id] = values[col.id] ?? '';
  });
  return payload;
};


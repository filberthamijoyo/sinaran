'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { ArrowLeft, Check, Circle, CheckCircle2, GitCompare } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';

type SalesContract = {
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
};

type WarpingRun = {
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

type WarpingBeam = {
  id: number;
  warping_run_id: number;
  kp: string;
  position: number;
  beam_number: number;
  putusan: number | null;
  jumlah_ends: number | null;
  panjang_beam: number | null;
};

type IndigoRun = {
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

type WeavingRecord = {
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

type InspectGrayRecord = {
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

type InspectGrayRecordFull = {
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

type BBSFWashingRun = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  mc: string | null;
  speed: string | null;
  lebar_awal: string | null;
  permasalahan: string | null;
};

type BBSFSanforRun = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  sanfor_type: string | null;
  speed: string | null;
  susut: number | null;
  permasalahan: string | null;
};

// API response shape from /api/denim/admin/pipeline/:kp
type PipelineApiResponse = {
  salesContract: SalesContract | null;
  warping_run: WarpingRun | null;
  indigo_run: IndigoRun | null;
  weaving_records: WeavingRecord[];
  inspectGray?: InspectGrayRecordFull[];
  bbsfWashing?: BBSFWashingRun[];
  bbsfSanfor?: BBSFSanforRun[];
  inspectFinish?: InspectFinishRecord[];
};

type BBSFRecord = {
  id: number;
  kp: string;
  tgl: string;
  // Washing
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
  // Sanfor 1
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
  // Sanfor 2
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

type InspectFinishRecord = {
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
  // Defects
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
  // Quality flags
  noda: string | null;
  kotor: string | null;
  bkrt: string | null;
  ket: string | null;
};

// Internal shape used throughout the component
type PipelineData = {
  sc: SalesContract | null;
  warping: WarpingRun | null;
  indigo: IndigoRun | null;
  weaving: WeavingRecord[];
  inspectGray: InspectGrayRecordFull[];
  bbsfWashing: BBSFWashingRun[];
  bbsfSanfor: BBSFSanforRun[];
  inspectFinish: InspectFinishRecord[];
};

// Determine pipeline stages based on actual data presence, not just approval status
function getPipelineStages(data: PipelineData) {
  const hasApproval = !!data.sc;
  const hasWarping = !!data.warping;
  const hasIndigo = !!data.indigo;
  const hasWeaving = data.weaving && data.weaving.length > 0;
  const hasInspect = data.inspectGray && data.inspectGray.length > 0;
  const hasBBSF = (data.bbsfWashing && data.bbsfWashing.length > 0) || (data.bbsfSanfor && data.bbsfSanfor.length > 0);
  const hasInspectFinish = data.inspectFinish && data.inspectFinish.length > 0;
  const isComplete = hasInspectFinish;

  return {
    approval: hasApproval,
    warping: hasWarping,
    indigo: hasIndigo,
    weaving: hasWeaving,
    inspect: hasInspect,
    bbsf: hasBBSF,
    inspectFinish: hasInspectFinish,
    complete: isComplete,
  };
}

const STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Approval' },
  { key: 'WARPING', label: 'Warping' },
  { key: 'INDIGO', label: 'Indigo' },
  { key: 'WEAVING', label: 'Weaving' },
  { key: 'INSPECT_GRAY', label: 'Inspect Gray' },
  { key: 'BBSF', label: 'BBSF' },
  { key: 'INSPECT_FINISH', label: 'Inspect Finish' },
  { key: 'COMPLETE', label: 'Complete' },
];

function PipelineProgressBar({ pipelineData }: { pipelineData: PipelineData }) {
  const stages = getPipelineStages(pipelineData);
  
  // Determine the current stage based on what has data
  // Priority: complete > inspectFinish > bbsf > inspect > weaving > indigo > warping > approval
  let currentStage = 'PENDING_APPROVAL';
  if (stages.complete) {
    currentStage = 'COMPLETE';
  } else if (stages.inspectFinish) {
    currentStage = 'INSPECT_FINISH';
  } else if (stages.bbsf) {
    currentStage = 'BBSF';
  } else if (stages.inspect) {
    currentStage = 'INSPECT_GRAY';
  } else if (stages.weaving) {
    currentStage = 'WEAVING';
  } else if (stages.indigo) {
    currentStage = 'INDIGO';
  } else if (stages.warping) {
    currentStage = 'WARPING';
  } else if (stages.approval) {
    currentStage = 'PENDING_APPROVAL';
  }

  const currentIdx = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div
      className="rounded-[32px] p-6 mb-6"
      style={{
        background: '#E0E5EC',
        boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-center justify-between">
        {STAGES.map((stage, idx) => {
          // Determine stage completion based on actual data presence
          let isComplete = false;
          if (stage.key === 'PENDING_APPROVAL') isComplete = stages.approval;
          else if (stage.key === 'WARPING') isComplete = stages.warping;
          else if (stage.key === 'INDIGO') isComplete = stages.indigo;
          else if (stage.key === 'WEAVING') isComplete = stages.weaving;
          else if (stage.key === 'INSPECT_GRAY') isComplete = stages.inspect;
          else if (stage.key === 'BBSF') isComplete = stages.bbsf;
          else if (stage.key === 'INSPECT_FINISH') isComplete = stages.inspectFinish;
          else if (stage.key === 'COMPLETE') isComplete = stages.complete;

          const isCurrent = idx === currentIdx;

          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isComplete && !isCurrent ? '#16A34A' : isCurrent ? '#6C63FF' : '#E0E5EC',
                    color: isComplete && !isCurrent ? '#fff' : isCurrent ? '#fff' : '#9CA3AF',
                    boxShadow: isComplete && !isCurrent 
                      ? '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)'
                      : isCurrent
                        ? 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)'
                        : '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  }}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span
                  className="text-xs mt-2 font-medium"
                  style={{
                    color: isComplete && !isCurrent ? '#16A34A' : isCurrent ? '#6C63FF' : '#9CA3AF',
                  }}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className="w-16 md:w-24 h-0.5 mx-2"
                  style={{
                    background: isComplete && !isCurrent ? 'rgb(22 163 74 / 0.3)' : 'rgb(163 177 198 / 0.3)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionIcon({ hasData }: { hasData: boolean }) {
  return hasData ? (
    <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} />
  ) : (
    <Circle className="w-5 h-5" style={{ color: '#9CA3AF' }} />
  );
}

function SectionCard({
  title,
  icon,
  children,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div
      className="rounded-[32px] overflow-hidden"
      style={{
        background: '#E0E5EC',
        boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: '#E0E5EC',
          borderBottom: '1px solid rgb(163 177 198 / 0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold" style={{ color: '#3D4852' }}>{title}</h3>
        </div>
        {onEdit && (
          <Button
            size="sm"
            onClick={onEdit}
            className="h-7 text-xs"
            style={{
              background: '#E0E5EC',
              borderRadius: '16px',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
              color: '#6B7280',
            }}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy HH:mm'); }
  catch { return '—'; }
};

export default function OrderDetailPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIndigoFormula, setShowIndigoFormula] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('erp_token');
        const hasToken = !!token;
        
        const result = await authFetch(
          `/denim/admin/pipeline/${kp}`
        );
        
        if (!result) {
          setError('No data returned from API');
        } else if (!result.sc) {
          setError('Order not found. Result keys: ' + Object.keys(result).join(', '));
        } else {
        // Transform API response to internal shape
        const transformed = {
          sc: result.sc,
          warping: result.warping,
          indigo: result.indigo,
          weaving: result.weaving,
          inspectGray: result.inspectGray || [],
          bbsfWashing: result.bbsfWashing || [],
          bbsfSanfor: result.bbsfSanfor || [],
          inspectFinish: result.inspectFinish || [],
        };
        setData(transformed);
        }
      } catch (e: any) {
        setError('Error: ' + (e.message || e.toString()));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [kp]);

  const handleEdit = () => {
    if (data?.sc) {
      setEditForm({ ...data.sc });
      setEditing(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch(`/denim/sales-contracts/${kp}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      toast.success('Saved successfully');
      setEditing(false);
      // Reload data
      const result = await authFetch(`/denim/admin/pipeline/${kp}`);
      const transformed = {
        sc: result.sc,
        warping: result.warping,
        indigo: result.indigo,
        weaving: result.weaving,
        inspectGray: result.inspectGray || [],
        bbsfWashing: result.bbsfWashing || [],
        bbsfSanfor: result.bbsfSanfor || [],
        inspectFinish: result.inspectFinish || [],
      };
      setData(transformed);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({});
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-8 pb-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 rounded-xl mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.sc) {
    return (
      <div className="px-4 sm:px-8 pb-8">
        <div className="text-center py-16">
          <p className="text-red-500 font-mono text-sm mb-2">ERROR: {error || 'Order not found'}</p>
          <p className="text-zinc-600 text-xs">data exists: {!!data}, keys: {data ? Object.keys(data).join(', ') : 'none'}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Internal shape: sc, warping, indigo, weaving, inspectGray, bbsfWashing, bbsfSanfor, inspectFinish
  const { sc, warping, indigo, weaving, inspectGray = [], bbsfWashing = [], bbsfSanfor = [], inspectFinish = [] } = data;

  return (
    <div>
      <PageHeader
        title={`Order ${kp}`}
        subtitle="Pipeline details"
        backHref="/denim/admin/orders"
        actions={
          editing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/denim/admin/analytics?tab=comparison&kp=${kp}`)}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare KPs
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
            </div>
          )
        }
      />

      <div className="px-4 sm:px-8 pb-8 space-y-6">
        <PipelineProgressBar pipelineData={{ sc, warping, indigo, weaving, inspectGray: data.inspectGray, bbsfWashing: data.bbsfWashing, bbsfSanfor: data.bbsfSanfor, inspectFinish }} />

        {sc?.pipeline_status === 'COMPLETE' &&
          (!warping || !indigo || !weaving?.length) && (
          <div 
            className="mx-8 mb-2 px-4 py-3 rounded-[16px] flex items-start gap-2"
            style={{
              background: '#E0E5EC',
              boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
            }}
          >
            <span className="text-sm mt-0.5" style={{ color: '#D97706' }}>⚠️</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#D97706' }}>Incomplete historical data</p>
              <p className="text-xs mt-0.5" style={{ color: '#D97706', opacity: 0.7 }}>
                This order is marked Complete but some stages were not captured in the historical import:
                {!warping && <span className="font-medium"> Warping</span>}
                {!indigo && <span className="font-medium"> · Indigo</span>}
                {(!weaving || weaving.length === 0) && <span className="font-medium"> · Weaving</span>}
              </p>
            </div>
          </div>
        )}

        {/* Sales Contract Section */}
        <SectionCard
          title="Sales Contract"
          icon={<SectionIcon hasData={!!sc} />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Read-only fields */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>KP</p>
              <p className="text-sm font-mono font-semibold" style={{ color: '#3D4852' }}>{sc.kp}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Status</p>
              <StatusBadge status={sc.pipeline_status || 'DRAFT'} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Type</p>
              <p className="text-sm" style={{ color: '#3D4852' }}>{sc.kat_kode || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>ACC</p>
              <p className="text-sm" style={{ color: '#3D4852' }}>{sc.acc || '—'}</p>
            </div>
            {/* Editable fields */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</p>
              {editing ? (
                <input
                  type="date"
                  value={editForm.tgl ? editForm.tgl.split('T')[0] : ''}
                  onChange={(e) => setEditForm({ ...editForm, tgl: e.target.value })}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    fontSize: '14px',
                    color: '#3D4852',
                    width: '100%',
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: '#3D4852' }}>{formatDate(sc.tgl)}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Construction</p>
              {editing ? (
                <input
                  type="text"
                  value={editForm.codename || ''}
                  onChange={(e) => setEditForm({ ...editForm, codename: e.target.value })}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    fontSize: '14px',
                    color: '#3D4852',
                    width: '100%',
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: '#3D4852' }}>{sc.codename || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Customer</p>
              {editing ? (
                <input
                  type="text"
                  value={editForm.permintaan || ''}
                  onChange={(e) => setEditForm({ ...editForm, permintaan: e.target.value })}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    fontSize: '14px',
                    color: '#3D4852',
                    width: '100%',
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: '#3D4852' }}>{sc.permintaan || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Color</p>
              {editing ? (
                <input
                  type="text"
                  value={editForm.ket_warna || ''}
                  onChange={(e) => setEditForm({ ...editForm, ket_warna: e.target.value })}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    fontSize: '14px',
                    color: '#3D4852',
                    width: '100%',
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: '#3D4852' }}>{sc.ket_warna || '—'}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>TE</p>
              {editing ? (
                <input
                  type="number"
                  value={editForm.te || ''}
                  onChange={(e) => setEditForm({ ...editForm, te: e.target.value ? parseInt(e.target.value) : null })}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    fontSize: '14px',
                    color: '#3D4852',
                    width: '100%',
                  }}
                />
              ) : (
                <p className="text-sm font-mono" style={{ color: '#3D4852' }}>{sc.te?.toLocaleString() || '—'}</p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Warping Section */}
        <SectionCard
          title="Warping"
          icon={<SectionIcon hasData={!!warping} />}
          onEdit={warping ? () => router.push('/denim/inbox/warping/' + kp + '?edit=1') : undefined}
        >
          {warping ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{formatDate(warping.tgl)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Start Time</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.start_time || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Stop Time</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.stop_time || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>RPM</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.rpm || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Meters/Min</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.mtr_min || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Putusan</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.total_putusan?.toLocaleString() || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Machine No</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.no_mc || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Beam</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.total_beam || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Elongasi</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.elongasi || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Strength</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.strength || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>CV%</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.cv_pct || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Tension Badan</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.tension_badan || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Tension Pinggir</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.tension_pinggir || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Lebar Creel</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.lebar_creel || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Jam</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.jam || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Eff Warping</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{warping.eff_warping || '—'}</p>
                </div>
              </div>
              {warping.beams && warping.beams.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Beams</p>
                  <div
                    className="rounded-[16px] overflow-hidden"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow
                          style={{
                            background: '#E0E5EC',
                            borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                          }}
                        >
                          <TableHead
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: '#9CA3AF' }}
                          >#</TableHead>
                          <TableHead
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: '#9CA3AF' }}
                          >Beam No</TableHead>
                          <TableHead
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: '#9CA3AF' }}
                          >Putusan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warping.beams.map((beam, idx) => (
                          <TableRow
                            key={beam.id}
                            style={{
                              background: '#E0E5EC',
                              borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                            }}
                          >
                            <TableCell className="text-xs" style={{ color: '#6B7280' }}>{idx + 1}</TableCell>
                            <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{beam.beam_number}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#3D4852' }}>{beam.putusan?.toLocaleString() || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No warping data yet</p>
          )}
        </SectionCard>

        {/* Indigo Section */}
        <SectionCard
          title="Indigo"
          icon={<SectionIcon hasData={!!indigo} />}
          onEdit={indigo ? () => router.push('/denim/inbox/indigo/' + kp + '?edit=1') : undefined}
        >
          {indigo ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{formatDate(indigo.tgl) || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Machine</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.mc || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Speed (m/min)</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.speed || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Bak Celup</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.bak_celup || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Indigo (g/L)</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.indigo || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Caustic (g/L)</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.caustic || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Hydro (g/L)</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.hydro || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Temp Dryer (°C)</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.temp_dryer || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Moisture Mahlo</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.moisture_mahlo || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Strength</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.strength || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Elongasi</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.elongasi_idg || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>BB</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.bb || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>P</p>
                <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.p || '—'}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgb(163 177 198 / 0.3)', margin: '16px 0' }}></div>
            <button
              onClick={() => setShowIndigoFormula(!showIndigoFormula)}
              className="text-xs underline cursor-pointer"
              style={{ color: '#6C63FF' }}
            >
              {showIndigoFormula ? '▼ Full Formula' : '▶ Full Formula'}
            </button>
            {showIndigoFormula && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Bak Sulfur</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.bak_sulfur || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Konst Indigo</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.konst_idg || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Konst Sulfur</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.konst_sulfur || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Viscosity</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.visc || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Refraktometer</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.ref || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Scoring</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.scoring || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Size Box</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.size_box || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Jetsize</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.jetsize || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Temp Mid Dryer</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.temp_mid_dryer || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Temp Size Box 1</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.temp_size_box_1 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Temp Size Box 2</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.temp_size_box_2 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Size Box 1</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.size_box_1 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Size Box 2</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.size_box_2 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Squeezing Roll 1</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.squeezing_roll_1 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Squeezing Roll 2</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.squeezing_roll_2 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Immersion Roll</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.immersion_roll || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Dryer</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.dryer || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Take Off</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.take_off || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Winding</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.winding || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Press Beam</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.press_beam || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Hardness</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.hardness || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Unwinder</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.unwinder || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Dyeing Tens Wash</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.dyeing_tens_wash || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Dyeing Tens Warna</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.dyeing_tens_warna || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>MC IDG</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.mc_idg || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Tenacity</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.tenacity || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Polisize HS</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.polisize_hs || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Polisize 1/2</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.polisize_1_2 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Armosize</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.armosize || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Solopol</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.solopol || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Serawet</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.serawet || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Primasol</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.primasol || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Cottoclarin</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.cottoclarin || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Setamol</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.setamol || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Granular</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.granular || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Indigo Conc</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.indigo_conc || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Sulfur Bak</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.sulfur_bak || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Sulfur Conc</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.sulfur_conc || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Keterangan</p>
                  <p className="text-sm" style={{ color: '#3D4852' }}>{indigo.keterangan || '—'}</p>
                </div>
              </div>
            )}
            </>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No indigo data yet</p>
          )}
        </SectionCard>

        {/* Weaving Section */}
        <SectionCard
          title="Weaving"
          icon={<SectionIcon hasData={weaving.length > 0} />}
        >
          {weaving.length > 0 ? (
            <>
              {/* Summary Stats */}
              {(() => {
                const totalRecords = weaving.length;
                const efficiencies = weaving.filter(r => r.a_pct != null).map(r => Number(r.a_pct));
                const avgEfficiency = efficiencies.length > 0 
                  ? (efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(1) + '%'
                  : '—';
                const totalMeters = weaving.filter(r => r.meters != null)
                  .reduce((sum, r) => sum + Number(r.meters || 0), 0);
                const dates = weaving.filter(r => r.tanggal != null).map(r => new Date(r.tanggal!));
                const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
                const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
                const formatDateRange = () => {
                  if (!minDate || !maxDate) return '—';
                  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  return minDate.getFullYear() === maxDate.getFullYear()
                    ? `${fmt(minDate)} – ${fmt(maxDate)} ${maxDate.getFullYear()}`
                    : `${fmt(minDate)} ${minDate.getFullYear()} – ${fmt(maxDate)} ${maxDate.getFullYear()}`;
                };

                // Machine breakdown
                const machineStats: Record<string, { count: number; effs: number[] }> = {};
                weaving.forEach(r => {
                  if (r.machine) {
                    if (!machineStats[r.machine]) machineStats[r.machine] = { count: 0, effs: [] };
                    machineStats[r.machine].count++;
                    if (r.a_pct != null) machineStats[r.machine].effs.push(Number(r.a_pct));
                  }
                });
                const machineBreakdown = Object.entries(machineStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([machine, stats]) => ({
                    machine,
                    count: stats.count,
                    avg: stats.effs.length > 0 
                      ? (stats.effs.reduce((a, b) => a + b, 0) / stats.effs.length).toFixed(1) 
                      : null
                  }));

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div
                        className="rounded-[16px] px-3 py-2"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Records</p>
                        <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>{totalRecords}</p>
                      </div>
                      <div
                        className="rounded-[16px] px-3 py-2"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Efficiency</p>
                        <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>{avgEfficiency}</p>
                      </div>
                      <div
                        className="rounded-[16px] px-3 py-2"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Meters</p>
                        <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>{totalMeters.toLocaleString()}</p>
                      </div>
                      <div
                        className="rounded-[16px] px-3 py-2"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Period</p>
                        <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>{formatDateRange()}</p>
                      </div>
                    </div>
                    {machineBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs" style={{ color: '#6B7280' }}>
                        {machineBreakdown.map(m => (
                          <span key={m.machine}>
                            {m.machine} · {m.count} shifts · Avg {m.avg ? m.avg + '%' : '—'}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
              <div
                className="rounded-[16px] overflow-hidden"
                style={{
                  background: '#E0E5EC',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                }}
              >
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                    }}
                  >
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Date</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Shift</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Machine</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Beam</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Picks</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Meters</TableHead>
                    <TableHead
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9CA3AF' }}
                    >Efficiency %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weaving.slice(0, 50).map((record) => (
                    <TableRow
                      key={record.id}
                      style={{
                        background: '#E0E5EC',
                        borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                      }}
                    >
                      <TableCell className="text-sm" style={{ color: '#6B7280' }}>{formatDate(record.tanggal)}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.shift || '—'}</TableCell>
                      <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{record.machine || '—'}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.beam || '—'}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.kpicks?.toLocaleString() || '—'}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.meters?.toLocaleString() || '—'}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.a_pct != null ? Number(record.a_pct).toFixed(1) + '%' : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No weaving data yet</p>
          )}
        </SectionCard>

        {/* Inspect Gray Section */}
        <SectionCard
          title="Inspect Gray"
          icon={<SectionIcon hasData={inspectGray.length > 0} />}
          onEdit={inspectGray.length > 0 ? () => router.push('/denim/inbox/inspect-gray/' + kp + '?edit=1') : undefined}
        >
          {inspectGray.length > 0 ? (
            <div className="space-y-4">
              {/* Summary stats */}
              {(() => {
                const totalRolls = inspectGray.length;
                const gradeBreakdown = inspectGray.reduce((acc, r) => {
                  const g = r.gd || 'Unknown';
                  acc[g] = (acc[g] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const widths = inspectGray.filter(r => r.w != null).map(r => parseFloat(r.w!));
                const avgWidth = widths.length > 0 
                  ? (widths.reduce((a, b) => a + b, 0) / widths.length).toFixed(1)
                  : null;
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Rolls</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{totalRolls}</p>
                      </div>
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Width</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{avgWidth ? avgWidth + '″' : '—'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1]).map(([grade, count]) => {
                        const colors: Record<string, string> = {
                          A: '#16A34A',
                          B: '#D97706',
                          C: '#EA580C',
                          R: '#DC2626',
                        };
                        return (
                          <span
                            key={grade}
                            className="px-2 py-1 rounded-[9999px] text-xs font-bold"
                            style={{
                              background: '#E0E5EC',
                              color: colors[grade] || '#6B7280',
                              boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                            }}
                          >
                            {grade}: {count}
                          </span>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Rolls table */}
              <div
                className="rounded-[16px] overflow-hidden"
                style={{
                  background: '#E0E5EC',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        background: '#E0E5EC',
                        borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                      }}
                    >
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Machine</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Beam</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Grade</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Width</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>BMC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspectGray.map((record) => (
                      <TableRow
                        key={record.id}
                        style={{
                          background: '#E0E5EC',
                          borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                        }}
                      >
                        <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.tg ? new Date(record.tg).toLocaleDateString('en-GB') : '—'}</TableCell>
                        <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{record.mc || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.bm ?? '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.gd || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.w || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>
                          {record.bmc != null ? (
                            record.bmc > 50 ? (
                              <span className="inline-flex items-center gap-1" style={{ color: '#D97706' }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: '#D97706' }}></span>
                                {record.bmc}
                              </span>
                            ) : (
                              record.bmc
                            )
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No inspect gray data yet</p>
          )}
        </SectionCard>

        {/* BBSF Section */}
        <SectionCard
          title="BBSF (Washing & Sanfor)"
          icon={<SectionIcon hasData={(bbsfWashing.length > 0) || (bbsfSanfor.length > 0)} />}
          onEdit={(bbsfWashing.length > 0 || bbsfSanfor.length > 0) ? () => router.push('/denim/inbox/bbsf/' + kp + '?edit=1') : undefined}
        >
          {(bbsfWashing.length > 0) || (bbsfSanfor.length > 0) ? (
            <div className="space-y-6">
              {/* Washing Section */}
              {bbsfWashing.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>Washing</h4>
                  <div
                    className="rounded-[16px] overflow-hidden"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow
                          style={{
                            background: '#E0E5EC',
                            borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                          }}
                        >
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Date</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Shift</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Machine</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Speed</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Lebar Awal</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Permasalahan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bbsfWashing.map((record) => (
                          <TableRow
                            key={record.id}
                            style={{
                              background: '#E0E5EC',
                              borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                            }}
                          >
                            <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.tgl ? new Date(record.tgl).toLocaleDateString('en-GB') : '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.shift || '—'}</TableCell>
                            <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{record.mc || '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.speed || '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.lebar_awal || '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#D97706' }}>{record.permasalahan || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Sanfor Section */}
              {bbsfSanfor.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>Sanfor</h4>
                  <div
                    className="rounded-[16px] overflow-hidden"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow
                          style={{
                            background: '#E0E5EC',
                            borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                          }}
                        >
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Date</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Shift</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Type</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Speed</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Susut %</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Permasalahan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bbsfSanfor.map((record) => (
                          <TableRow
                            key={record.id}
                            style={{
                              background: '#E0E5EC',
                              borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                            }}
                          >
                            <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.tgl ? new Date(record.tgl).toLocaleDateString('en-GB') : '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.shift || '—'}</TableCell>
                            <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{record.sanfor_type || '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.speed || '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.susut != null ? record.susut + '%' : '—'}</TableCell>
                            <TableCell className="text-sm" style={{ color: '#D97706' }}>{record.permasalahan || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No BBSF data</p>
          )}
        </SectionCard>

        {/* Inspect Finish Section */}
        <SectionCard
          title="Inspect Finish"
          icon={<SectionIcon hasData={inspectFinish.length > 0} />}
          onEdit={inspectFinish.length > 0 ? () => router.push('/denim/inbox/inspect-finish/' + kp + '?edit=1') : undefined}
        >
          {inspectFinish.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              {(() => {
                const totalRolls = inspectFinish.length;
                const gradeBreakdown = inspectFinish.reduce((acc, r) => {
                  const g = r.grade || 'Unknown';
                  acc[g] = (acc[g] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const lebarArr = inspectFinish.filter(r => r.lebar != null).map(r => r.lebar!);
                const avgLebar = lebarArr.length > 0 
                  ? (lebarArr.reduce((a, b) => a + b, 0) / lebarArr.length).toFixed(1)
                  : null;
                const kgArr = inspectFinish.filter(r => r.kg != null).map(r => r.kg!);
                const avgKg = kgArr.length > 0
                  ? (kgArr.reduce((a, b) => a + b, 0) / kgArr.length).toFixed(1)
                  : null;
                const susutArr = inspectFinish.filter(r => r.susut_lusi != null).map(r => r.susut_lusi!);
                const avgSusut = susutArr.length > 0
                  ? (susutArr.reduce((a, b) => a + b, 0) / susutArr.length).toFixed(1)
                  : null;
                const pointArr = inspectFinish.filter(r => r.point != null).map(r => r.point!);
                const avgPoint = pointArr.length > 0
                  ? (pointArr.reduce((a, b) => a + b, 0) / pointArr.length).toFixed(2)
                  : null;
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-4">
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Rolls</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{totalRolls}</p>
                      </div>
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Lebar</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{avgLebar ? avgLebar + ' cm' : '—'}</p>
                      </div>
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg KG</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{avgKg || '—'}</p>
                      </div>
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Susut</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{avgSusut ? avgSusut + '%' : '—'}</p>
                      </div>
                      <div
                        className="rounded-[16px] p-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Point</p>
                        <p className="text-xl font-semibold" style={{ color: '#3D4852' }}>{avgPoint || '—'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1]).map(([grade, count]) => {
                        const colors: Record<string, string> = {
                          A: '#16A34A',
                          B: '#D97706',
                          C: '#EA580C',
                          R: '#DC2626',
                        };
                        return (
                          <span
                            key={grade}
                            className="px-2 py-1 rounded-[9999px] text-xs font-bold"
                            style={{
                              background: '#E0E5EC',
                              color: colors[grade] || '#6B7280',
                              boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                            }}
                          >
                            {grade}: {count}
                          </span>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Rolls table */}
              <div
                className="rounded-[16px] overflow-hidden"
                style={{
                  background: '#E0E5EC',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        background: '#E0E5EC',
                        borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                      }}
                    >
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>SN</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Shift</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Operator</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Lebar</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>KG</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Susut</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Grade</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Point</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspectFinish.slice(0, 50).map((record) => (
                      <TableRow
                        key={record.id}
                        style={{
                          background: '#E0E5EC',
                          borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                        }}
                      >
                        <TableCell className="text-sm font-mono" style={{ color: '#3D4852' }}>{record.sn || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.shift || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#6B7280' }}>{record.operator || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.lebar?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.kg?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.susut_lusi != null ? record.susut_lusi + '%' : '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>{record.grade || '—'}</TableCell>
                        <TableCell className="text-sm" style={{ color: '#3D4852' }}>
                          {record.point != null ? (
                            record.point > 4.0 ? (
                              <span className="inline-flex items-center gap-1" style={{ color: '#DC2626' }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: '#DC2626' }}></span>
                                {record.point}
                              </span>
                            ) : record.point > 2.0 ? (
                              <span className="inline-flex items-center gap-1" style={{ color: '#D97706' }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: '#D97706' }}></span>
                                {record.point}
                              </span>
                            ) : (
                              record.point
                            )
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No inspect finish data yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

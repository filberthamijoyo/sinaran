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
import { ArrowLeft, Check, Circle, CheckCircle2, GitCompare, Download, ChevronDown } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import RollTraceDrawer from './RollTraceDrawer';
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
  ne_lusi: string | number | null;
  ne_pakan: string | number | null;
  sisir: string | null;
  pick: string | number | null;
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
  sn_full: string | null;
  gd: string | null;
  w: string | null;
  bmc: number | null;
  bme: number | null;
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

export type InspectFinishRecord = {
  id: number;
  kp: string;
  tgl: string;
  shift: string | null;
  operator: string | null;
  no_roll: number | null;
  sn: string | null;
  sn_machine: string | null;
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
  const [selectedSN, setSelectedSN] = useState<string | null>(null);
  const [finishSnFilter, setFinishSnFilter] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.export-dropdown-root')) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
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
          <p className="font-mono text-sm mb-2" style={{ color: '#DC2626' }}>ERROR: {error || 'Order not found'}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>data exists: {!!data}, keys: {data ? Object.keys(data).join(', ') : 'none'}</p>
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

  const exportPDF = async () => {
    setExportOpen(false);
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text(`Production Report — ${kp}`, 15, 20);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 28);
    doc.line(15, 32, 195, 32);

    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Sales Contract', 15, 40);
    autoTable(doc, {
      startY: 44, margin: { left: 15, right: 15 },
      head: [['Field', 'Value']],
      body: [
        ['KP', sc?.kp || '—'],
        ['Codename', sc?.codename || '—'],
        ['Customer', sc?.permintaan || '—'],
        ['Date', sc?.tgl ? new Date(sc.tgl).toLocaleDateString() : '—'],
        ['Type', sc?.kat_kode || '—'],
        ['TE', sc?.te?.toString() || '—'],
        ['Color', sc?.ket_warna || '—'],
        ['Status', sc?.pipeline_status || '—'],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 40] },
      alternateRowStyles: { fillColor: [245, 245, 248] },
    });

    if (warping) {
      const y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Warping', 15, y);
      autoTable(doc, {
        startY: y + 4, margin: { left: 15, right: 15 },
        head: [['Field', 'Value']],
        body: [
          ['Date', warping.tgl ? new Date(warping.tgl).toLocaleDateString() : '—'],
          ['Machine No', warping.no_mc?.toString() || '—'],
          ['RPM', warping.rpm?.toString() || '—'],
          ['Total Beam', warping.total_beam?.toString() || '—'],
          ['Elongasi', warping.elongasi?.toString() || '—'],
          ['Strength', warping.strength?.toString() || '—'],
          ['CV%', warping.cv_pct?.toString() || '—'],
          ['Eff Warping', warping.eff_warping?.toString() || '—'],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 30, 40] },
      });
    }

    if (indigo) {
      const y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Indigo', 15, y);
      autoTable(doc, {
        startY: y + 4, margin: { left: 15, right: 15 },
        head: [['Field', 'Value']],
        body: [
          ['Date', indigo.tanggal ? new Date(indigo.tanggal).toLocaleDateString() : '—'],
          ['Machine', indigo.mc?.toString() || '—'],
          ['Speed', indigo.speed?.toString() || '—'],
          ['Indigo g/L', indigo.indigo?.toString() || '—'],
          ['Caustic g/L', indigo.caustic?.toString() || '—'],
          ['Hydro g/L', indigo.hydro?.toString() || '—'],
          ['BB', indigo.bb?.toString() || '—'],
          ['Strength', indigo.strength?.toString() || '—'],
          ['Elongasi', indigo.elongasi_idg?.toString() || '—'],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 30, 40] },
      });
    }

    if (weaving.length > 0) {
      const y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Weaving Summary', 15, y);
      const machines = [...new Set(weaving.map(r => r.machine))];
      const machineRows = machines.map(m => {
        const recs = weaving.filter(r => r.machine === m);
        const avgEffRaw = recs.filter(r => r.a_pct != null && Number(r.a_pct) !== 0);
        const avgEff = avgEffRaw.length > 0
          ? avgEffRaw.reduce((s, r) => s + parseFloat(String(r.a_pct)), 0) / avgEffRaw.length
          : NaN;
        const totalM = recs.reduce((s, r) => s + parseFloat(String(r.meters || 0)), 0);
        return [m, recs.length.toString(), isNaN(avgEff) ? '—' : avgEff.toFixed(1) + '%', totalM.toFixed(0) + 'm'];
      });
      autoTable(doc, {
        startY: y + 4, margin: { left: 15, right: 15 },
        head: [['Machine', 'Shifts', 'Avg Efficiency', 'Total Meters']],
        body: machineRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 30, 40] },
      });
    }

    if (inspectFinish.length > 0) {
      const y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Inspect Finish Summary', 15, y);
      const avgPoint = inspectFinish.filter(r => r.point).reduce((s, r) => s + parseFloat(String(r.point)), 0) / inspectFinish.filter(r => r.point).length;
      const totalKg = inspectFinish.reduce((s, r) => s + parseFloat(String(r.kg || 0)), 0);
      autoTable(doc, {
        startY: y + 4, margin: { left: 15, right: 15 },
        head: [['SN', 'Shift', 'Lebar', 'KG', 'Susut', 'Grade', 'Point']],
        body: inspectFinish.slice(0, 100).map(r => [
          r.sn || '—', r.shift || '—',
          r.lebar?.toString() || '—', r.kg?.toString() || '—',
          r.susut_lusi ? r.susut_lusi + '%' : '—',
          r.grade || '—',
          parseFloat(String(r.point || 0)).toFixed(2),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 40] },
        foot: [['', '', '', totalKg.toFixed(1) + ' kg total', '', '', isNaN(avgPoint) ? '—' : 'Avg: ' + avgPoint.toFixed(2)]],
      });
    }

    doc.save(`${kp}_production_report.pdf`);
  };

  const exportExcel = async () => {
    setExportOpen(false);
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Field', 'Value'],
      ['KP', sc?.kp], ['Codename', sc?.codename], ['Customer', sc?.permintaan],
      ['Date', sc?.tgl ? new Date(sc.tgl).toLocaleDateString() : ''],
      ['Type', sc?.kat_kode], ['TE', sc?.te], ['Color', sc?.ket_warna],
      ['Ne Lusi', sc?.ne_lusi], ['Ne Pakan', sc?.ne_pakan], ['Sisir', sc?.sisir],
      ['Pick', sc?.pick], ['Status', sc?.pipeline_status],
    ]), 'Sales Contract');

    if (warping) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Field', 'Value'],
      ['Date', warping.tgl], ['Machine', warping.no_mc], ['RPM', warping.rpm],
      ['Total Beam', warping.total_beam], ['Elongasi', warping.elongasi],
      ['Strength', warping.strength], ['CV%', warping.cv_pct],
      ['Tension Badan', warping.tension_badan], ['Tension Pinggir', warping.tension_pinggir],
      ['Lebar Creel', warping.lebar_creel], ['Eff Warping', warping.eff_warping],
    ]), 'Warping');

    if (indigo) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([indigo]), 'Indigo');

    if (weaving.length) XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(weaving.map(r => ({
        Date: r.tanggal, Shift: r.shift, Machine: r.machine,
        Efficiency: r.a_pct, Meters: r.meters, KPicks: r.kpicks,
      }))), 'Weaving');

    if (inspectGray.length) XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(inspectGray.map(r => ({
        Date: r.tg, Machine: r.mc, Beam: r.bm, SN: r.sn_full,
        Grade: r.gd, Width: r.w, BME: r.bme, BMC: r.bmc,
      }))), 'Inspect Gray');

    if (bbsfWashing.length) XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(bbsfWashing), 'BBSF Washing');

    if (bbsfSanfor.length) XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(bbsfSanfor), 'BBSF Sanfor');

    if (inspectFinish.length) XLSX.utils.book_append_sheet(wb,
      XLSX.utils.json_to_sheet(inspectFinish.map(r => ({
        SN: r.sn, Date: r.tgl, Shift: r.shift, Operator: r.operator,
        Lebar: r.lebar, KG: r.kg, SusutLusi: r.susut_lusi,
        Grade: r.grade, Point: r.point,
      }))), 'Inspect Finish');

    XLSX.writeFile(wb, `${kp}_production_report.xlsx`);
  };

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
            <div className="flex gap-2 export-dropdown-root">
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setExportOpen(o => !o)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px]" style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', borderRadius: '16px' }}>
                    <button onClick={exportPDF} className="w-full text-left px-4 py-2.5 text-sm" style={{ color: '#3D4852', borderRadius: '16px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(163 177 198 / 0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >Export PDF</button>
                    <button onClick={exportExcel} className="w-full text-left px-4 py-2.5 text-sm" style={{ color: '#3D4852', borderRadius: '16px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(163 177 198 / 0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      Export Excel
                    </button>
                  </div>
                )}
              </div>
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

      <div className="px-4 py-8 sm:px-8 pb-8 space-y-6">
        <PipelineProgressBar pipelineData={{ sc, warping, indigo, weaving, inspectGray: data.inspectGray, bbsfWashing: data.bbsfWashing, bbsfSanfor: data.bbsfSanfor, inspectFinish }} />

        {sc?.pipeline_status === 'COMPLETE' &&
          (!warping || !indigo          || !weaving?.length) && (
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
                const nonZeroEfficiencies = weaving.filter(r => r.a_pct != null && Number(r.a_pct) !== 0).map(r => Number(r.a_pct));
                const avgEfficiency = nonZeroEfficiencies.length > 0
                  ? (nonZeroEfficiencies.reduce((a, b) => a + b, 0) / nonZeroEfficiencies.length).toFixed(1) + '%'
                  : weaving.some(r => r.a_pct != null) ? '0.0%' : '—';
                const nonZeroRecords = weaving.filter(r => r.meters != null && Number(r.meters) !== 0);
                const totalMeters = nonZeroRecords.reduce((sum, r) => sum + Number(r.meters || 0), 0);
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

                // Group by machine, sort by total meters descending
                const machineGroups: Record<string, typeof weaving> = {};
                weaving.forEach(r => {
                  if (r.machine) {
                    if (!machineGroups[r.machine]) machineGroups[r.machine] = [];
                    machineGroups[r.machine].push(r);
                  }
                });
                const machineCards = Object.entries(machineGroups)
                  .map(([machine, records]) => {
                    const nzRecs = records.filter(r => r.a_pct != null && Number(r.a_pct) !== 0);
                    const allZeroRecs = records.filter(r => r.a_pct != null && Number(r.a_pct) === 0);
                    const effs = nzRecs.map(r => Number(r.a_pct));
                    const avg = effs.length > 0
                      ? effs.reduce((a, b) => a + b, 0) / effs.length
                      : null;
                    const meters = nzRecs.reduce((s, r) => s + Number(r.meters || 0), 0);
                    const recDates = records.filter(r => r.tanggal != null).map(r => new Date(r.tanggal!));
                    const mMin = recDates.length > 0 ? new Date(Math.min(...recDates.map(d => d.getTime()))) : null;
                    const mMax = recDates.length > 0 ? new Date(Math.max(...recDates.map(d => d.getTime()))) : null;
                    const machineDateRange = () => {
                      if (!mMin || !mMax) return '—';
                      const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      return mMin.getFullYear() === mMax.getFullYear()
                        ? `${fmt(mMin)} – ${fmt(mMax)}`
                        : `${fmt(mMin)} – ${fmt(mMax)}`;
                    };
                    return { machine, records, nzRecs, allZeroRecs, avg, meters, machineDateRange };
                  })
                  .sort((a, b) => b.meters - a.meters);

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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
                        <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>{totalMeters > 0 ? totalMeters.toLocaleString() : '—'}</p>
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

                    {avgEfficiency === '0.0%' && (
                      <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                        No production data recorded for these shifts — all efficiency values are zero.
                      </p>
                    )}

                    <div className="space-y-3">
                      {machineCards.map(({ machine, records, nzRecs, allZeroRecs, avg, meters, machineDateRange }) => (
                        <WeavingMachineCard
                          key={machine}
                          machine={machine}
                          records={records}
                          nzRecs={nzRecs}
                          allZeroRecs={allZeroRecs}
                          avg={avg}
                          meters={meters}
                          machineDateRange={machineDateRange}
                        />
                      ))}
                    </div>
                  </>
                );
              })()}
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

              {/* Machine-grouped cards */}
              {(() => {
                const machineGroups: Record<string, InspectGrayRecordFull[]> = {};
                inspectGray.forEach(r => {
                  const key = r.mc || 'Unknown';
                  if (!machineGroups[key]) machineGroups[key] = [];
                  machineGroups[key].push(r);
                });
                const cards = Object.entries(machineGroups)
                  .map(([mc, records]) => {
                    const widths = records.filter(r => r.w != null).map(r => parseFloat(r.w!));
                    const avgWidth = widths.length > 0
                      ? (widths.reduce((a, b) => a + b, 0) / widths.length).toFixed(1)
                      : null;
                    const gradeBreakdown = records.reduce((acc, r) => {
                      const g = r.gd || '—';
                      acc[g] = (acc[g] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const gradeDist = Object.entries(gradeBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([g, c]) => `${g}:${c}`)
                      .join(' ');
                    return { mc, records, count: records.length, avgWidth, gradeDist };
                  })
                  .sort((a, b) => b.count - a.count);

                return (
                  <div className="space-y-3">
                    {cards.map(({ mc, records, count, avgWidth, gradeDist }) => (
                      <MachineCard
                        key={mc}
                        machineName={mc}
                        summary={`${count} rolls · Avg width ${avgWidth ?? '—'}″ · Grades: ${gradeDist}`}
                        defaultOpen={false}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow style={{ background: '#D8DCE3', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                              {['Date', 'Beam', 'Grade', 'Width', 'BME', 'BMC', 'SN'].map(col => (
                                <TableHead key={col} className="text-[10px] font-bold uppercase tracking-widest py-2 px-3" style={{ color: '#9CA3AF' }}>
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map(record => (
                              <TableRow
                                key={record.id}
                                style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.2)' }}
                              >
                                <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                                  {record.tg ? new Date(record.tg).toLocaleDateString('en-GB') : '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3 font-mono" style={{ color: '#3D4852' }}>
                                  {record.bm ?? '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                  {record.gd || '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                  {record.w || '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                  {record.bme ?? '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                  {record.bmc != null ? (
                                    record.bmc > 50 ? (
                                      <span className="inline-flex items-center gap-1" style={{ color: '#D97706' }}>
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D97706' }}></span>
                                        {record.bmc}
                                      </span>
                                    ) : (
                                      record.bmc
                                    )
                                  ) : '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 px-3 font-mono" style={{ color: '#3D4852' }}>
                                  {record.sn_full || '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </MachineCard>
                    ))}
                  </div>
                );
              })()}
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
                  {(() => {
                    const typeGroups: Record<string, BBSFSanforRun[]> = {};
                    bbsfSanfor.forEach(r => {
                      const key = r.sanfor_type || 'Unknown';
                      if (!typeGroups[key]) typeGroups[key] = [];
                      typeGroups[key].push(r);
                    });
                    const cards = Object.entries(typeGroups)
                      .map(([sanfor_type, records]) => {
                        const susutArr = records.filter(r => r.susut != null).map(r => r.susut!);
                        const avgSusut = susutArr.length > 0
                          ? (susutArr.reduce((a, b) => a + b, 0) / susutArr.length)
                          : null;
                        const speeds = records.filter(r => r.speed != null).map(r => parseFloat(r.speed!));
                        const avgSpeed = speeds.length > 0
                          ? (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)
                          : null;
                        const recDates = records.filter(r => r.tgl != null).map(r => new Date(r.tgl!));
                        const dMin = recDates.length > 0 ? new Date(Math.min(...recDates.map(d => d.getTime()))) : null;
                        const dMax = recDates.length > 0 ? new Date(Math.max(...recDates.map(d => d.getTime()))) : null;
                        const dateRange = (() => {
                          if (!dMin || !dMax) return '—';
                          const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                          return dMin.getFullYear() === dMax.getFullYear()
                            ? `${fmt(dMin)} – ${fmt(dMax)}`
                            : `${fmt(dMin)} – ${fmt(dMax)}`;
                        })();
                        return { sanfor_type, records, count: records.length, avgSusut, avgSpeed, dateRange };
                      })
                      .sort((a, b) => b.count - a.count);

                    return (
                      <div className="space-y-3">
                        {cards.map(({ sanfor_type, records, count, avgSusut, avgSpeed, dateRange }) => (
                          <MachineCard
                            key={sanfor_type}
                            machineName={sanfor_type}
                            summary={`${count} runs · Avg susut ${avgSusut != null ? avgSusut.toFixed(1) : '—'}% · Avg speed ${avgSpeed ?? '—'} · ${dateRange}`}
                            defaultOpen={true}
                          >
                            <Table>
                              <TableHeader>
                                <TableRow style={{ background: '#D8DCE3', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                                  {['Date', 'Shift', 'Speed', 'Susut%', 'Damping', 'Press', 'Tension', 'Permasalahan'].map(col => (
                                    <TableHead key={col} className="text-[10px] font-bold uppercase tracking-widest py-2 px-3 whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                                      {col}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {records.map(record => (
                                  <TableRow
                                    key={record.id}
                                    style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.2)' }}
                                  >
                                    <TableCell className="text-xs py-2 px-3 whitespace-nowrap" style={{ color: '#6B7280' }}>
                                      {record.tgl ? new Date(record.tgl).toLocaleDateString('en-GB') : '—'}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                                      {record.shift || '—'}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                      {record.speed || '—'}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                      {record.susut != null ? record.susut + '%' : '—'}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>—</TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>—</TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>—</TableCell>
                                    <TableCell className="text-xs py-2 px-3" style={{ color: '#D97706' }}>
                                      {record.permasalahan || '—'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </MachineCard>
                        ))}
                      </div>
                    );
                  })()}
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
              {/* Filter + search row */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search SN..."
                  value={finishSnFilter}
                  onChange={e => { setFinishSnFilter(e.target.value.toUpperCase()); }}
                  className="h-8 px-3 rounded-lg text-xs font-mono"
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    outline: 'none',
                    color: '#3D4852',
                    boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',
                    width: '160px',
                  }}
                />
              </div>

              {/* Summary bar — all records, always visible */}
              {(() => {
                const filtered = inspectFinish.filter(r => !finishSnFilter || r.sn?.includes(finishSnFilter));
                const totalRolls = filtered.length;
                const gradeBreakdown = filtered.reduce((acc, r) => {
                  const g = r.grade || 'Unknown';
                  acc[g] = (acc[g] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const gradeLabel = Object.entries(gradeBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([g, c]) => `${g}:${c}`)
                  .join(' · ') || '—';
                const pointArr = filtered.filter(r => r.point != null).map(r => r.point!);
                const avgPoint = pointArr.length > 0 ? (pointArr.reduce((a, b) => a + b, 0) / pointArr.length) : null;
                const avgPointStr = avgPoint != null ? avgPoint.toFixed(2) : null;
                const avgPointColor = avgPoint != null && avgPoint > 4 ? '#DC2626' : avgPoint != null && avgPoint > 2 ? '#D97706' : '#3D4852';
                const lebarArr = filtered.filter(r => r.lebar != null).map(r => r.lebar!);
                const avgLebar = lebarArr.length > 0 ? (lebarArr.reduce((a, b) => a + b, 0) / lebarArr.length).toFixed(1) : null;
                const susutArr = filtered.filter(r => r.susut_lusi != null).map(r => r.susut_lusi!);
                const avgSusut = susutArr.length > 0 ? (susutArr.reduce((a, b) => a + b, 0) / susutArr.length).toFixed(1) : null;
                const totalKg = filtered.filter(r => r.kg != null).reduce((a, r) => a + (r.kg || 0), 0);

                return (
                  <div
                    className="rounded-[16px] px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    {[
                      { label: 'Rolls', value: totalRolls },
                      { label: 'Grade', value: gradeLabel },
                      { label: 'Avg Pt', value: avgPointStr ? avgPointStr + ' pt' : '—', color: avgPointStr ? avgPointColor : undefined },
                      { label: 'Avg L', value: avgLebar ? avgLebar + ' cm' : '—' },
                      { label: 'Avg Su', value: avgSusut ? avgSusut + '%' : '—' },
                      { label: 'Total KG', value: totalKg > 0 ? totalKg.toLocaleString() + ' kg' : '—' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-baseline gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{label}</span>
                        <span className="text-sm font-semibold" style={{ color: color || '#3D4852' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Machine-grouped cards */}
              {(() => {
                const searchFiltered = inspectFinish.filter(r => !finishSnFilter || r.sn?.includes(finishSnFilter));

                const machineGroups: Record<string, InspectFinishRecord[]> = {};
                searchFiltered.forEach(r => {
                  const key = r.sn_machine || 'Unknown';
                  if (!machineGroups[key]) machineGroups[key] = [];
                  machineGroups[key].push(r);
                });

                const cards = Object.entries(machineGroups)
                  .map(([sn_machine, records]) => {
                    const pointArr = records.filter(r => r.point != null).map(r => r.point!);
                    const avgPoint = pointArr.length > 0
                      ? (pointArr.reduce((a, b) => a + b, 0) / pointArr.length)
                      : null;
                    const avgPointStr = avgPoint != null ? avgPoint.toFixed(2) : null;
                    const avgPointColor = avgPoint != null && avgPoint > 4 ? '#DC2626' : avgPoint != null && avgPoint > 2 ? '#D97706' : '#3D4852';
                    const lebarArr = records.filter(r => r.lebar != null).map(r => r.lebar!);
                    const avgLebar = lebarArr.length > 0
                      ? (lebarArr.reduce((a, b) => a + b, 0) / lebarArr.length).toFixed(1)
                      : null;
                    const totalKg = records.filter(r => r.kg != null).reduce((a, r) => a + (r.kg || 0), 0);
                    const gradeBreakdown = records.reduce((acc, r) => {
                      const g = r.grade || '—';
                      acc[g] = (acc[g] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const topGrade = Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                    return { sn_machine, records, count: records.length, avgPoint, avgPointStr, avgPointColor, avgLebar, totalKg, topGrade };
                  })
                  .sort((a, b) => (b.avgPoint ?? 0) - (a.avgPoint ?? 0));

                if (cards.length === 0) {
                  return (
                    <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                      No matching records
                    </p>
                  );
                }

                return (
                  <div className="space-y-3">
                    {cards.map(({ sn_machine, records, count, avgPoint, avgPointStr, avgPointColor, avgLebar, totalKg, topGrade }) => (
                      <MachineCard
                        key={sn_machine}
                        machineName={sn_machine}
                        summary={
                          <span style={{ color: avgPointColor }}>
                            {count} rolls · Avg pt {avgPointStr ?? '—'} · Avg {avgLebar ?? '—'}cm · {totalKg > 0 ? totalKg.toLocaleString() + 'kg' : '—'} · Top grade: {topGrade}
                          </span>
                        }
                        defaultOpen={false}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow style={{ background: '#D8DCE3', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                              {['SN', 'Shift', 'Operator', 'Lebar', 'KG', 'Susut', 'Grade', 'Point'].map(col => (
                                <TableHead key={col} className="text-[10px] font-bold uppercase tracking-widest py-2 px-3 whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...records]
                              .sort((a, b) => (b.point ?? 0) - (a.point ?? 0))
                              .map(record => (
                                <TableRow
                                  key={record.id}
                                  onClick={() => setSelectedSN(record.sn)}
                                  className="cursor-pointer"
                                  style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.2)' }}
                                >
                                  <TableCell className="text-xs py-2 px-3 font-mono whitespace-nowrap" style={{ color: '#3D4852' }}>
                                    {record.sn || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                                    {record.shift || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                                    {record.operator || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                    {record.lebar?.toLocaleString() || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                    {record.kg?.toLocaleString() || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                    {record.susut_lusi != null ? record.susut_lusi + '%' : '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                    {record.grade || '—'}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                                    {record.point != null ? (
                                      record.point > 4.0 ? (
                                        <span className="inline-flex items-center gap-1" style={{ color: '#DC2626' }}>
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#DC2626' }}></span>
                                          {record.point}
                                        </span>
                                      ) : record.point > 2.0 ? (
                                        <span className="inline-flex items-center gap-1" style={{ color: '#D97706' }}>
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D97706' }}></span>
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
                      </MachineCard>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No inspect finish data yet</p>
          )}
        </SectionCard>

        {/* Roll Trace Drawer */}
        {selectedSN && data && (
          <RollTraceDrawer
            selectedSN={selectedSN}
            data={data}
            kp={kp}
            onClose={() => setSelectedSN(null)}
          />
        )}
      </div>
    </div>
  );
}

// Reusable collapsible MachineCard — used by Weaving, Inspect Gray, Inspect Finish, BBSF Sanfor
function MachineCard({
  machineName,
  summary,
  children,
  defaultOpen = false,
}: {
  machineName: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: '#E0E5EC',
        borderRadius: '12px',
        boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer bg-[hsl(var(--muted))] rounded-lg hover:bg-white/[0.05] transition-colors"
        style={{ background: 'rgb(38 38 38)', border: 'none' }}
      >
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          <span className="font-mono font-semibold text-zinc-100 text-sm">{machineName}</span>
          <span className="text-xs text-zinc-400 ml-1">{summary}</span>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{
            color: '#9CA3AF',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid rgb(163 177 198 / 0.3)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Collapsible machine card for Weaving section — uses MachineCard layout
function WeavingMachineCard({
  machine,
  records,
  nzRecs,
  allZeroRecs,
  avg,
  meters,
  machineDateRange,
}: {
  machine: string;
  records: WeavingRecord[];
  nzRecs: WeavingRecord[];
  allZeroRecs: WeavingRecord[];
  avg: number | null;
  meters: number;
  machineDateRange: () => string;
}) {
  const effColor = avg === null ? '#9CA3AF' : avg >= 80 ? '#16A34A' : avg >= 70 ? '#D97706' : '#DC2626';
  const effLabel = avg === null ? '—' : avg.toFixed(1) + '%';
  const effBg = avg === null ? 'transparent' : avg >= 80 ? 'rgb(22 163 74 / 0.08)' : avg >= 70 ? 'rgb(217 119 6 / 0.08)' : 'rgb(220 38 38 / 0.08)';

  const sortedNz = [...nzRecs].sort((a, b) => {
    if (!a.tanggal) return 1;
    if (!b.tanggal) return -1;
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
  });

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

  const summary = (
    <>
      {nzRecs.length} of {records.length} shifts · Avg {effLabel} · {meters > 0 ? meters.toLocaleString() + 'm' : '—'} · {machineDateRange()}
    </>
  );

  return (
    <MachineCard machineName={machine} summary={summary} defaultOpen={false}>
      {sortedNz.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#D8DCE3', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                {['Date', 'Shift', 'Efficiency', 'Meters', 'Picks'].map(col => (
                  <TableHead key={col} className="text-[10px] font-bold uppercase tracking-widest py-2 px-3" style={{ color: '#9CA3AF' }}>
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedNz.map(record => {
                const eff = Number(record.a_pct);
                const rowEffColor = eff >= 80 ? '#16A34A' : eff >= 70 ? '#D97706' : '#DC2626';
                return (
                  <TableRow
                    key={record.id}
                    style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.2)' }}
                  >
                    <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                      {record.tanggal ? fmt(new Date(record.tanggal)) : '—'}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3" style={{ color: '#6B7280' }}>
                      {record.shift || '—'}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 font-semibold" style={{ color: rowEffColor }}>
                      {eff.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                      {record.meters?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3" style={{ color: '#3D4852' }}>
                      {record.kpicks?.toLocaleString() || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {allZeroRecs.length > 0 && (
            <p className="text-xs px-4 py-2" style={{ color: '#9CA3AF', borderTop: '1px solid rgb(163 177 198 / 0.2)' }}>
              {allZeroRecs.length} zero-production shift{allZeroRecs.length !== 1 ? 's' : ''} hidden
            </p>
          )}
        </>
      ) : (
        <p className="text-xs px-4 py-3" style={{ color: '#9CA3AF' }}>
          No non-zero records
        </p>
      )}
    </MachineCard>
  );
}


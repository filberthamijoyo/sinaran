'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import KpContextBanner from './KpContextBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Clock, Loader2, Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SCData {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  te: number | null;
}

// Defect type definitions grouped by severity
const DEFECT_CRITICAL = [
  'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly', 'ls', 'lpb', 
  'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na'
];
const DEFECT_MEDIUM = [
  'lm', 'lkc', 'lks', 'ld', 'pts', 'pd', 'lkt', 'pk', 'lp', 'plc', 'j', 'kk', 'bta', 
  'pj', 'rp', 'pb', 'xpd'
];
const DEFECT_LOW = [
  'br', 'pss', 'luper', 'ptn', 'b_bercak', 'r_rusak', 'sl', 'p_timbul', 'b_celup', 
  'p_tumpuk', 'b_bar', 'sml', 'p_slub', 'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
];

const ALL_DEFECTS = [...DEFECT_CRITICAL, ...DEFECT_MEDIUM, ...DEFECT_LOW];

// Display labels for defect codes
const DEFECT_LABELS: Record<string, string> = {
  btl: 'BTL', bts: 'BTS', pp: 'PP', pks: 'PKS', ko: 'KO', db: 'DB', bl: 'BL', 
  ptr: 'PTR', pkt: 'PKT', fly: 'FLY', ls: 'LS', lpb: 'LPB', p_bulu: 'P.BULU', 
  smg: 'SMG', sms: 'SMS', aw: 'AW', pl: 'PL', na: 'NA',
  lm: 'LM', lkc: 'LKC', lks: 'LKS', ld: 'LD', pts: 'PTS', pd: 'PD', lkt: 'LKT', 
  pk: 'PK', lp: 'LP', plc: 'PLC', j: 'J', kk: 'KK', bta: 'BTA', pj: 'PJ', rp: 'RP', 
  pb: 'PB', xpd: 'XPD',
  br: 'BR', pss: 'PSS', luper: 'LUPER', ptn: 'PTN', b_bercak: 'B.BERKAK', 
  r_rusak: 'R.RUSAK', sl: 'SL', p_timbul: 'P.TIMBUL', b_celup: 'B.CELUP', 
  p_tumpuk: 'P.TUMPUK', b_bar: 'B.BAR', sml: 'SML', p_slub: 'P.SLUB', 
  p_belang: 'P.BELANG', crossing: 'CROSSING', x_sambang: 'X.SAMBUNG', 
  p_jelek: 'P.JELEK', lipatan: 'LIPATAN'
};

interface DefectFields {
  [key: string]: string;
}

interface RollRow {
  no_roll: string;
  sn: string;
  tgl_potong: string;
  lebar: string;
  kg: string;
  susut_lusi: string;
  grade: string;
  point: string;
  noda: string;
  kotor: string;
  bkrt: string;
  ket: string;
  defects: DefectFields;
  expanded: boolean;
}

interface InspectFinishFormState {
  shift: string;
  operator: string;
  rolls: RollRow[];
}

const emptyRoll = (): RollRow => ({
  no_roll: '',
  sn: '',
  tgl_potong: '',
  lebar: '',
  kg: '',
  susut_lusi: '',
  grade: '',
  point: '',
  noda: '',
  kotor: '',
  bkrt: '',
  ket: '',
  defects: {},
  expanded: false,
});

const emptyDefects = (): DefectFields => {
  const defects: DefectFields = {};
  ALL_DEFECTS.forEach(d => { defects[d] = ''; });
  return defects;
};

export default function InspectFinishFormPage({ kp, editMode = false }: { kp: string; editMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);

  const [form, setForm] = useState<InspectFinishFormState>({
    shift: '',
    operator: '',
    rolls: [emptyRoll()],
  });

  // Calculate BMC for a single roll
  const calculateBMC = (defects: DefectFields): number => {
    return ALL_DEFECTS.reduce((sum, key) => {
      return sum + (parseInt(defects[key]) || 0);
    }, 0);
  };

  // Auto-calculate summary statistics
  const summary = useMemo(() => {
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    return {
      totalRolls: validRolls.length,
      totalKg: validRolls.reduce((sum, r) => sum + (parseFloat(r.kg) || 0), 0),
      totalBMC: validRolls.reduce((sum, r) => sum + calculateBMC(r.defects), 0),
      gradeACount: validRolls.filter(r => r.grade === 'A').length,
      gradeBCount: validRolls.filter(r => r.grade === 'B').length,
      gradeCCount: validRolls.filter(r => r.grade === 'C').length,
      rejectCount: validRolls.filter(r => r.grade === 'Reject').length,
    };
  }, [form.rolls]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch(`/denim/sales-contracts/${kp}`) as any;
        setSc(data);
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp]);

  // Load existing InspectFinish data when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const loadExisting = async () => {
      try {
        const data = await authFetch(`/denim/admin/pipeline/${kp}`) as any;
        if (data?.inspectFinish && data.inspectFinish.length > 0) {
          const rolls = data.inspectFinish.map((r: any) => ({
            no_roll: r.no_roll?.toString() || '',
            sn: r.sn || '',
            sn_combined: r.sn_combined || '',
            sn_full: r.sn_full || '',
            panjang: r.panjang?.toString() || '',
            lebar: r.lebar?.toString() || '',
            kg: r.kg?.toString() || '',
            grade: r.grade || '',
            point: r.point?.toString() || '',
            susut_lusi: r.susut_lusi?.toString() || '',
            susut_pakan: r.susut_pakan?.toString() || '',
            defects: {},
            expanded: false,
          }));
          setForm(f => ({
            ...f,
            shift: data.inspectFinish[0]?.shift || '',
            operator: data.inspectFinish[0]?.mc || '',
            rolls: rolls.length > 0 ? rolls : [emptyRoll()],
          }));
        }
      } catch (e) {
        console.error('Failed to load existing data:', e);
      } finally {
        setLoadingExisting(false);
      }
    };
    
    loadExisting();
  }, [isEditMode, kp]);

  const setField = (key: keyof InspectFinishFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const setRollField = (index: number, key: keyof RollRow, value: string) => {
    setForm(f => {
      const rolls = [...f.rolls];
      rolls[index] = { ...rolls[index], [key]: value };
      return { ...f, rolls };
    });
  };

  const setDefectField = (rollIndex: number, defectKey: string, value: string) => {
    setForm(f => {
      const rolls = [...f.rolls];
      rolls[rollIndex] = {
        ...rolls[rollIndex],
        defects: {
          ...rolls[rollIndex].defects,
          [defectKey]: value,
        },
      };
      return { ...f, rolls };
    });
  };

  const toggleExpand = (index: number) => {
    setForm(f => {
      const rolls = [...f.rolls];
      rolls[index] = { ...rolls[index], expanded: !rolls[index].expanded };
      return { ...f, rolls };
    });
  };

  const addRoll = () =>
    setForm(f => ({ ...f, rolls: [...f.rolls, emptyRoll()] }));

  const removeRoll = (index: number) =>
    setForm(f => ({
      ...f,
      rolls: f.rolls.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    if (validRolls.length === 0) {
      toast.error('Add at least one roll.');
      return;
    }
    setSubmitting(true);
    try {
      // Build defect fields for API
      const rollsWithDefects = validRolls.map(r => {
        const defectData: Record<string, number> = {};
        ALL_DEFECTS.forEach(d => {
          if (r.defects[d] && parseInt(r.defects[d]) > 0) {
            defectData[d] = parseInt(r.defects[d]);
          }
        });
        return {
          no_roll: parseInt(r.no_roll),
          sn: r.sn || null,
          tgl_potong: r.tgl_potong || null,
          lebar: r.lebar ? parseFloat(r.lebar) : null,
          kg: r.kg ? parseFloat(r.kg) : null,
          susut_lusi: r.susut_lusi ? parseFloat(r.susut_lusi) : null,
          grade: r.grade || null,
          point: r.point ? parseFloat(r.point) : null,
          noda: r.noda || null,
          kotor: r.kotor || null,
          bkrt: r.bkrt || null,
          ket: r.ket || null,
          ...defectData,
          bmc: calculateBMC(r.defects),
        };
      });

      await authFetch('/denim/inspect-finish', {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({
          kp,
          shift: form.shift || null,
          operator: form.operator || null,
          rolls: rollsWithDefects,
        }),
      });
      toast.success(isEditMode ? `Inspection updated for KP ${kp}.` : `Inspection complete for KP ${kp}. Order marked Complete.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/inspect-finish');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save inspection data.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render defect input grid
  const renderDefectInputs = (rollIndex: number, defects: DefectFields) => {
    const renderGroup = (defectsList: string[], severity: string, color: string) => (
      <div className="mb-3">
        <p className={`text-xs font-semibold ${color} mb-2`}>{severity}</p>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {defectsList.map(key => (
            <div key={key} className="space-y-1">
              <Label className="text-[10px] style={{ color: '#9CA3AF' }} block">
                {DEFECT_LABELS[key] || key}
              </Label>
              <Input
                type="number"
                min="0"
                value={defects[key] || ''}
                onChange={e => setDefectField(rollIndex, key, e.target.value)}
                className="h-7 text-xs font-mono"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="rounded-[16px] p-3 mt-2" style={{ background: '#E0E5EC', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)' }}>
        {renderGroup(DEFECT_CRITICAL, 'CRITICAL (Severity 4)', 'text-red-400')}
        {renderGroup(DEFECT_MEDIUM, 'MEDIUM (Severity 2)', 'text-yellow-400')}
        {renderGroup(DEFECT_LOW, 'LOW (Severity 1)', 'text-green-400')}
      </div>
    );
  };

  if (loadingSc) {
    return (
      <div className="px-4 sm:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Inspect Finish — ${kp}`}
        subtitle="Fill in finished fabric inspection data"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="INSPECT_FINISH"
      />

      <form onSubmit={handleSubmit}>
        <div className="px-4 sm:px-8 pb-8 space-y-5">

          {/* Section 1: Inspection Details */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: '#3D4852' }}>
              <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: '#16A34A' }}>1</span>
              Inspection Details
            </h2>
            <p className="text-xs mb-5 flex items-center gap-1" style={{ color: '#6B7280' }}>
              <Clock className="w-3 h-3" />
              Date and time recorded automatically on submit
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Shift</Label>
                <select
                  value={form.shift}
                  onChange={e => setField('shift', e.target.value)}
                  className="w-full h-9 px-2 text-sm rounded-md"
                  style={{
                    background: '#E0E5EC',
                    color: '#3D4852',
                    boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                    border: 'none',
                  }}
                >
                  <option value="">Select...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Operator</Label>
                <Input type="text" value={form.operator}
                  onChange={e => setField('operator', e.target.value)}
                  placeholder="Operator name"
                  className="h-9 text-sm"
                  style={{
                    background: '#E0E5EC',
                    color: '#3D4852',
                    boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                    border: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Roll-by-Roll Inspection */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#3D4852' }}>
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: '#16A34A' }}>2</span>
                Roll-by-Roll Inspection
                <span className="ml-1 text-xs font-normal" style={{ color: '#6B7280' }}>
                  ({form.rolls.length})
                </span>
              </h2>
              <Button type="button" size="sm"
                onClick={addRoll}
                className="h-7 text-xs gap-1"
                style={{
                  background: '#E0E5EC',
                  color: '#3D4852',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              >
                <Plus className="w-3 h-3" /> Add Roll
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-13 gap-2 px-1 text-xs font-medium" style={{ color: '#6B7280' }}>
                <div className="col-span-1">#</div>
                <div className="col-span-1">Roll</div>
                <div className="col-span-1">SN</div>
                <div className="col-span-1">Tgl Potong</div>
                <div className="col-span-1">Width</div>
                <div className="col-span-1">KG</div>
                <div className="col-span-1">Susut</div>
                <div className="col-span-1">Grade</div>
                <div className="col-span-1">Point</div>
                <div className="col-span-1">BMC</div>
                <div className="col-span-1">Defects</div>
                <div className="col-span-1" />
              </div>

              {form.rolls.map((roll, i) => {
                const bmc = calculateBMC(roll.defects);
                const hasDefects = bmc > 0;

                return (
                  <div key={i} className="space-y-2">
                    <div className="grid grid-cols-13 gap-2 items-center">
                      <span className="col-span-1 text-xs style={{ color: '#9CA3AF' }} font-mono text-center">
                        {i + 1}
                      </span>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={roll.no_roll}
                          onChange={e => setRollField(i, 'no_roll', e.target.value)}
                          placeholder="1"
                          className="h-8 text-sm font-mono"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="text"
                          value={roll.sn}
                          onChange={e => setRollField(i, 'sn', e.target.value)}
                          placeholder="SN"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="date"
                          value={roll.tgl_potong}
                          onChange={e => setRollField(i, 'tgl_potong', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={roll.lebar}
                          onChange={e => setRollField(i, 'lebar', e.target.value)}
                          placeholder="cm"
                          className="h-8 text-sm font-mono"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={roll.kg}
                          onChange={e => setRollField(i, 'kg', e.target.value)}
                          placeholder="kg"
                          className="h-8 text-sm font-mono"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={roll.susut_lusi}
                          onChange={e => setRollField(i, 'susut_lusi', e.target.value)}
                          placeholder="%"
                          className="h-8 text-sm font-mono"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <select
                          value={roll.grade}
                          onChange={e => setRollField(i, 'grade', e.target.value)}
                          className="w-full h-8 px-1 text-sm rounded-[16px]"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        >
                          <option value="">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="Reject">Reject</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={roll.point}
                          onChange={e => setRollField(i, 'point', e.target.value)}
                          placeholder="pt"
                          className="h-8 text-sm font-mono"
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            border: 'none',
                          }}
                        />
                      </div>
                      <div className={`col-span-1 flex items-center justify-center font-bold text-sm ${hasDefects ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {hasDefects ? (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {bmc}
                          </span>
                        ) : '-'}
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(i)}
                          className="h-7 px-1 text-xs"
                        >
                          {roll.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {hasDefects ? `${bmc}` : 'Add'}
                        </Button>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {form.rolls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoll(i)}
                            className="style={{ color: '#6B7280' }} hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Defect Detail Section */}
                    {roll.expanded && renderDefectInputs(i, roll.defects)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Summary */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: '#3D4852' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ background: '#16A34A', color: '#fff', fontSize: '10px' }}>3</span>
              Summary
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Total Rolls</p>
                <p className="text-2xl font-bold" style={{ color: '#3D4852' }}>{summary.totalRolls}</p>
              </div>
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Total KG</p>
                <p className="text-2xl font-bold" style={{ color: '#3D4852' }}>{summary.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
              </div>
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#D97706' }}>Total BMC</p>
                <p className="text-2xl font-bold" style={{ color: '#D97706' }}>{summary.totalBMC}</p>
              </div>
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#16A34A' }}>Grade A</p>
                <p className="text-2xl font-bold" style={{ color: '#16A34A' }}>{summary.gradeACount}</p>
              </div>
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#D97706' }}>Grade B</p>
                <p className="text-2xl font-bold" style={{ color: '#D97706' }}>{summary.gradeBCount}</p>
              </div>
              <div className="rounded-[16px] p-4 text-center" style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                <p className="text-xs mb-1" style={{ color: '#DC2626' }}>Reject</p>
                <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{summary.rejectCount}</p>
              </div>
            </div>
          </div>

          {/* Submit row */}
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => router.back()}
              style={{
                background: '#E0E5EC',
                color: '#6B7280',
                boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
              }}
              className="min-w-32"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Complete Order'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

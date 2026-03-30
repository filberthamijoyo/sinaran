'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { BBSFFormState, TabType, emptyForm } from './bbsf/types';
import WashingSection from './bbsf/WashingSection';
import SanforSection from './bbsf/SanforSection';
import type { SCData, PipelineResponse } from './bbsf/types';

type LineNumber = 1 | 2 | 3;

// ── Static data ────────────────────────────────────────────────────────────────
const LINES: {
  line: LineNumber;
  name: string;
  flow: string;
  badge?: string;
}[] = [
  { line: 1, name: 'LINE 1', flow: 'Washing 1 → Sanfor 1 → Sanfor 2' },
  { line: 2, name: 'LINE 2', flow: 'Washing 2 → Sanfor 3 → Sanfor 4' },
  { line: 3, name: 'LINE 3', flow: 'Washing 3 → Sanfor 5 → Inspect Finish', badge: 'No Sanfor 2' },
];

const TAB_LABELS: Record<LineNumber, { id: TabType; label: string }[]> = {
  1: [
    { id: 'washing', label: 'Washing 1' },
    { id: 'sanfor1', label: 'Sanfor 1' },
    { id: 'sanfor2', label: 'Sanfor 2' },
  ],
  2: [
    { id: 'washing', label: 'Washing 2' },
    { id: 'sanfor1', label: 'Sanfor 3' },
    { id: 'sanfor2', label: 'Sanfor 4' },
  ],
  3: [
    { id: 'washing', label: 'Washing 3' },
    { id: 'sanfor1', label: 'Sanfor 5' },
  ],
};

const MACHINE_MAP: Record<LineNumber, Record<TabType, string>> = {
  1: { washing: 'Washing 1', sanfor1: 'Sanfor 1', sanfor2: 'Sanfor 2' },
  2: { washing: 'Washing 2', sanfor1: 'Sanfor 3', sanfor2: 'Sanfor 4' },
  3: { washing: 'Washing 3', sanfor1: 'Sanfor 5', sanfor2: 'sanfor2' },
};

// ── Validation ────────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<string, string>>;

function validateWashing(form: BBSFFormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.ws_shift) errors.ws_shift = 'This field is required';
  if (!form.ws_speed || Number(form.ws_speed) <= 0) errors.ws_speed = 'Must be greater than 0';
  if (!form.ws_temp_1) errors.ws_temp_1 = 'This field is required';
  return errors;
}

function validateSanfor(tab: 'sanfor1' | 'sanfor2', form: BBSFFormState): FormErrors {
  const errors: FormErrors = {};
  const p = tab === 'sanfor1' ? 'sf1' : 'sf2';
  if (!form[`${p}_shift` as keyof BBSFFormState]?.toString().trim()) {
    errors[`${p}_shift`] = 'This field is required';
  }
  if (!form[`${p}_speed` as keyof BBSFFormState]?.toString().trim() ||
      Number(form[`${p}_speed` as keyof BBSFFormState]) <= 0) {
    errors[`${p}_speed`] = 'Must be greater than 0';
  }
  const hasTemp = form[`${p}_temperatur` as keyof BBSFFormState]?.toString().trim();
  if (!hasTemp) {
    errors[`${p}_temperatur`] = 'Temperature is required';
  }
  return errors;
}

function getFirstErrorRef(errors: FormErrors): string | null {
  const order = [
    'ws_shift', 'ws_speed', 'ws_temp_1',
    'sf1_shift', 'sf1_speed', 'sf1_temperatur',
    'sf2_shift', 'sf2_speed', 'sf2_temperatur',
  ];
  return order.find(k => errors[k]) ?? null;
}

// ── Line Selection Screen ────────────────────────────────────────────────────
function LineSelectionScreen({ onSelect }: { onSelect: (line: LineNumber) => void }) {
  const [selected, setSelected] = useState<LineNumber | null>(null);

  return (
    <div style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F1E2E', marginBottom: 8 }}>
          Select Production Line
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          Choose which BBSF line this order will run through
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {LINES.map(l => {
          const isSelected = selected === l.line;
          return (
            <button
              key={l.line}
              type="button"
              onClick={() => setSelected(l.line)}
              style={{
                border: isSelected ? '2px solid #1D4ED8' : '1px solid #E5E7EB',
                borderRadius: 12,
                padding: 24,
                background: isSelected ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1D4ED8';
                  (e.currentTarget as HTMLElement).style.background = '#F0F5FF';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                  (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                }
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 28, fontWeight: 800, color: '#1D4ED8', marginBottom: 8 }}>
                {l.name}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: l.badge ? 10 : 0, lineHeight: 1.4 }}>
                {l.flow}
              </div>
              {l.badge && (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {l.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => { if (selected) onSelect(selected); }}
        disabled={selected === null}
        style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 15 }}
      >
        Continue →
      </Button>
    </div>
  );
}

// ── Draft Banner ──────────────────────────────────────────────────────────────
function DraftBanner({ savedAt, onRestore, onDiscard }: {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const timeAgo = (() => {
    const diff = Date.now() - savedAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} day ago`;
  })();

  return (
    <div style={{
      margin: '0 32px',
      padding: '10px 16px',
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 13, color: '#1E40AF', flex: 1 }}>
        You have a saved draft from <strong>{timeAgo}</strong>.
      </span>
      <button
        onClick={onRestore}
        style={{
          height: 28, padding: '0 12px', borderRadius: 6,
          background: '#FFFFFF', border: '1px solid #BFDBFE',
          color: '#1D4ED8', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <RotateCcw size={12} />
        Restore
      </button>
      <button
        onClick={onDiscard}
        style={{
          height: 28, padding: '0 12px', borderRadius: 6,
          background: 'transparent', border: '1px solid #E5E7EB',
          color: '#6B7280', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Discard
      </button>
    </div>
  );
}

// ── Per-step confirmation modal ───────────────────────────────────────────────
function ConfirmStepModal({ kp, phase, line, submitting, onConfirm, onCancel }: {
  kp: string;
  phase: TabType;
  line: LineNumber;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mc = MACHINE_MAP[line]?.[phase] ?? '';
  const phaseLabel = phase === 'washing' ? 'Washing' : phase === 'sanfor1' ? 'Sanfor Tahap 1' : 'Sanfor Tahap 2';
  const nextPhase = phase === 'washing' ? 'Sanfor Tahap 1'
    : phase === 'sanfor1' ? 'Sanfor Tahap 2' : 'Inspect Finish';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.50)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '28px 32px',
        width: 480, maxWidth: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F1E2E', marginBottom: 6 }}>
          Confirm {phaseLabel}
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
          KP <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#1D4ED8', fontWeight: 600 }}>{kp}</span>
          {' · '}
          <span style={{ fontWeight: 600, color: '#374151' }}>{mc}</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Line', value: `Line ${line}` },
            { label: 'Machine', value: mc },
            { label: 'After this step →', value: nextPhase },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              height: 36, borderBottom: '1px solid #F3F4F6',
            }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onCancel} disabled={submitting} style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            borderWidth: '1px', borderStyle: 'solid', borderColor: '#E5E7EB',
            background: '#FFFFFF',
            color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={submitting} style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            background: submitting ? '#93C5FD' : '#1D4ED8',
            border: 'none',
            color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {submitting ? 'Saving…' : `Submit ${phaseLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Final confirmation modal (shows ALL data) ─────────────────────────────────
function ConfirmFinalModal({ kp, line, form, submitting, onBack, onConfirm }: {
  kp: string;
  line: LineNumber;
  form: BBSFFormState;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const washingMc = MACHINE_MAP[line]?.washing ?? '';
  const sf1Mc = MACHINE_MAP[line]?.sanfor1 ?? '';
  const sf2Mc = MACHINE_MAP[line]?.sanfor2 ?? '';
  const isLine3 = line === 3;

  const section = (title: string, mc: string, fields: [string, string][]) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: '#EFF6FF', color: '#1D4ED8',
          padding: '1px 8px', borderRadius: 12,
        }}>
          {mc}
        </span>
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '0 12px' }}>
        {fields.map(([label, val]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            height: 32, borderBottom: '1px solid #F3F4F6',
          }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0F1E2E' }}>{val || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.50)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '8vh',
      overflowY: 'auto',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '28px 32px',
        width: 560, maxWidth: '95vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        marginBottom: 80,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F1E2E', marginBottom: 4 }}>
          Confirm BBSF Submission
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
          Line {line} · KP {kp}
        </p>

        {section('Washing', washingMc, [
          ['Shift', form.ws_shift],
          ['Speed', form.ws_speed],
          ['Temp 1 (°C)', form.ws_temp_1],
          ['Temp 2 (°C)', form.ws_temp_2],
          ['Larutan 1', form.ws_larutan_1],
          ['Padder 1', form.ws_padder_1],
          ['Tekanan Boiler', form.ws_tekanan_boiler],
          ['Pelaksana', form.ws_pelaksana],
        ])}

        {section('Sanfor Tahap 1', sf1Mc, [
          ['Shift', form.sf1_shift],
          ['Speed', form.sf1_speed],
          ['Temperature (°C)', form.sf1_temperatur],
          ['Susut (%)', form.sf1_susut],
          ['Pelaksana', form.sf1_pelaksana],
        ])}

        {!isLine3 && section('Sanfor Tahap 2', sf2Mc, [
          ['Shift', form.sf2_shift],
          ['Speed', form.sf2_speed],
          ['Temperature (°C)', form.sf2_temperatur],
          ['Susut (%)', form.sf2_susut],
          ['Pelaksana', form.sf2_pelaksana],
        ])}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onBack} disabled={submitting} style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            borderWidth: '1px', borderStyle: 'solid', borderColor: '#E5E7EB',
            background: '#FFFFFF',
            color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            Back to Edit
          </button>
          <button onClick={onConfirm} disabled={submitting} style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            background: submitting ? '#93C5FD' : '#059669',
            border: 'none',
            color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {submitting ? 'Submitting…' : 'Confirm & Submit to Inspect Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BBSFFormPage({ kp, editMode = false }: { kp: string; editMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';

  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  // Phase completion + saved record IDs
  const [washingDone, setWashingDone] = useState(false);
  const [sanfor1Done, setSanfor1Done] = useState(false);
  const [washingRunId, setWashingRunId] = useState<number | null>(null);
  const [sanfor1RunId, setSanfor1RunId] = useState<number | null>(null);

  // Validation errors per section
  const [washingErrors, setWashingErrors] = useState<FormErrors>({});
  const [sanfor1Errors, setSanfor1Errors] = useState<FormErrors>({});
  const [sanfor2Errors, setSanfor2Errors] = useState<FormErrors>({});

  // Modal states
  const [showStepConfirm, setShowStepConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  // Hovered tab (for done-tab hover effect)
  const [hoveredTabId, setHoveredTabId] = useState<TabType | null>(null);

  // Line & tab
  const [selectedLine, setSelectedLine] = useState<LineNumber | null>(isEditMode ? 1 : null);
  const [activeTab, setActiveTab] = useState<TabType>('washing');

  const [form, setForm] = useState<BBSFFormState>(emptyForm());

  // Refs for scroll-to-error
  const errorRefMap = useRef<Partial<Record<string, HTMLElement>>>({});
  const registerErrorRef = (key: string, el: HTMLElement | null) => {
    if (el) errorRefMap.current[key] = el;
  };

  const draftKey = `draft_bbsf_${kp}`;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearErrors = () => {
    setWashingErrors({});
    setSanfor1Errors({});
    setSanfor2Errors({});
  };

  const scrollToFirstError = (errors: FormErrors) => {
    const key = getFirstErrorRef(errors);
    if (key) {
      const el = errorRefMap.current[key];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.focus(), 300);
      }
    }
  };

  // ── API helpers ──────────────────────────────────────────────────────────────
  // Backend uses 'sanfor_tahap1' / 'sanfor_tahap2'; frontend TabType uses 'sanfor1' / 'sanfor2'
  const toApiPhase = (phase: TabType): string =>
    phase === 'sanfor1' ? 'sanfor_tahap1' : phase === 'sanfor2' ? 'sanfor_tahap2' : phase;

  // POST a single phase — returns { id, nextPhase }
  const submitPhase = async (phase: TabType): Promise<{ id?: number; nextPhase: string }> => {
    const { line: _formLine, ...formFields } = form;
    const result = await authFetch<{ id?: number; nextPhase: string }>('/denim/bbsf', {
      method: 'POST',
      body: JSON.stringify({
        kp,
        tgl: new Date().toISOString(),
        phase: toApiPhase(phase),
        line: selectedLine!,
        ...formFields,
      }),
    });
    return result;
  };

  // PUT a single phase (for updating already-saved phases)
  const updatePhase = async (phase: TabType) => {
    const { line: _formLine, ...formFields } = form;
    await authFetch(`/denim/bbsf/${kp}/${toApiPhase(phase)}`, {
      method: 'PUT',
      body: JSON.stringify({
        kp,
        tgl: new Date().toISOString(),
        line: selectedLine!,
        ...formFields,
      }),
    });
  };

  // PUT all phases (full edit mode)
  const submitAllPhases = async () => {
    const { line: _formLine, ...formFields } = form;
    await authFetch('/denim/bbsf', {
      method: 'PUT',
      body: JSON.stringify({
        kp,
        tgl: new Date().toISOString(),
        line: selectedLine,
        ...formFields,
      }),
    });
  };

  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form, savedAt: Date.now() }));
      setDraftSavedAt(Date.now());
      toast.success('Draft saved', { style: { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' } });
    } catch {
      toast.error('Failed to save draft');
    }
  }, [form, draftKey]);

  const loadDraft = useCallback((): { form: BBSFFormState; savedAt: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { form: BBSFFormState; savedAt: number };
      setDraftSavedAt(parsed.savedAt);
      return parsed;
    } catch { return null; }
  }, [draftKey]);

  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
    setWashingDone(false);
    setSanfor1Done(false);
    setWashingRunId(null);
    setSanfor1RunId(null);
    clearErrors();
    setForm(emptyForm());
    toast.info('Draft discarded');
  }, [draftKey]);

  const detectLineFromMc = (mc: string | null | undefined): LineNumber | null => {
    if (!mc) return null;
    if (/\b1\b/.test(mc)) return 1;
    if (/\b3\b/.test(mc)) return 3;
    if (/\b2\b/.test(mc)) return 2;
    return null;
  };

  // ── Load order data ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch<SCData>(`/denim/sales-contracts/${kp}`);
        setSc(data);
        if (!isEditMode) {
          const draft = loadDraft();
          if (draft) {
            setForm(draft.form);
            if (draft.form.line) setSelectedLine(draft.form.line as LineNumber);
          }
        }
      } catch {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp, isEditMode, loadDraft]);

  // ── Load existing BBSF data (edit mode) ────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const loadExisting = async () => {
      try {
        const data = await authFetch<PipelineResponse>(`/denim/admin/pipeline/${kp}`);
        const line = detectLineFromMc(data?.bbsfWashing?.[0]?.mc)
          ?? detectLineFromMc(data?.bbsfSanfor?.[0]?.mc)
          ?? 1;
        setSelectedLine(line);
        setForm(f => ({ ...f, line }));
        if (data?.bbsfWashing?.[0]) {
          const w = data.bbsfWashing[0];
          setForm(f => ({ ...f,
            ws_shift: w.shift || '',
            ws_speed: w.speed?.toString() || '',
            ws_larutan_1: w.larutan_1?.toString() || '',
            ws_temp_1: w.temp_1?.toString() || '',
            ws_padder_1: w.padder_1?.toString() || '',
            ws_dancing_1: w.dancing_1?.toString() || '',
            ws_larutan_2: w.larutan_2?.toString() || '',
            ws_temp_2: w.temp_2?.toString() || '',
            ws_padder_2: w.padder_2?.toString() || '',
            ws_dancing_2: w.dancing_2?.toString() || '',
            ws_skew: w.skew?.toString() || '',
            ws_tekanan_boiler: w.tekanan_boiler?.toString() || '',
            ws_temp_1_zone: w.temp_1_zone?.toString() || '',
            ws_temp_2_zone: w.temp_2_zone?.toString() || '',
            ws_temp_3_zone: w.temp_3_zone?.toString() || '',
            ws_temp_4_zone: w.temp_4_zone?.toString() || '',
            ws_temp_5_zone: w.temp_5_zone?.toString() || '',
            ws_temp_6_zone: w.temp_6_zone?.toString() || '',
            ws_lebar_awal: w.lebar_awal?.toString() || '',
            ws_panjang_awal: w.panjang_awal?.toString() || '',
            ws_permasalahan: w.permasalahan || '',
            ws_pelaksana: w.pelaksana || '',
          }));
          setWashingRunId(w.id ?? null);
          setWashingDone(true);
        }
        if (data?.bbsfSanfor?.[0]) {
          const s = data.bbsfSanfor[0];
          const isTahap1 = s.sanfor_type === 'tahap1';
          const prefix = isTahap1 ? 'sf1' : 'sf2';
          setForm(f => ({ ...f,
            [`${prefix}_shift`]: s.shift || '',
            [`${prefix}_jam`]: s.jam?.toString() || '',
            [`${prefix}_speed`]: s.speed?.toString() || '',
            [`${prefix}_damping`]: s.damping?.toString() || '',
            [`${prefix}_press`]: s.press?.toString() || '',
            [`${prefix}_tension`]: s.tension?.toString() || '',
            [`${prefix}_tension_limit`]: s.tension_limit?.toString() || '',
            [`${prefix}_temperatur`]: s.temperatur?.toString() || '',
            [`${prefix}_susut`]: s.susut?.toString() || '',
            [`${prefix}_permasalahan`]: s.permasalahan || '',
            [`${prefix}_pelaksana`]: s.pelaksana || '',
          }));
          if (isTahap1) {
            setSanfor1RunId(s.id ?? null);
            setSanfor1Done(true);
          }
        }
      } catch {
        console.error('Failed to load existing data');
      }
    };
    loadExisting();
  }, [isEditMode, kp]);

  const setField = (key: keyof BBSFFormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (washingErrors[key]) setWashingErrors(e => ({ ...e, [key]: undefined }));
    if (sanfor1Errors[key]) setSanfor1Errors(e => ({ ...e, [key]: undefined }));
    if (sanfor2Errors[key]) setSanfor2Errors(e => ({ ...e, [key]: undefined }));
  };

  // ── Footer button click ────────────────────────────────────────────────────
  const handleFooterSubmit = () => {
    clearErrors();

    if (isEditMode) {
      setSubmitting(true);
      submitAllPhases()
        .then(() => {
          toast.success('BBSF updated for KP ' + kp);
          router.push(`/denim/admin/orders/${kp}`);
        })
        .catch(() => toast.error('Failed to save BBSF data.'))
        .finally(() => setSubmitting(false));
      return;
    }

    // ── WASHING ────────────────────────────────────────────────────────────
    if (activeTab === 'washing') {
      const errors = validateWashing(form);
      if (Object.keys(errors).length > 0) {
        setWashingErrors(errors);
        scrollToFirstError(errors);
        return;
      }
      if (washingDone) {
        // Re-submitting — PUT washing only
        setSubmitting(true);
        updatePhase('washing')
          .then(() => toast.success('Washing updated.'))
          .catch(() => toast.error('Failed to update Washing.'))
          .finally(() => setSubmitting(false));
      } else {
        setShowStepConfirm(true);
      }
      return;
    }

    // ── SANFOR 1 ────────────────────────────────────────────────────────────
    if (activeTab === 'sanfor1') {
      const errors = validateSanfor('sanfor1', form);
      if (Object.keys(errors).length > 0) {
        setSanfor1Errors(errors);
        scrollToFirstError(errors);
        return;
      }
      if (selectedLine === 3) {
        // Line 3: sanfor1 IS the final phase → show final modal
        setShowFinalConfirm(true);
      } else {
        // Line 1 or 2: sanfor1 is intermediate
        if (sanfor1Done) {
          // Re-submitting — PUT sanfor1 only
          setSubmitting(true);
          updatePhase('sanfor1')
            .then(() => toast.success('Sanfor 1 updated.'))
            .catch(() => toast.error('Failed to update Sanfor 1.'))
            .finally(() => setSubmitting(false));
        } else {
          setShowStepConfirm(true);
        }
      }
      return;
    }

    // ── SANFOR 2 (lines 1+2 only) ───────────────────────────────────────────
    // activeTab === 'sanfor2'
    const wErrors = validateWashing(form);
    const sf1ErrorsVal = validateSanfor('sanfor1', form);
    const sf2ErrorsVal = validateSanfor('sanfor2', form);
    const allErrors = { ...wErrors, ...sf1ErrorsVal, ...sf2ErrorsVal };
    if (Object.keys(allErrors).length > 0) {
      if (Object.keys(sf2ErrorsVal).length > 0) setSanfor2Errors(sf2ErrorsVal);
      else if (Object.keys(sf1ErrorsVal).length > 0) setSanfor1Errors(sf1ErrorsVal);
      else setWashingErrors(wErrors);
      scrollToFirstError(allErrors);
      return;
    }
    setShowFinalConfirm(true);
  };

  // ── Confirm step (washing / non-final sanfor) ───────────────────────────────
  const handleConfirmStep = async () => {
    setSubmitting(true);
    try {
      const { id, nextPhase: _next } = await submitPhase(activeTab);

      setShowStepConfirm(false);

      if (activeTab === 'washing') {
        setWashingDone(true);
        if (id) setWashingRunId(id);
        clearErrors();
        setActiveTab('sanfor1');
        toast.success('Washing saved. Moving to Sanfor Tahap 1.');

      } else if (activeTab === 'sanfor1') {
        setSanfor1Done(true);
        if (id) setSanfor1RunId(id ?? null);
        clearErrors();
        setActiveTab('sanfor2');
        toast.success('Sanfor Tahap 1 saved. Moving to Sanfor Tahap 2.');
      }
    } catch {
      toast.error('Failed to save BBSF data.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirm final submission ────────────────────────────────────────────────
  const handleConfirmFinal = async () => {
    setSubmitting(true);
    try {
      // Washing and sanfor1 already saved — update them if they have IDs
      await Promise.all([
        washingDone || washingRunId ? updatePhase('washing') : submitPhase('washing'),
        sanfor1Done || sanfor1RunId ? updatePhase('sanfor1') : submitPhase('sanfor1'),
        // sanfor2 is always new at this stage
        submitPhase('sanfor2'),
      ]);

      localStorage.removeItem(draftKey);
      setDraftSavedAt(null);
      clearErrors();
      setShowFinalConfirm(false);
      toast.success('BBSF complete for KP ' + kp + '. Order moved to Inspect Finish.');
      router.push('/denim/inbox/inspect-finish');
    } catch {
      toast.error('Failed to submit BBSF data.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Is a tab locked? ──────────────────────────────────────────────────────
  const isTabLocked = (tab: TabType): boolean => {
    if (isEditMode) return false;
    if (tab === 'washing') return false;
    if (tab === 'sanfor1') return !washingDone;
    if (tab === 'sanfor2') return !sanfor1Done;
    return false;
  };

  // ── Is a tab completed? ─────────────────────────────────────────────────
  const isTabDone = (tab: TabType): boolean => {
    if (tab === 'washing') return washingDone;
    if (tab === 'sanfor1') return sanfor1Done;
    if (tab === 'sanfor2') return true;
    return false;
  };

  // ── Handle tab click ────────────────────────────────────────────────────────
  const handleTabClick = (tabId: TabType) => {
    if (isTabLocked(tabId)) return;
    clearErrors();
    setActiveTab(tabId);
  };

  // ── Restore from draft ─────────────────────────────────────────────────────
  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setForm(draft.form);
      if (draft.form.line) {
        const l = draft.form.line as LineNumber;
        setSelectedLine(l);
        const hasWashing = draft.form.ws_shift || draft.form.ws_speed;
        const hasSanfor1 = draft.form.sf1_shift || draft.form.sf1_speed;
        setWashingDone(!!hasWashing);
        setSanfor1Done(!!hasSanfor1);
      }
      clearErrors();
      toast.success('Draft restored');
    }
  };

  // ── Footer button label ───────────────────────────────────────────────────
  const getFooterLabel = (): string => {
    if (isEditMode) return 'Save Changes';
    if (activeTab === 'washing') {
      return washingDone ? 'Update Washing' : 'Submit Washing →';
    }
    if (activeTab === 'sanfor1') {
      if (selectedLine === 3) {
        return sanfor1Done ? 'Update & Move to Inspect Finish' : 'Submit & Move to Inspect Finish';
      }
      return sanfor1Done ? 'Update Sanfor 1' : 'Submit Sanfor Tahap 1 →';
    }
    // sanfor2
    return 'Submit & Move to Inspect Finish';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loadingSc) {
    return (
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh', padding: 32 }}>
        <Skeleton style={{ height: 32, width: 200, borderRadius: 6 }} />
        <Skeleton style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
        <Skeleton style={{ height: 300, borderRadius: 10, marginTop: 12 }} />
      </div>
    );
  }

  const subtitleParts = [sc?.codename ?? null, sc?.permintaan ?? null].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  if (!isEditMode && selectedLine === null) {
    return (
      <PageShell title="BBSF Form" subtitle={subtitle} noPadding>
        <LineSelectionScreen onSelect={(line) => {
          setSelectedLine(line);
          setForm(f => ({ ...f, line }));
        }} />
      </PageShell>
    );
  }

  const tabs = selectedLine ? TAB_LABELS[selectedLine] : [];

  return (
    <PageShell
      title="BBSF Form"
      subtitle={subtitle}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
      }
      noPadding
    >
      {/* Draft banner */}
      {draftSavedAt && !isEditMode && (
        <DraftBanner
          savedAt={draftSavedAt}
          onRestore={handleRestoreDraft}
          onDiscard={discardDraft}
        />
      )}

      {/* Line badge */}
      {selectedLine && (
        <div style={{
          margin: '0 32px',
          marginTop: 16,
          padding: '8px 16px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: '#1E40AF',
        }}>
          <span style={{ fontWeight: 700 }}>Line {selectedLine}</span>
          <span style={{ color: '#9CA3AF' }}>·</span>
          <span>{LINES.find(l => l.line === selectedLine)?.flow}</span>
          {selectedLine === 3 && (
            <>
              <span style={{ color: '#9CA3AF' }}>·</span>
              <span style={{ padding: '1px 8px', borderRadius: 12, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 600 }}>
                No Sanfor 2
              </span>
            </>
          )}
        </div>
      )}

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '4px',
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          width: 'fit-content',
        }}>
          {tabs.map(tab => {
            const locked = isTabLocked(tab.id);
            const done = isTabDone(tab.id);
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                disabled={locked}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: isActive ? 'none' : done ? '1px solid #A7F3D0' : 'none',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: done && !isActive ? 600 : 500,
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease',
                  background: isActive ? '#1D4ED8'
                    : locked ? 'transparent'
                    : done && isHovered ? '#D1FAE5'
                    : done ? '#ECFDF5'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : locked ? '#D1D5DB' : done ? '#059669' : '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {locked ? '🔒 ' : done ? '✓ Saved ' : ''}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Breadcrumb hint */}
        {washingDone && !isEditMode && (
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
            ← Click any completed tab to edit it
          </p>
        )}

        {/* Tab content */}
        <div>
          {activeTab === 'washing' && (
            <WashingSection
              form={form}
              setField={setField}
              line={selectedLine!}
              errors={washingErrors}
              registerRef={registerErrorRef}
            />
          )}
          {activeTab === 'sanfor1' && (
            <SanforSection
              form={form}
              setField={setField}
              tab="sanfor1"
              line={selectedLine!}
              errors={sanfor1Errors}
              registerRef={registerErrorRef}
            />
          )}
          {activeTab === 'sanfor2' && (
            <SanforSection
              form={form}
              setField={setField}
              tab="sanfor2"
              line={selectedLine!}
              errors={sanfor2Errors}
              registerRef={registerErrorRef}
            />
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        zIndex: 10,
      }}>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        {!isEditMode && (
          <button
            type="button"
            onClick={saveDraft}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8,
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save Draft
          </button>
        )}
        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={submitting}
          onClick={handleFooterSubmit}
        >
          {getFooterLabel()}
        </Button>
      </div>

      {/* Per-step confirmation modal */}
      {showStepConfirm && selectedLine && (
        <ConfirmStepModal
          kp={kp}
          phase={activeTab}
          line={selectedLine}
          submitting={submitting}
          onConfirm={handleConfirmStep}
          onCancel={() => setShowStepConfirm(false)}
        />
      )}

      {/* Final confirmation modal (full data review) */}
      {showFinalConfirm && selectedLine && (
        <ConfirmFinalModal
          kp={kp}
          line={selectedLine}
          form={form}
          submitting={submitting}
          onBack={() => setShowFinalConfirm(false)}
          onConfirm={handleConfirmFinal}
        />
      )}
    </PageShell>
  );
}

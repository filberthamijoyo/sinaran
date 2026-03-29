'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { SectionCard } from '../ui/erp/SectionCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface BeamRow {
  beam_number: string;
  panjang_plan: string;
  panjang_aktual: string;
  jumlah_ends: string;
  putusan: string;
}

interface BeamData {
  beam_number?: number | null;
  panjang_beam?: number | null;
  jumlah_ends?: number | null;
  putusan?: number | null;
}

interface WarpingFormState {
  kode_full: string;
  benang: string;
  lot_lusi: string;
  lot: string;
  sp: string;
  pt: string;
  te: string;
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
  beams: BeamRow[];
  jam: string;
  total_waktu: string;
  eff_warping: string;
  cn_1: string;
  total_putusan: string;
  total_beam: string;
}

const BEAM_COUNT = 15;

const emptyBeam = (): BeamRow => ({
  beam_number: '',
  panjang_plan: '',
  panjang_aktual: '',
  jumlah_ends: '',
  putusan: '',
});

const emptyBeams = (): BeamRow[] =>
  Array.from({ length: BEAM_COUNT }, () => emptyBeam());

const newFormState = (): WarpingFormState => ({
  kode_full: '', benang: '', lot_lusi: '', lot: '', sp: '', pt: '', te: '',
  tgl: new Date().toISOString().split('T')[0],
  start: '', stop: '', rpm: '', mtr_per_min: '',
  no_mc: '', elongasi: '', strength: '', cv_pct: '',
  tension_badan: '', tension_pinggir: '', lebar_creel: '',
  jam: '', total_waktu: '', eff_warping: '', cn_1: '',
  total_putusan: '0', total_beam: '0',
  beams: emptyBeams(),
});

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
};

const FIELD_STYLE: React.CSSProperties = {
  height: 36,
  borderRadius: 8,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#E5E7EB',
  background: '#FFFFFF',
  padding: '0 12px',
  fontSize: 14,
  color: '#0F1E2E',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const READONLY_STYLE: React.CSSProperties = {
  ...FIELD_STYLE,
  background: '#F9FAFB',
  color: '#6B7280',
};

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

function AutoField({ label, value, error }: { label: string; value: string; error?: string }) {
  return (
    <div style={error ? { ...READONLY_STYLE, border: '1px solid #DC2626', borderRadius: 8, padding: '9px 12px' } : undefined}>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={{
        backgroundColor: '#F9FAFB',
        border: error ? 'none' : '1px solid #F3F4F6',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
      }}>
        {value || '—'}
      </div>
      {error && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

// ── Confirm Submit Modal ──────────────────────────────────────────────────────
interface ConfirmModalProps {
  kp: string;
  form: WarpingFormState;
  totalBeams: number;
  totalPutusan: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

function ConfirmSubmitModal({ kp, form, totalBeams, totalPutusan, onConfirm, onCancel, submitting }: ConfirmModalProps) {
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
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F1E2E', marginBottom: 20 }}>
          Confirm Warping Submission
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            {
              label: 'KP Code',
              value: kp,
              mono: true,
            },
            {
              label: 'Construction',
              value: form.kode_full || '—',
            },
            {
              label: 'Date',
              value: form.tgl ? new Date(form.tgl + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            },
            {
              label: 'Machine No',
              value: form.no_mc || '—',
            },
            {
              label: 'Total Beams',
              value: String(totalBeams),
            },
            {
              label: 'Total Putusan',
              value: String(totalPutusan),
            },
            {
              label: 'Lot Lusi',
              value: form.lot_lusi || '—',
            },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              height: 36, borderBottom: '1px solid #F3F4F6',
            }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{row.label}</span>
              <span style={{
                fontSize: 14,
                fontFamily: (row as { mono?: boolean }).mono ? "'IBM Plex Mono', monospace" : 'inherit',
                color: (row as { mono?: boolean }).mono ? '#1D4ED8' : '#0F1E2E',
                fontWeight: (row as { mono?: boolean }).mono ? 600 : 500,
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8,
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8,
              background: submitting ? '#93C5FD' : '#1D4ED8',
              border: 'none',
              color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {submitting ? 'Submitting…' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Draft Banner ──────────────────────────────────────────────────────────────
interface DraftBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

function DraftBanner({ savedAt, onRestore, onDiscard }: DraftBannerProps) {
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function WarpingFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const [sc, setSc] = useState<Record<string, unknown> | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  const draftKey = `draft_warping_${kp}`;

  const [form, setForm] = useState<WarpingFormState>(newFormState());

  // Computed summaries
  const totalPutusan = form.beams.reduce(
    (s, b) => s + (parseInt(b.putusan) || 0), 0
  );
  const totalPanjangPlan = form.beams.reduce(
    (s, b) => s + (parseFloat(b.panjang_plan) || 0), 0
  );
  const totalPanjangAktual = form.beams.reduce(
    (s, b) => s + (parseFloat(b.panjang_aktual) || 0), 0
  );
  const totalJumlahEnds = form.beams.reduce(
    (s, b) => s + (parseInt(b.jumlah_ends) || 0), 0
  );
  const totalBeams = form.beams.filter(b => b.beam_number.trim()).length;

  // Draft helpers
  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    const draft = { form, savedAt: Date.now() };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setDraftSavedAt(Date.now());
      toast.success('Draft saved', { style: { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' } });
    } catch {
      toast.error('Failed to save draft');
    }
  }, [form, draftKey]);

  const loadDraft = useCallback((): WarpingFormState | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { form: WarpingFormState; savedAt: number };
      setDraftSavedAt(parsed.savedAt);
      return parsed.form;
    } catch { return null; }
  }, [draftKey]);

  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
    setForm(newFormState());
    toast.info('Draft discarded');
  }, [draftKey]);

  // Auto-calculate jam (hours) and total_waktu (minutes) from start/stop
  const calcJam = (() => {
    if (!form.start || !form.stop) return 0;
    const [sh, sm] = form.start.split(':').map(Number);
    const [eh, em] = form.stop.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin <= startMin) return 0;
    return (endMin - startMin) / 60;
  })();
  const calcTotalWaktu = (() => {
    if (!form.start || !form.stop) return 0;
    const [sh, sm] = form.start.split(':').map(Number);
    const [eh, em] = form.stop.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin <= startMin) return 0;
    return endMin - startMin;
  })();

  // Auto-calculate eff_warping from jam and total_putusan
  const calcEff = (() => {
    if (!form.start || !form.stop || !form.mtr_per_min || calcJam === 0) return '';
    const mtrPerMin = parseFloat(form.mtr_per_min);
    if (isNaN(mtrPerMin) || mtrPerMin <= 0) return '';
    const totalMtr = totalPanjangAktual;
    if (totalMtr <= 0) return '';
    const theoreticalMin = totalMtr / mtrPerMin;
    if (theoreticalMin <= 0) return '';
    const eff = (theoreticalMin / (calcTotalWaktu || 1)) * 100;
    if (eff > 100) return '100.00';
    return eff.toFixed(2);
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const scData = await authFetch<Record<string, unknown>>(`/denim/sales-contracts/${kp}`);
        setSc(scData);

        setForm(f => ({
          ...f,
          kode_full: (scData?.codename as string) || [(scData?.kons_kode as string), (scData?.kode_number as string), (scData?.kat_kode as string)].filter(Boolean).join(' ') || '',
          benang: (scData?.ne_lusi != null ? String(scData.ne_lusi) : '') as string,
          lot_lusi: (scData?.lot_lusi as string) || '',
          lot: (scData?.lot_lusi as string) || '',
          sp: (scData?.sp_lusi as string) || '',
          pt: (scData?.j as string) || '',
          te: (scData?.te != null ? String(scData.te) : '') as string,
        }));

        if (isEditMode) {
          const pipelineData = await authFetch<{ warping_run?: Record<string, unknown> }>(`/denim/admin/pipeline/${kp}`);
          if (pipelineData?.warping_run) {
            const w = pipelineData.warping_run;
            const beamsFromDb: BeamRow[] = emptyBeams();
            (w.beams as BeamData[] | undefined)?.forEach((b, i) => {
              if (i < BEAM_COUNT) {
                beamsFromDb[i] = {
                  beam_number: b.beam_number?.toString() || '',
                  panjang_plan: '',
                  panjang_aktual: b.panjang_beam?.toString() || '',
                  jumlah_ends: b.jumlah_ends?.toString() || '',
                  putusan: b.putusan?.toString() || '',
                };
              }
            });
            setForm(f => ({
              ...f,
              tgl: w.tgl ? new Date(w.tgl as string).toISOString().split('T')[0] : f.tgl,
              start: (w.start as string) || '',
              stop: (w.stop as string) || '',
              rpm: w.rpm?.toString() || '',
              mtr_per_min: w.mtr_min?.toString() || '',
              no_mc: w.no_mc?.toString() || '',
              elongasi: w.elongasi?.toString() || '',
              strength: w.strength?.toString() || '',
              cv_pct: w.cv_pct?.toString() || '',
              tension_badan: w.tension_badan?.toString() || '',
              tension_pinggir: w.tension_pinggir?.toString() || '',
              lebar_creel: w.lebar_creel?.toString() || '',
              jam: w.jam?.toString() || '',
              total_waktu: w.total_waktu?.toString() || '',
              eff_warping: w.eff_warping?.toString() || '',
              cn_1: w.cn_1?.toString() || '',
              beams: beamsFromDb,
            }));
          }
        } else {
          // Check for draft in non-edit mode
          const draft = loadDraft();
          if (draft) {
            // Pre-fill from SC, then restore draft beams/form
            setForm(prev => ({ ...draft, kode_full: prev.kode_full, benang: prev.benang, lot_lusi: prev.lot_lusi, lot: prev.lot, sp: prev.sp, pt: prev.pt, te: prev.te }));
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

  const setField = (key: keyof Omit<WarpingFormState, 'beams'>, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const setBeamField = (index: number, key: keyof BeamRow, value: string) =>
    setForm(f => {
      const beams = [...f.beams];
      beams[index] = { ...beams[index], [key]: value };
      return { ...f, beams };
    });

  const addBeam = () => {
    setForm(f => ({ ...f, beams: [...f.beams, emptyBeam()] }));
  };

  const removeBeam = (index: number) =>
    setForm(f => ({ ...f, beams: f.beams.filter((_, i) => i !== index) }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.tgl.trim())    errs.tgl    = 'Date is required';
    if (!form.start.trim())  errs.start  = 'Start Time is required';
    if (!form.stop.trim())   errs.stop   = 'Stop Time is required';
    if (!form.no_mc.trim()) errs.no_mc  = 'Machine No. (NO MC) is required';
    if (!form.lot_lusi.trim()) errs.lot_lusi = 'Lot Lusi is required';
    const filledBeams = form.beams.filter(b => b.beam_number.trim());
    if (filledBeams.length === 0) errs.beams = 'At least one beam row must have a Beam Number';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorEl = document.querySelector('[data-error="true"]') as HTMLElement | null;
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    setErrors({});
    return true;
  };

  const doSubmit = async () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const filledBeams = form.beams.filter(b => b.beam_number.trim());
      const validBeams = filledBeams.map((b, idx) => ({
        position: idx + 1,
        beam_number: parseInt(b.beam_number),
        panjang_beam: b.panjang_aktual ? parseFloat(b.panjang_aktual) : null,
        jumlah_ends: b.jumlah_ends ? parseInt(b.jumlah_ends) : null,
        putusan: b.putusan ? parseInt(b.putusan) : null,
      }));

      const payload = {
        kp,
        tgl: form.tgl || null,
        start: form.start || null,
        stop: form.stop || null,
        rpm: form.rpm ? parseFloat(form.rpm) : null,
        mtr_min: form.mtr_per_min ? parseFloat(form.mtr_per_min) : null,
        no_mc: form.no_mc ? parseInt(form.no_mc) : null,
        elongasi: form.elongasi ? parseFloat(form.elongasi) : null,
        strength: form.strength ? parseFloat(form.strength) : null,
        cv_pct: form.cv_pct ? parseFloat(form.cv_pct) : null,
        tension_badan: form.tension_badan ? parseInt(form.tension_badan) : null,
        tension_pinggir: form.tension_pinggir ? parseInt(form.tension_pinggir) : null,
        lebar_creel: form.lebar_creel ? parseInt(form.lebar_creel) : null,
        jam: calcJam > 0 ? calcJam : null,
        total_waktu: calcTotalWaktu > 0 ? calcTotalWaktu : null,
        eff_warping: calcEff ? parseFloat(calcEff) : null,
        cn_1: form.cn_1 ? parseFloat(form.cn_1) : null,
        lot_lusi: form.lot_lusi || null,
        total_beam: filledBeams.length,
        total_putusan: totalPutusan,
        beams: validBeams,
      };

      if (isEditMode) {
        await authFetch(`/denim/warping/${kp}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(`Warping updated for KP ${kp}.`);
        router.push(`/denim/admin/orders/${kp}`);
      } else {
        await authFetch('/denim/warping', { method: 'POST', body: JSON.stringify(payload) });
        localStorage.removeItem(draftKey);
        setDraftSavedAt(null);
        toast.success(`Warping saved for KP ${kp}. Moved to Indigo.`);
        router.push('/denim/inbox/warping');
      }
    } catch {
      toast.error('Failed to save warping data.');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loadingSc) {
    return (
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh', padding: 32 }}>
        <Skeleton style={{ height: 32, width: 200, borderRadius: 6 }} />
        <Skeleton style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
        <Skeleton style={{ height: 300, borderRadius: 10, marginTop: 12 }} />
      </div>
    );
  }

  const subtitleParts = [
    form.kode_full || sc?.codename as string || null,
    sc?.permintaan as string || null,
  ].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  return (
    <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <PageShell
        title="Warping Form"
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
            onRestore={() => {
              const draft = loadDraft();
              if (draft) {
                setForm(prev => ({ ...draft, kode_full: prev.kode_full, benang: prev.benang, lot_lusi: prev.lot_lusi, lot: prev.lot, sp: prev.sp, pt: prev.pt, te: prev.te }));
                toast.success('Draft restored');
              }
            }}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }}>
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Section 1 — Auto Fields (from SC) */}
            <SectionCard title="Order Information" subtitle="Auto-filled from sales contract — read only">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <AutoField label="Kode Full" value={form.kode_full} />
                <AutoField label="Benang (Ne K Lusi)" value={form.benang} />
                <Field label="Lot Lusi">
                  <Input type="text" value={form.lot_lusi}
                    onChange={e => { setField('lot_lusi', e.target.value); setErrors(p => ({ ...p, lot_lusi: '' })); }}
                    placeholder="e.g. LOT-2024-001"
                    style={errors.lot_lusi ? { ...FIELD_STYLE, border: '1px solid #DC2626' } : FIELD_STYLE} />
                  {errors.lot_lusi && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.lot_lusi}</p>}
                </Field>
                <AutoField label="SP Lusi" value={form.sp} />
                <AutoField label="PT (Panjang Tarikan)" value={form.pt} />
                <AutoField label="TE" value={form.te} />
              </div>
            </SectionCard>

            {/* Section 2 — Run Details */}
            <SectionCard title="Run Details" subtitle="Date and time for this production run">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Field label="Date">
                  <Input type="date" value={form.tgl}
                    onChange={e => { setField('tgl', e.target.value); setErrors(p => ({ ...p, tgl: '' })); }}
                    style={errors.tgl ? { ...FIELD_STYLE, border: '1px solid #DC2626' } : FIELD_STYLE} />
                </Field>
                {errors.tgl && <p style={{ gridColumn: '1', fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.tgl}</p>}
                <Field label="Start Time">
                  <Input type="time" value={form.start}
                    onChange={e => { setField('start', e.target.value); setErrors(p => ({ ...p, start: '' })); }}
                    style={errors.start ? { ...FIELD_STYLE, border: '1px solid #DC2626' } : FIELD_STYLE} />
                </Field>
                <Field label="Stop Time">
                  <Input type="time" value={form.stop}
                    onChange={e => { setField('stop', e.target.value); setErrors(p => ({ ...p, stop: '' })); }}
                    style={errors.stop ? { ...FIELD_STYLE, border: '1px solid #DC2626' } : FIELD_STYLE} />
                </Field>
              </div>
              {errors.beams && (
                <p style={{ fontSize: 12, color: '#DC2626', margin: '8px 0 0', gridColumn: '1 / -1' }}>
                  {errors.beams}
                </p>
              )}
            </SectionCard>

            {/* Section 3 — Machine */}
            <SectionCard title="Machine" subtitle="Machine and speed settings for this run">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Field label="Machine No. (NO MC)">
                  <Input type="number" value={form.no_mc}
                    onChange={e => { setField('no_mc', e.target.value); setErrors(p => ({ ...p, no_mc: '' })); }}
                    placeholder="e.g. 1"
                    style={errors.no_mc ? { ...FIELD_STYLE, border: '1px solid #DC2626' } : FIELD_STYLE} />
                </Field>
                <Field label="RPM">
                  <Input type="number" step="0.1" value={form.rpm}
                    onChange={e => setField('rpm', e.target.value)}
                    placeholder="e.g. 650"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Mtr / Min">
                  <Input type="number" step="0.01" value={form.mtr_per_min}
                    onChange={e => setField('mtr_per_min', e.target.value)}
                    placeholder="e.g. 45.5"
                    style={FIELD_STYLE} />
                </Field>
              </div>
            </SectionCard>

            {/* Section 4 — Beam Table */}
            <SectionCard
              title="Beam Table"
              subtitle={`${totalBeams} beam${totalBeams !== 1 ? 's' : ''} filled`}
              action={
                <Button type="button" variant="secondary" size="sm" onClick={addBeam}
                  leftIcon={<Plus size={13} />}>
                  Add Beam
                </Button>
              }
              noPadding
            >
              <div style={{
                display: 'flex',
                gap: 12,
                padding: '12px 16px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                overflowX: 'auto',
              }}>
                {[
                  { label: 'Total Panjang Plan', value: totalPanjangPlan.toFixed(1) },
                  { label: 'Total Panjang Aktual', value: totalPanjangAktual.toFixed(1) },
                  { label: 'Plan - Actual', value: (() => {
                    const diff = totalPanjangPlan - totalPanjangAktual;
                    return diff.toFixed(1) + (diff > 0 ? ' over' : diff < 0 ? ' under' : '');
                  })() },
                  { label: 'Total Jumlah Ends', value: totalJumlahEnds.toLocaleString() },
                  { label: 'Total Putusan', value: totalPutusan.toLocaleString() },
                ].map(tile => (
                  <div key={tile.label} style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '10px 16px',
                    minWidth: 160,
                  }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {tile.label}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: '#0F1E2E' }}>
                      {tile.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 40px',
                gap: 12,
                padding: '0 16px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                height: 36,
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>#</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>No Beam</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Panjang Plan (m)</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Panjang Aktual (m)</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jumlah Ends</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Putusan</span>
                <span />
              </div>
              {form.beams.map((beam, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 40px',
                    gap: 12,
                    padding: '6px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    alignItems: 'center',
                    height: 40,
                    background: beam.beam_number.trim() ? '#FFFFFF' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>{i + 1}</span>
                  <Input type="number" value={beam.beam_number}
                    onChange={e => setBeamField(i, 'beam_number', e.target.value)}
                    placeholder={`Beam ${i + 1}`}
                    style={{ ...FIELD_STYLE, height: 32 }} />
                  <Input type="number" step="0.1" value={beam.panjang_plan}
                    onChange={e => setBeamField(i, 'panjang_plan', e.target.value)}
                    placeholder="Planned"
                    style={{ ...FIELD_STYLE, height: 32 }} />
                  <Input type="number" step="0.1" value={beam.panjang_aktual}
                    onChange={e => setBeamField(i, 'panjang_aktual', e.target.value)}
                    placeholder="Actual"
                    style={{ ...FIELD_STYLE, height: 32 }} />
                  <Input type="number" value={beam.jumlah_ends}
                    onChange={e => setBeamField(i, 'jumlah_ends', e.target.value)}
                    placeholder="e.g. 4760"
                    style={{ ...FIELD_STYLE, height: 32 }} />
                  <Input type="number" value={beam.putusan}
                    onChange={e => setBeamField(i, 'putusan', e.target.value)}
                    placeholder="Breaks"
                    style={{ ...FIELD_STYLE, height: 32 }} />
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {beam.beam_number.trim() && form.beams.filter(b => b.beam_number.trim()).length > 1 && (
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => removeBeam(i)}
                        style={{ color: '#9CA3AF', padding: '4px' }}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 40px',
                gap: 12,
                padding: '8px 16px',
                backgroundColor: '#F9FAFB',
                borderTop: '2px solid #E5E7EB',
                alignItems: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: '#0F1E2E',
                fontSize: 13,
              }}>
                <span style={{ textAlign: 'center', color: '#9CA3AF' }} />
                <span style={{ color: '#6B7280' }}>TOTALS</span>
                <span>{totalPanjangPlan > 0 ? totalPanjangPlan.toFixed(1) : '—'}</span>
                <span>{totalPanjangAktual > 0 ? totalPanjangAktual.toFixed(1) : '—'}</span>
                <span>{totalJumlahEnds > 0 ? totalJumlahEnds.toLocaleString() : '—'}</span>
                <span>{totalPutusan > 0 ? totalPutusan.toLocaleString() : '—'}</span>
                <span />
              </div>
            </SectionCard>

            {/* Section 5 — Quality */}
            <SectionCard title="Quality" subtitle="Yarn quality measurements">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Field label="Elongasi %">
                  <Input type="number" step="0.01" value={form.elongasi}
                    onChange={e => setField('elongasi', e.target.value)}
                    placeholder="e.g. 1.5"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Strength">
                  <Input type="number" step="0.01" value={form.strength}
                    onChange={e => setField('strength', e.target.value)}
                    placeholder="e.g. 3.5"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="CV%">
                  <Input type="number" step="0.01" value={form.cv_pct}
                    onChange={e => setField('cv_pct', e.target.value)}
                    placeholder="e.g. 2.1"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Tension Badan">
                  <Input type="number" value={form.tension_badan}
                    onChange={e => setField('tension_badan', e.target.value)}
                    placeholder="e.g. 45"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Tension Pinggir">
                  <Input type="number" value={form.tension_pinggir}
                    onChange={e => setField('tension_pinggir', e.target.value)}
                    placeholder="e.g. 40"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Lebar Creel">
                  <Input type="number" value={form.lebar_creel}
                    onChange={e => setField('lebar_creel', e.target.value)}
                    placeholder="e.g. 180"
                    style={FIELD_STYLE} />
                </Field>
              </div>
            </SectionCard>

            {/* Section 6 — Time & Efficiency */}
            <SectionCard title="Time &amp; Efficiency" subtitle="Auto-calculated from Run Details and beam output">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <AutoField label="Jam (Hours)" value={calcJam > 0 ? calcJam.toFixed(2) : '—'} />
                <AutoField label="Total Waktu (min)" value={calcTotalWaktu > 0 ? String(calcTotalWaktu) : '—'} />
                <Field label="1 CN (Cones)">
                  <Input type="number" step="0.01" value={form.cn_1}
                    onChange={e => setField('cn_1', e.target.value)}
                    placeholder="e.g. 50"
                    style={FIELD_STYLE} />
                </Field>
                <AutoField label="Eff Warping (%)" value={calcEff ? `${calcEff}%` : '—'} />
              </div>
            </SectionCard>

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
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              {isEditMode ? 'Save Changes' : 'Submit Warping'}
            </Button>
          </div>
        </form>

        {showConfirm && (
          <ConfirmSubmitModal
            kp={kp}
            form={form}
            totalBeams={totalBeams}
            totalPutusan={totalPutusan}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowConfirm(false)}
            submitting={submitting}
          />
        )}
      </PageShell>
    </div>
  );
}

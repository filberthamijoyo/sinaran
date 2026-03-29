'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { SectionCard } from '../ui/erp/SectionCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import RollTable from './inspect-gray/RollTable';
import SummarySection from './inspect-gray/SummarySection';
import {
  InspectGrayFormState,
  InspectGraySummary,
  RollRow,
  SCData,
  emptyRoll,
  calculateBMC,
} from './inspect-gray/types';

// ── Confirm Modal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  kp: string;
  form: InspectGrayFormState;
  summary: InspectGraySummary;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

function ConfirmSubmitModal({ kp, form, summary, onConfirm, onCancel, submitting }: ConfirmModalProps) {
  const totalMeters = summary.totalPanjang.toLocaleString('id-ID', { maximumFractionDigits: 1 });
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
          Confirm Inspect Gray Submission
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'KP Code', value: kp, mono: true },
            { label: 'Date', value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Inspector', value: form.inspector_name || '—' },
            { label: 'Total Rolls', value: String(summary.totalRolls) },
            { label: 'Total Meters', value: `${totalMeters} m` },
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
export default function InspectGrayFormPage({
  kp,
  editMode = false,
}: {
  kp: string;
  editMode?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [opgError, setOpgError] = useState<string | null>(null);

  const draftKey = `draft_inspect_gray_${kp}`;

  const [form, setForm] = useState<InspectGrayFormState>({
    inspector_name: '', sj: '', rolls: [emptyRoll()],
  });

  const summary = useMemo<InspectGraySummary>(() => {
    const valid = form.rolls.filter(r => r.no_roll.trim());
    return {
      totalRolls: valid.length,
      totalPanjang: valid.reduce((s, r) => s + (parseFloat(r.panjang) || 0), 0),
      totalBerat: valid.reduce((s, r) => s + (parseFloat(r.berat) || 0), 0),
      totalBMC: valid.reduce((s, r) => s + calculateBMC(r.defects), 0),
      gradeACount: valid.filter(r => r.grade === 'A').length,
      gradeBCount: valid.filter(r => r.grade === 'B').length,
      gradeCCount: valid.filter(r => r.grade === 'C').length,
      rejectCount: valid.filter(r => r.grade === 'Reject').length,
    };
  }, [form.rolls]);

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

  const loadDraft = useCallback((): InspectGrayFormState | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { form: InspectGrayFormState; savedAt: number };
      setDraftSavedAt(parsed.savedAt);
      return parsed.form;
    } catch { return null; }
  }, [draftKey]);

  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
    setForm({ inspector_name: '', sj: '', rolls: [emptyRoll()] });
    toast.info('Draft discarded');
  }, [draftKey]);

  useEffect(() => {
    setLoadingSc(true);
    authFetch(`/denim/sales-contracts/${kp}`)
      .then((data) => setSc(data as SCData))
      .catch(() => toast.error('Failed to load order data.'))
      .finally(() => setLoadingSc(false));
  }, [kp]);

  useEffect(() => {
    if (!isEditMode) {
      const draft = loadDraft();
      if (draft) setForm(draft);
      return;
    }
    const loadExisting = async () => {
      try {
        const data = await authFetch<{ inspectGray?: Array<Record<string, unknown>> }>(`/denim/admin/pipeline/${kp}`);
        if (data?.inspectGray && data.inspectGray.length > 0) {
          const byDate = data.inspectGray.reduce<Record<string, { inspector: string; rolls: RollRow[] }>>((acc, r) => {
            const key = r.tg ? new Date(r.tg as string).toISOString().split('T')[0] : 'unknown';
            if (!acc[key]) acc[key] = { inspector: (r.mc as string) || '', rolls: [] };
            acc[key].rolls.push({
              no_roll: (r.no_roll as string)?.toString() || '',
              panjang: (r.panjang as string)?.toString() || '',
              lebar: (r.w as string)?.toString() || '',
              berat: (r.berat as string)?.toString() || '',
              grade: (r.gd as string) || '',
              cacat: (r.cacat as string) || '',
              opg: (r.opg as string) || '',
              defects: {},
              expanded: false,
            });
            return acc;
          }, {});
          const first = Object.keys(byDate)[0];
          if (first && byDate[first]) {
            setForm({ inspector_name: byDate[first].inspector, sj: '', rolls: byDate[first].rolls.length > 0 ? byDate[first].rolls : [emptyRoll()] });
          }
        }
      } catch {
        console.error('Failed to load existing data.');
      }
    };
    loadExisting();
  }, [isEditMode, kp, loadDraft]);

  const setField = (key: keyof InspectGrayFormState, value: string) => setForm(f => ({ ...f, [key]: value }));

  const setRollField = (i: number, key: keyof RollRow, value: string) => {
    setOpgError(null);
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], [key]: value }; return { ...f, rolls }; });
  };

  const setDefectField = (i: number, k: string, value: string) =>
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], defects: { ...rolls[i].defects, [k]: value } }; return { ...f, rolls }; });

  const toggleExpand = (i: number) =>
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], expanded: !rolls[i].expanded }; return { ...f, rolls }; });

  const addRoll = () => {
    setOpgError(null);
    setForm(f => ({ ...f, rolls: [...f.rolls, emptyRoll()] }));
  };

  const removeRoll = (i: number) =>
    setForm(f => ({ ...f, rolls: f.rolls.filter((_, idx) => idx !== i) }));

  const doSubmit = () => {
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    if (validRolls.length === 0) { toast.error('Add at least one roll.'); return; }
    // OPG required validation
    const missingOpg = validRolls.filter(r => !r.opg.trim());
    if (missingOpg.length > 0) {
      setOpgError('OPG is required for all rolls.');
      toast.error('OPG is required for all rolls.');
      return;
    }
    setOpgError(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const { ALL_DEFECTS } = await import('./inspect-gray/types');
      const validRolls = form.rolls.filter(r => r.no_roll.trim());
      const payload = validRolls.map(r => {
        const defects: Record<string, number> = {};
        ALL_DEFECTS.forEach(d => { if (r.defects[d] && parseInt(r.defects[d]) > 0) defects[d] = parseInt(r.defects[d]); });
        return {
          no_roll: parseInt(r.no_roll),
          panjang: parseFloat(r.panjang) || null,
          lebar: parseFloat(r.lebar) || null,
          berat: parseFloat(r.berat) || null,
          grade: r.grade || null,
          cacat: r.cacat || null,
          opg: r.opg || null,
          ...defects,
          bmc: calculateBMC(r.defects),
        };
      });
      await authFetch('/denim/inspect-gray', {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({ kp, inspector_name: form.inspector_name || null, sj: parseFloat(form.sj) || null, rolls: payload }),
      });
      localStorage.removeItem(draftKey);
      setDraftSavedAt(null);
      toast.success(isEditMode ? `Inspection updated for KP ${kp}.` : `Inspection complete for KP ${kp}. Order moved to BBSF.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/bbsf');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save inspection data.';
      toast.error(message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loadingSc) return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', padding: 32 }}>
      <Skeleton style={{ height: 32, width: 200, borderRadius: 6 }} />
      <Skeleton style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
      <Skeleton style={{ height: 300, borderRadius: 10, marginTop: 12 }} />
    </div>
  );

  const subtitleParts = [sc?.codename ?? null, sc?.permintaan ?? null].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  return (
    <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <PageShell
        title="Inspect Gray Form"
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
              if (draft) { setForm(draft); toast.success('Draft restored'); }
            }}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }}>
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Section 1 — Inspection Details */}
            <SectionCard title="Inspection Details" subtitle="Date and time recorded automatically on submit">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Inspector Name
                  </label>
                  <Input
                    type="text"
                    value={form.inspector_name}
                    onChange={e => setField('inspector_name', e.target.value)}
                    placeholder="Inspector name"
                    style={{ height: 36, borderRadius: 8, borderWidth: '1px', borderStyle: 'solid', borderColor: '#E5E7EB', background: '#FFFFFF', padding: '0 12px', fontSize: 14, color: '#0F1E2E', width: '100%', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    SJ (Surat Jalan)
                  </label>
                  <Input
                    type="text"
                    value={form.sj}
                    onChange={e => setField('sj', e.target.value)}
                    placeholder="Delivery note number"
                    style={{ height: 36, borderRadius: 8, borderWidth: '1px', borderStyle: 'solid', borderColor: '#E5E7EB', background: '#FFFFFF', padding: '0 12px', fontSize: 14, color: '#0F1E2E', width: '100%', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              {opgError && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 8 }}>{opgError}</p>
              )}
            </SectionCard>

            <RollTable
              rolls={form.rolls}
              setRollField={setRollField}
              setDefectField={setDefectField}
              toggleExpand={toggleExpand}
              addRoll={addRoll}
              removeRoll={removeRoll}
            />
            <SummarySection summary={summary} />

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
              {isEditMode ? 'Save Changes' : 'Complete & Send to BBSF'}
            </Button>
          </div>
        </form>

        {showConfirm && (
          <ConfirmSubmitModal
            kp={kp}
            form={form}
            summary={summary}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowConfirm(false)}
            submitting={submitting}
          />
        )}
      </PageShell>
    </div>
  );
}

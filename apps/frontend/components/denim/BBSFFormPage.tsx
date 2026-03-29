'use client';

import { useEffect, useState, useCallback } from 'react';
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

// ── Confirm Modal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  kp: string;
  form: BBSFFormState;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

function ConfirmSubmitModal({ kp, form, onConfirm, onCancel, submitting }: ConfirmModalProps) {
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
          Confirm BBSF Submission
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'KP Code', value: kp, mono: true },
            { label: 'Date', value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Washing Shift', value: form.ws_shift || '—' },
            { label: 'Washing MC', value: form.ws_mc || '—' },
            { label: 'Sanfor Shift', value: form.sf1_shift || '—' },
            { label: 'Sanfor MC', value: form.sf1_mc || '—' },
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
export default function BBSFFormPage({ kp, editMode = false }: { kp: string; editMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('washing');
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  const draftKey = `draft_bbsf_${kp}`;

  const [form, setForm] = useState<BBSFFormState>(emptyForm());

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

  const loadDraft = useCallback((): BBSFFormState | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { form: BBSFFormState; savedAt: number };
      setDraftSavedAt(parsed.savedAt);
      return parsed.form;
    } catch { return null; }
  }, [draftKey]);

  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
    setForm(emptyForm());
    toast.info('Draft discarded');
  }, [draftKey]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch<SCData>(`/denim/sales-contracts/${kp}`);
        setSc(data);
        if (!isEditMode) {
          const draft = loadDraft();
          if (draft) setForm(draft);
        }
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp, isEditMode, loadDraft]);

  useEffect(() => {
    if (!isEditMode) return;

    const loadExisting = async () => {
      try {
        const data = await authFetch<PipelineResponse>(`/denim/admin/pipeline/${kp}`);
        if (data?.bbsfWashing && data.bbsfWashing.length > 0) {
          const w = data.bbsfWashing[0];
          setForm(f => ({
            ...f,
            ws_shift: w.shift || '',
            ws_mc: w.mc || '',
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
        }
        if (data?.bbsfSanfor && data.bbsfSanfor.length > 0) {
          const s = data.bbsfSanfor[0];
          setForm(f => ({
            ...f,
            sf1_shift: s.shift || '',
            sf1_mc: s.mc || '',
            sf1_jam: s.jam?.toString() || '',
            sf1_speed: s.speed?.toString() || '',
            sf1_damping: s.damping?.toString() || '',
            sf1_press: s.press?.toString() || '',
            sf1_tension: s.tension?.toString() || '',
            sf1_tension_limit: s.tension_limit?.toString() || '',
            sf1_temperatur: s.temperatur?.toString() || '',
            sf1_susut: s.susut?.toString() || '',
            sf1_permasalahan: s.permasalahan || '',
            sf1_pelaksana: s.pelaksana || '',
          }));
        }
      } catch {
        console.error('Failed to load existing data:');
      }
    };

    loadExisting();
  }, [isEditMode, kp]);

  const setField = (key: keyof BBSFFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const doSubmit = () => setShowConfirm(true);

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await authFetch('/denim/bbsf', {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({
          kp,
          tgl: new Date().toISOString(),
          ...form,
        }),
      });
      localStorage.removeItem(draftKey);
      setDraftSavedAt(null);
      toast.success(isEditMode ? `BBSF updated for KP ${kp}.` : `BBSF complete for KP ${kp}. Order moved to Inspect Finish.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/inspect-finish');
    } catch {
      toast.error('Failed to save BBSF data.');
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

  const subtitleParts = [sc?.codename ?? null, sc?.permintaan ?? null].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'washing', label: 'Washing' },
    { id: 'sanfor1', label: 'Sanfor 1' },
    { id: 'sanfor2', label: 'Sanfor 2' },
  ];

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
          onRestore={() => {
            const draft = loadDraft();
            if (draft) { setForm(draft); toast.success('Draft restored'); }
          }}
          onDiscard={discardDraft}
        />
      )}

      <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }}>
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '4px',
            background: 'var(--page-bg)',
            borderRadius: 'var(--button-radius)',
            border: '1px solid var(--border)',
            width: 'fit-content',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease',
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? '#EEF3F7' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.id) {
                    (e.target as HTMLElement).style.background = 'var(--denim-100)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.id) {
                    (e.target as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'washing' && <WashingSection form={form} setField={setField} />}
            {(activeTab === 'sanfor1' || activeTab === 'sanfor2') && (
              <SanforSection form={form} setField={setField} />
            )}
          </div>

        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--content-bg)',
          borderTop: '1px solid var(--border)',
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
            {isEditMode ? 'Save Changes' : 'Complete & Send to Inspect Finish'}
          </Button>
        </div>
      </form>

      {showConfirm && (
        <ConfirmSubmitModal
          kp={kp}
          form={form}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}
    </PageShell>
  );
}

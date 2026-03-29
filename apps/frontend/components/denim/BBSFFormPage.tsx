'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BBSFFormState, TabType, emptyForm } from './bbsf/types';
import WashingSection from './bbsf/WashingSection';
import SanforSection from './bbsf/SanforSection';
import type { SCData, PipelineResponse } from './bbsf/types';

export default function BBSFFormPage({ kp, editMode = false }: { kp: string; editMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('washing');

  const [form, setForm] = useState<BBSFFormState>(emptyForm());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch<SCData>(`/denim/sales-contracts/${kp}`);
        setSc(data);
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success(isEditMode ? `BBSF updated for KP ${kp}.` : `BBSF complete for KP ${kp}. Order moved to Inspect Finish.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/bbsf');
    } catch {
      toast.error('Failed to save BBSF data.');
    } finally {
      setSubmitting(false);
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
      <form onSubmit={handleSubmit}>
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
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Complete & Send to Inspect Finish'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { SectionCard } from '../ui/erp/SectionCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
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

  const [form, setForm] = useState<InspectGrayFormState>({
    inspector_name: '', sj: '', opg: '', rolls: [emptyRoll()],
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

  useEffect(() => {
    setLoadingSc(true);
    authFetch(`/denim/sales-contracts/${kp}`)
      .then((data) => setSc(data as SCData))
      .catch(() => toast.error('Failed to load order data.'))
      .finally(() => setLoadingSc(false));
  }, [kp]);

  useEffect(() => {
    if (!isEditMode) return;
    const loadExisting = async () => {
      try {
        const data = await authFetch<{ inspectGray?: Array<Record<string, unknown>> }>(`/denim/admin/pipeline/${kp}`);
        if (data?.inspectGray && data.inspectGray.length > 0) {
          const byDate = data.inspectGray.reduce<Record<string, { inspector: string; rolls: RollRow[] }>>((acc, r) => {
            const key = r.tg ? new Date(r.tg as string).toISOString().split('T')[0] : 'unknown';
            if (!acc[key]) acc[key] = { inspector: (r.mc as string) || '', rolls: [] };
            acc[key].rolls.push({ no_roll: (r.no_roll as string)?.toString() || '', panjang: (r.panjang as string)?.toString() || '', lebar: (r.w as string)?.toString() || '', berat: (r.berat as string)?.toString() || '', grade: (r.gd as string) || '', cacat: (r.cacat as string) || '', defects: {}, expanded: false });
            return acc;
          }, {});
          const first = Object.keys(byDate)[0];
          if (first && byDate[first]) {
            setForm({ inspector_name: byDate[first].inspector, sj: '', opg: '', rolls: byDate[first].rolls.length > 0 ? byDate[first].rolls : [emptyRoll()] });
          }
        }
      } catch {
        console.error('Failed to load existing data.');
      }
    };
    loadExisting();
  }, [isEditMode, kp]);

  const setField = (key: keyof InspectGrayFormState, value: string) => setForm(f => ({ ...f, [key]: value }));

  const setRollField = (i: number, key: keyof RollRow, value: string) =>
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], [key]: value }; return { ...f, rolls }; });

  const setDefectField = (i: number, k: string, value: string) =>
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], defects: { ...rolls[i].defects, [k]: value } }; return { ...f, rolls }; });

  const toggleExpand = (i: number) =>
    setForm(f => { const rolls = [...f.rolls]; rolls[i] = { ...rolls[i], expanded: !rolls[i].expanded }; return { ...f, rolls }; });

  const addRoll = () => setForm(f => ({ ...f, rolls: [...f.rolls, emptyRoll()] }));
  const removeRoll = (i: number) => setForm(f => ({ ...f, rolls: f.rolls.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    if (validRolls.length === 0) { toast.error('Add at least one roll.'); return; }
    setSubmitting(true);
    try {
      const { ALL_DEFECTS } = await import('./inspect-gray/types');
      const payload = validRolls.map(r => {
        const defects: Record<string, number> = {};
        ALL_DEFECTS.forEach(d => { if (r.defects[d] && parseInt(r.defects[d]) > 0) defects[d] = parseInt(r.defects[d]); });
        return { no_roll: parseInt(r.no_roll), panjang: parseFloat(r.panjang) || null, lebar: parseFloat(r.lebar) || null, berat: parseFloat(r.berat) || null, grade: r.grade || null, cacat: r.cacat || null, ...defects, bmc: calculateBMC(r.defects) };
      });
      await authFetch('/denim/inspect-gray', { method: isEditMode ? 'PUT' : 'POST', body: JSON.stringify({ kp, inspector_name: form.inspector_name || null, sj: parseFloat(form.sj) || null, opg: form.opg || null, rolls: payload }) });
      toast.success(isEditMode ? `Inspection updated for KP ${kp}.` : `Inspection complete for KP ${kp}. Order moved to BBSF.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/inspect-gray');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save inspection data.';
      toast.error(message);
    } finally { setSubmitting(false); }
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
        <form onSubmit={handleSubmit}>
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
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  OPG
                </label>
                <Input
                  type="text"
                  value={form.opg}
                  onChange={e => setField('opg', e.target.value)}
                  placeholder="OPG reference"
                  style={{ height: 36, borderRadius: 8, borderWidth: '1px', borderStyle: 'solid', borderColor: '#E5E7EB', background: '#FFFFFF', padding: '0 12px', fontSize: 14, color: '#0F1E2E', width: '100%', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
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
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Complete & Send to BBSF'}
          </Button>
        </div>
      </form>
    </PageShell>
    </div>
  );
}

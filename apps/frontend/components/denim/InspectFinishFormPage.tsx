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
import RollTable from './inspect-finish/RollTable';
import GradeSection from './inspect-finish/GradeSection';
import {
  InspectFinishFormState,
  InspectFinishSummary,
  RollRow,
  SCData,
  emptyRoll,
  calculateBMC,
} from './inspect-finish/types';

export default function InspectFinishFormPage({
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

  const [form, setForm] = useState<InspectFinishFormState>({
    shift: '', operator: '', rolls: [emptyRoll()],
  });

  const summary = useMemo<InspectFinishSummary>(() => {
    const valid = form.rolls.filter(r => r.no_roll.trim());
    return {
      totalRolls: valid.length,
      totalKg: valid.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0),
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
    const loadExistingData = async () => {
      try {
        const data = await authFetch<{ inspectFinish?: Array<Record<string, unknown>> }>(`/denim/admin/pipeline/${kp}`);
        if (data.inspectFinish && data.inspectFinish.length > 0) {
          const finishData = data.inspectFinish;
          const rolls: RollRow[] = finishData.map((r) => ({
            no_roll: (r.no_roll as string)?.toString() || '',
            sn: (r.sn as string) || '',
            tgl_potong: '',
            lebar: (r.lebar as string)?.toString() || '',
            kg: (r.kg as string)?.toString() || '',
            susut_lusi: (r.susut_lusi as string)?.toString() || '',
            grade: (r.grade as string) || '',
            point: (r.point as string)?.toString() || '',
            noda: '',
            kotor: '',
            bkrt: '',
            ket: '',
            defects: {},
            expanded: false,
          }));
          setForm(f => ({ ...f, shift: (finishData[0]?.shift as string) || '', operator: (finishData[0]?.mc as string) || '', rolls: rolls.length > 0 ? rolls : [emptyRoll()] }));
        }
      } catch {
        console.error('Failed to load existing data.');
      }
    };
    loadExistingData();
  }, [isEditMode, kp]);

  const setField = (key: keyof InspectFinishFormState, value: string) => setForm(f => ({ ...f, [key]: value }));

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
      const { ALL_DEFECTS } = await import('./inspect-finish/types');
      const payload = validRolls.map(r => {
        const defects: Record<string, number> = {};
        ALL_DEFECTS.forEach(d => { if (r.defects[d] && parseInt(r.defects[d]) > 0) defects[d] = parseInt(r.defects[d]); });
        return { no_roll: parseInt(r.no_roll), sn: r.sn || null, tgl_potong: r.tgl_potong || null, lebar: parseFloat(r.lebar) || null, kg: parseFloat(r.kg) || null, susut_lusi: parseFloat(r.susut_lusi) || null, grade: r.grade || null, point: parseFloat(r.point) || null, noda: r.noda || null, kotor: r.kotor || null, bkrt: r.bkrt || null, ket: r.ket || null, ...defects, bmc: calculateBMC(r.defects) };
      });
      await authFetch('/denim/inspect-finish', { method: isEditMode ? 'PUT' : 'POST', body: JSON.stringify({ kp, shift: form.shift || null, operator: form.operator || null, rolls: payload }) });
      toast.success(isEditMode ? `Inspection updated for KP ${kp}.` : `Inspection complete for KP ${kp}. Order marked Complete.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/inspect-finish');
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

  const inputBase: React.CSSProperties = {
    height: 36,
    borderRadius: 'var(--input-radius)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    background: 'var(--page-bg)',
    padding: '0 12px',
    fontSize: 14,
    color: 'var(--text-primary)',
    width: '100%',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectBase: React.CSSProperties = {
    ...inputBase,
    appearance: 'none',
    cursor: 'pointer',
  };

  return (
    <PageShell
      title="Inspect Finish Form"
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
          <SectionCard title="Inspection Details" subtitle="Shift and operator information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Shift
                </label>
                <select
                  value={form.shift}
                  onChange={e => setField('shift', e.target.value)}
                  style={selectBase}
                >
                  <option value="">Select...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Operator
                </label>
                <Input
                  type="text"
                  value={form.operator}
                  onChange={e => setField('operator', e.target.value)}
                  placeholder="Operator name"
                  style={inputBase}
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
          <GradeSection summary={summary} />

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
            {isEditMode ? 'Save Changes' : 'Complete Order'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { SectionCard } from '../ui/erp/SectionCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Plus, Trash2 } from 'lucide-react';
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
  // ── Auto fields (from SC / computed) ──────────────────────────
  kode_full: string;
  benang: string;
  lot: string;
  sp: string;
  pt: string;
  te: string;
  // ── Run Details ───────────────────────────────────────────────
  tgl: string;
  start: string;
  stop: string;
  // ── Machine Parameters ────────────────────────────────────────
  rpm: string;
  mtr_per_min: string;
  no_mc: string;
  elongasi: string;
  strength: string;
  cv_pct: string;
  tension_badan: string;
  tension_pinggir: string;
  lebar_creel: string;
  // ── Beam Records ──────────────────────────────────────────────
  beams: BeamRow[];
  // ── Summary Fields ────────────────────────────────────────────
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

function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={{
        backgroundColor: '#F9FAFB',
        border: '1px solid #F3F4F6',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default function WarpingFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const [sc, setSc] = useState<Record<string, unknown> | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<WarpingFormState>({
    kode_full: '', benang: '', lot: '', sp: '', pt: '', te: '',
    tgl: new Date().toISOString().split('T')[0],
    start: '', stop: '', rpm: '', mtr_per_min: '',
    no_mc: '', elongasi: '', strength: '', cv_pct: '',
    tension_badan: '', tension_pinggir: '', lebar_creel: '',
    jam: '', total_waktu: '', eff_warping: '', cn_1: '',
    total_putusan: '0', total_beam: '0',
    beams: emptyBeams(),
  });

  // Computed summaries
  const totalPutusan = form.beams.reduce(
    (s, b) => s + (parseInt(b.putusan) || 0), 0
  );
  const totalBeams = form.beams.filter(b => b.beam_number.trim()).length;

  // Auto-compute totals whenever beams change
  useEffect(() => {
    setForm(f => ({ ...f, total_putusan: String(totalPutusan) }));
  }, [totalPutusan]);

  useEffect(() => {
    setForm(f => ({ ...f, total_beam: String(totalBeams) }));
  }, [totalBeams]);

  useEffect(() => {
    const load = async () => {
      try {
        const scData = await authFetch<Record<string, unknown>>(`/denim/sales-contracts/${kp}`);
        setSc(scData);

        // Pre-fill auto fields from SC
        setForm(f => ({
          ...f,
          kode_full: (scData?.codename as string) || [(scData?.kons_kode as string), (scData?.kode_number as string), (scData?.kat_kode as string)].filter(Boolean).join(' ') || '',
          benang: (scData?.ne_lusi != null ? String(scData.ne_lusi) : '') as string,
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
        }
      } catch {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp, isEditMode]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.tgl.trim())    errs.tgl    = 'Date is required';
    if (!form.start.trim())  errs.start  = 'Start Time is required';
    if (!form.stop.trim())   errs.stop   = 'Stop Time is required';
    if (!form.no_mc.trim())  errs.no_mc  = 'Machine No. (NO MC) is required';
    const filledBeams = form.beams.filter(b => b.beam_number.trim());
    if (filledBeams.length === 0) errs.beams = 'At least one beam row must have a Beam Number';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorEl = document.querySelector('[data-error="true"]') as HTMLElement | null;
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
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
        jam: form.jam ? parseFloat(form.jam) : null,
        total_waktu: form.total_waktu ? parseFloat(form.total_waktu) : null,
        eff_warping: form.eff_warping ? parseFloat(form.eff_warping) : null,
        cn_1: form.cn_1 ? parseFloat(form.cn_1) : null,
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
        toast.success(`Warping saved for KP ${kp}. Moved to Indigo.`);
        router.push('/denim/inbox/warping');
      }
    } catch {
      toast.error('Failed to save warping data.');
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
        <form onSubmit={handleSubmit}>
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Section 1 — Auto Fields (from SC) */}
          <SectionCard title="Order Information" subtitle="Auto-filled from sales contract — read only">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <AutoField label="Kode Full" value={form.kode_full} />
              <AutoField label="Benang (Ne K Lusi)" value={form.benang} />
              <AutoField label="Lot Lusi" value={form.lot} />
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

          {/* Section 3 — Beam Table (15 slots) */}
          <SectionCard
            title="Beam Table"
            subtitle={`${totalBeams} beam${totalBeams !== 1 ? 's' : ''} filled`}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Total Putusan:</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
                    {totalPutusan}
                  </span>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addBeam}
                  leftIcon={<Plus size={13} />}>
                  Add Beam
                </Button>
              </div>
            }
            noPadding
          >
            {/* Header row */}
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
            {/* Beam rows — always render 15 slots */}
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
          </SectionCard>

          {/* Section 4 — Quality & Machine */}
          <SectionCard title="Quality &amp; Machine">
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

          {/* Section 5 — Time & Efficiency */}
          <SectionCard title="Time &amp; Efficiency">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <Field label="Jam (Hours)">
                <Input type="number" step="0.1" value={form.jam}
                  onChange={e => setField('jam', e.target.value)}
                  placeholder="e.g. 8.5"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Total Waktu (min)">
                <Input type="number" step="0.1" value={form.total_waktu}
                  onChange={e => setField('total_waktu', e.target.value)}
                  placeholder="Auto / manual"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="1 CN (Cones)">
                <Input type="number" step="0.01" value={form.cn_1}
                  onChange={e => setField('cn_1', e.target.value)}
                  placeholder="e.g. 50"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Eff Warping (%)">
                <Input type="number" step="0.01" value={form.eff_warping}
                  onChange={e => setField('eff_warping', e.target.value)}
                  placeholder="Calculated"
                  style={FIELD_STYLE} />
              </Field>
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
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Submit Warping'}
          </Button>
        </div>
      </form>
      </PageShell>
    </div>
  );
}

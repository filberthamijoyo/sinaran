'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import KpContextBanner from './KpContextBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Clock, Loader2, Plus, Trash2 } from 'lucide-react';
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

interface BeamRow {
  beam_number: string;
  panjang_beam: string;
  jumlah_ends: string;
  putusan: string;
}

interface WarpingFormState {
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
  jam: string;
  beams: BeamRow[];
}

const emptyBeam = (): BeamRow => ({
  beam_number: '',
  panjang_beam: '',
  jumlah_ends: '',
  putusan: '',
});

export default function WarpingFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<WarpingFormState>({
    tgl: new Date().toISOString().split('T')[0],
    start: '',
    stop: '',
    rpm: '',
    mtr_per_min: '',
    no_mc: '',
    elongasi: '',
    strength: '',
    cv_pct: '',
    tension_badan: '',
    tension_pinggir: '',
    lebar_creel: '',
    jam: '',
    beams: [emptyBeam()],
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Load SC data
        const scData = await authFetch(
          `/denim/sales-contracts/${kp}`
        ) as any;
        setSc(scData);

        // If in edit mode, load existing warping data
        if (isEditMode) {
          const pipelineData = await authFetch(
            `/denim/pipeline/${kp}`
          ) as any;
          if (pipelineData?.warping_run) {
            const w = pipelineData.warping_run;
            setForm({
              tgl: w.tgl ? new Date(w.tgl).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              start: w.start_time || '',
              stop: w.stop_time || '',
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
              beams: w.beams?.map((b: any) => ({
                beam_number: b.beam_number?.toString() || '',
                panjang_beam: b.panjang_beam?.toString() || '',
                jumlah_ends: b.jumlah_ends?.toString() || '',
                putusan: b.putusan?.toString() || '',
              })) || [emptyBeam()],
            });
          }
        }
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp, isEditMode]);

  const setField = (
    key: keyof Omit<WarpingFormState, 'beams'>,
    value: string
  ) => setForm(f => ({ ...f, [key]: value }));

  const setBeamField = (
    index: number,
    key: keyof BeamRow,
    value: string
  ) => {
    setForm(f => {
      const beams = [...f.beams];
      beams[index] = { ...beams[index], [key]: value };
      return { ...f, beams };
    });
  };

  const addBeam = () =>
    setForm(f => ({ ...f, beams: [...f.beams, emptyBeam()] }));

  const removeBeam = (index: number) =>
    setForm(f => ({
      ...f,
      beams: f.beams.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validBeams = form.beams.filter(b => b.beam_number.trim());
    if (validBeams.length === 0) {
      toast.error('Add at least one beam.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode) {
        // PUT to update existing warping data without advancing pipeline
        await authFetch(`/denim/warping/${kp}`, {
          method: 'PUT',
          body: JSON.stringify({
            kp,
            tgl: form.tgl || null,
            start: form.start || null,
            stop: form.stop || null,
            rpm: form.rpm ? parseFloat(form.rpm) : null,
            mtr_per_min: form.mtr_per_min ? parseFloat(form.mtr_per_min) : null,
            no_mc: form.no_mc ? parseInt(form.no_mc) : null,
            elongasi: form.elongasi ? parseFloat(form.elongasi) : null,
            strength: form.strength ? parseFloat(form.strength) : null,
            cv_pct: form.cv_pct ? parseFloat(form.cv_pct) : null,
            tension_badan: form.tension_badan ? parseInt(form.tension_badan) : null,
            tension_pinggir: form.tension_pinggir ? parseInt(form.tension_pinggir) : null,
            lebar_creel: form.lebar_creel ? parseInt(form.lebar_creel) : null,
            jam: form.jam ? parseFloat(form.jam) : null,
            total_beam: validBeams.length,
            beams: validBeams.map(b => ({
              beam_number: parseInt(b.beam_number),
              panjang_beam: b.panjang_beam
                ? parseFloat(b.panjang_beam) : null,
              jumlah_ends: b.jumlah_ends
                ? parseInt(b.jumlah_ends) : null,
              putusan: b.putusan ? parseInt(b.putusan) : null,
            })),
          }),
        });
        toast.success(`Warping updated for KP ${kp}.`);
        router.push(`/denim/admin/orders/${kp}`);
      } else {
        // POST to create new warping data and advance pipeline
        await authFetch('/denim/warping', {
          method: 'POST',
          body: JSON.stringify({
            kp,
            tgl: form.tgl || null,
            start: form.start || null,
            stop: form.stop || null,
            rpm: form.rpm ? parseFloat(form.rpm) : null,
            mtr_per_min: form.mtr_per_min ? parseFloat(form.mtr_per_min) : null,
            no_mc: form.no_mc ? parseInt(form.no_mc) : null,
            elongasi: form.elongasi ? parseFloat(form.elongasi) : null,
            strength: form.strength ? parseFloat(form.strength) : null,
            cv_pct: form.cv_pct ? parseFloat(form.cv_pct) : null,
            tension_badan: form.tension_badan ? parseInt(form.tension_badan) : null,
            tension_pinggir: form.tension_pinggir ? parseInt(form.tension_pinggir) : null,
            lebar_creel: form.lebar_creel ? parseInt(form.lebar_creel) : null,
            jam: form.jam ? parseFloat(form.jam) : null,
            total_beam: validBeams.length,
            beams: validBeams.map(b => ({
              beam_number: parseInt(b.beam_number),
              panjang_beam: b.panjang_beam
                ? parseFloat(b.panjang_beam) : null,
              jumlah_ends: b.jumlah_ends
                ? parseInt(b.jumlah_ends) : null,
              putusan: b.putusan ? parseInt(b.putusan) : null,
            })),
          }),
        });
        toast.success(`Warping saved for KP ${kp}. Moved to Indigo.`);
        router.push('/denim/inbox/warping');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save warping data.');
    } finally {
      setSubmitting(false);
    }
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
        title={`Warping — ${kp}`}
        subtitle="Fill in warping production data"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="WARPING"
      />

      <form onSubmit={handleSubmit}>
        <div className="px-4 sm:px-8 pb-8 space-y-5">

          {/* Section 1: Run details */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#3D4852' }}>
              Run Details
            </h2>
            <p className="text-xs mb-5" style={{ color: '#6B7280' }}>
              <Clock className="w-3 h-3" />
              Enter date and time for this production run
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Date
                </Label>
                <Input type="date" value={form.tgl}
                  onChange={e => setForm(f => ({ ...f, tgl: e.target.value }))}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Start Time
                </Label>
                <Input type="time" value={form.start}
                  onChange={e => setField('start', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Stop Time
                </Label>
                <Input type="time" value={form.stop}
                  onChange={e => setField('stop', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  RPM
                </Label>
                <Input type="number" step="0.1" value={form.rpm}
                  onChange={e => setField('rpm', e.target.value)}
                  placeholder="e.g. 650" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Mtr / Min
                </Label>
                <Input type="number" step="0.01" value={form.mtr_per_min}
                  onChange={e => setField('mtr_per_min', e.target.value)}
                  placeholder="e.g. 45.5"
                  className="h-9 text-sm font-mono" />
              </div>
            </div>
            {/* Computed totalPutusan display */}
            {(() => {
              const totalPutusan = form.beams
                .filter(b => b.putusan)
                .reduce((s, b) => s + parseInt(b.putusan || '0'), 0);
              return (
                <div className="flex items-center gap-2 text-sm mt-4">
                  <span className="text-zinc-500">Total Putusan:</span>
                  <span className="font-mono font-semibold" style={{ color: '#3D4852' }}>
                    {totalPutusan}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Section 2: Beams */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: '#3D4852' }}>
                Beams
                <span className="ml-1 text-xs font-normal" style={{ color: '#6B7280' }}>
                  ({form.beams.length})
                </span>
              </h2>
              <Button type="button" variant="outline" size="sm"
                onClick={addBeam} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Beam
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-1">
                <p className="col-span-1 text-xs" style={{ color: '#6B7280' }}>#</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Beam No.</p>
                <p className="col-span-3 text-xs font-medium
                  text-zinc-500">Panjang (m)</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Jumlah Ends</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Putusan</p>
                <p className="col-span-2" />
              </div>

              {form.beams.map((beam, i) => (
                <div key={i}
                  className="grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-1 text-xs" style={{ color: '#6B7280' }}>
                    {i + 1}
                  </span>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={beam.beam_number}
                      onChange={e =>
                        setBeamField(i, 'beam_number', e.target.value)
                      }
                      placeholder="e.g. 68"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.1"
                      value={beam.panjang_beam}
                      onChange={e =>
                        setBeamField(i, 'panjang_beam', e.target.value)
                      }
                      placeholder="e.g. 1200"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={beam.jumlah_ends}
                      onChange={e =>
                        setBeamField(i, 'jumlah_ends', e.target.value)
                      }
                      placeholder="e.g. 4760"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Breaks"
                      value={beam.putusan}
                      onChange={e =>
                        setBeamField(i, 'putusan', e.target.value)
                      }
                      className="h-8 text-sm w-20 font-mono"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {form.beams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeam(i)}
                        className="hover:text-red-400"
                        style={{ color: '#6B7280' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Quality & Machine */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#3D4852' }}>
              Quality & Machine
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Machine No.
                </Label>
                <Input type="number" value={form.no_mc}
                  onChange={e => setField('no_mc', e.target.value)}
                  placeholder="e.g. 1"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Elongasi %
                </Label>
                <Input type="number" step="0.01" value={form.elongasi}
                  onChange={e => setField('elongasi', e.target.value)}
                  placeholder="e.g. 1.5"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Strength
                </Label>
                <Input type="number" step="0.01" value={form.strength}
                  onChange={e => setField('strength', e.target.value)}
                  placeholder="e.g. 3.5"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  CV%
                </Label>
                <Input type="number" step="0.01" value={form.cv_pct}
                  onChange={e => setField('cv_pct', e.target.value)}
                  placeholder="e.g. 2.1"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Tension Badan
                </Label>
                <Input type="number" value={form.tension_badan}
                  onChange={e => setField('tension_badan', e.target.value)}
                  placeholder="e.g. 45"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Tension Pinggir
                </Label>
                <Input type="number" value={form.tension_pinggir}
                  onChange={e => setField('tension_pinggir', e.target.value)}
                  placeholder="e.g. 40"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Lebar Creel
                </Label>
                <Input type="number" value={form.lebar_creel}
                  onChange={e => setField('lebar_creel', e.target.value)}
                  placeholder="e.g. 180"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Jam
                </Label>
                <Input type="number" step="0.1" value={form.jam}
                  onChange={e => setField('jam', e.target.value)}
                  placeholder="e.g. 8.5"
                  className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Submit row */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline"
              onClick={() => router.back()}
              style={{ background: '#E0E5EC', color: '#6B7280', border: 'none', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              style={{ background: '#6C63FF', color: '#fff', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...</>
              ) : isEditMode ? 'Save Changes' : 'Submit Warping'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

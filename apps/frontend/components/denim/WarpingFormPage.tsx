'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  start: string;
  stop: string;
  rpm: string;
  mtr_per_min: string;
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
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<WarpingFormState>({
    start: '',
    stop: '',
    rpm: '',
    mtr_per_min: '',
    beams: [emptyBeam()],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch(
          `/denim/sales-contracts/${kp}`
        ) as any;
        setSc(data);
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp]);

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
      await authFetch('/denim/warping', {
        method: 'POST',
        body: JSON.stringify({
          kp,
          start: form.start || null,
          stop: form.stop || null,
          rpm: form.rpm ? parseFloat(form.rpm) : null,
          mtr_per_min: form.mtr_per_min
            ? parseFloat(form.mtr_per_min) : null,
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to save warping data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSc) {
    return (
      <div className="px-8 py-8 space-y-4">
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
        <div className="px-8 pb-8 space-y-5">

          {/* Section 1: Run details */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-1
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">1</span>
              Run Details
            </h2>
            <p className="text-xs text-zinc-400 mb-5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Date and time recorded automatically on submit
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Start Time
                </Label>
                <Input type="time" value={form.start}
                  onChange={e => setField('start', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Stop Time
                </Label>
                <Input type="time" value={form.stop}
                  onChange={e => setField('stop', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  RPM
                </Label>
                <Input type="number" step="0.1" value={form.rpm}
                  onChange={e => setField('rpm', e.target.value)}
                  placeholder="e.g. 650" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
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
                  <span className="font-mono font-semibold text-zinc-800">
                    {totalPutusan}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Section 2: Beams */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-zinc-800
                flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600
                  text-white text-xs flex items-center justify-center
                  font-bold">2</span>
                Beams
                <span className="ml-1 text-xs font-normal
                  text-zinc-400">
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
                <p className="col-span-1 text-xs text-zinc-400">#</p>
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
                  <span className="col-span-1 text-xs text-zinc-400
                    font-mono text-center">
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
                        className="text-zinc-300 hover:text-red-400
                          transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit row */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline"
              onClick={() => router.back()}
              className="text-zinc-500">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white
                min-w-32">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...</>
              ) : 'Submit Warping'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

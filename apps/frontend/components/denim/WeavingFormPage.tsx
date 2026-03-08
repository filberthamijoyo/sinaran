'use client';

import { useEffect, useState, useMemo } from 'react';
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

interface LoomRow {
  no_mesin: string;
  beam_no: string;
  pick_actual: string;
  meter_out: string;
  efficiency: string;
  keterangan: string;
}

interface WeavingFormState {
  shift: string;
  looms: LoomRow[];
}

const emptyLoom = (): LoomRow => ({
  no_mesin: '',
  beam_no: '',
  pick_actual: '',
  meter_out: '',
  efficiency: '',
  keterangan: '',
});

export default function WeavingFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<WeavingFormState>({
    shift: '',
    looms: [emptyLoom()],
  });

  // Auto-calculate total meters
  const totalMeterOut = useMemo(() => {
    return form.looms.reduce((sum, loom) => {
      const meters = parseFloat(loom.meter_out) || 0;
      return sum + meters;
    }, 0);
  }, [form.looms]);

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

  const setField = (key: keyof WeavingFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const setLoomField = (
    index: number,
    key: keyof LoomRow,
    value: string
  ) => {
    setForm(f => {
      const looms = [...f.looms];
      looms[index] = { ...looms[index], [key]: value };
      return { ...f, looms };
    });
  };

  const addLoom = () =>
    setForm(f => ({ ...f, looms: [...f.looms, emptyLoom()] }));

  const removeLoom = (index: number) =>
    setForm(f => ({
      ...f,
      looms: f.looms.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLooms = form.looms.filter(l => l.no_mesin.trim());
    if (validLooms.length === 0) {
      toast.error('Add at least one loom/machine.');
      return;
    }
    setSubmitting(true);
    try {
      await authFetch('/denim/weaving', {
        method: 'POST',
        body: JSON.stringify({
          kp,
          shift: form.shift || null,
          looms: validLooms.map(l => ({
            no_mesin: parseInt(l.no_mesin),
            beam_no: l.beam_no ? parseInt(l.beam_no) : null,
            pick_actual: l.pick_actual ? parseInt(l.pick_actual) : null,
            meter_out: l.meter_out ? parseFloat(l.meter_out) : null,
            efficiency: l.efficiency ? parseFloat(l.efficiency) : null,
            keterangan: l.keterangan || null,
          })),
          total_meter_out: totalMeterOut || null,
        }),
      });
      toast.success(`Weaving saved for KP ${kp}. Moved to Inspect Gray.`);
      router.push('/denim/inbox/weaving');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save weaving data.');
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
        title={`Weaving — ${kp}`}
        subtitle="Fill in weaving production data"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="WEAVING"
      />

      <form onSubmit={handleSubmit}>
        <div className="px-8 pb-8 space-y-5">

          {/* Section 1: Run Details */}
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
                  Shift
                </Label>
                <select
                  value={form.shift}
                  onChange={e => setField('shift', e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-zinc-200 
                    rounded-md focus:outline-none focus:ring-2 
                    focus:ring-blue-500 bg-white"
                >
                  <option value="">Select shift...</option>
                  <option value="Pagi">Pagi</option>
                  <option value="Sore">Sore</option>
                  <option value="Malam">Malam</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Loom Data */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-zinc-800
                flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600
                  text-white text-xs flex items-center justify-center
                  font-bold">2</span>
                Loom / Machine Data
                <span className="ml-1 text-xs font-normal
                  text-zinc-400">
                  ({form.looms.length})
                </span>
              </h2>
              <Button type="button" variant="outline" size="sm"
                onClick={addLoom} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Loom
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-1">
                <p className="col-span-1 text-xs text-zinc-400">#</p>
                <p className="col-span-1 text-xs font-medium
                  text-zinc-500">Machine</p>
                <p className="col-span-1 text-xs font-medium
                  text-zinc-500">Beam</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Pick Actual</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Meters Out</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Efficiency %</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Notes</p>
                <p className="col-span-1" />
              </div>

              {form.looms.map((loom, i) => (
                <div key={i}
                  className="grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-1 text-xs text-zinc-400
                    font-mono text-center">
                    {i + 1}
                  </span>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={loom.no_mesin}
                      onChange={e =>
                        setLoomField(i, 'no_mesin', e.target.value)
                      }
                      placeholder="e.g. 1"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={loom.beam_no}
                      onChange={e =>
                        setLoomField(i, 'beam_no', e.target.value)
                      }
                      placeholder="e.g. 1"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={loom.pick_actual}
                      onChange={e =>
                        setLoomField(i, 'pick_actual', e.target.value)
                      }
                      placeholder="e.g. 42"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={loom.meter_out}
                      onChange={e =>
                        setLoomField(i, 'meter_out', e.target.value)
                      }
                      placeholder="e.g. 1200"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={loom.efficiency}
                      onChange={e =>
                        setLoomField(i, 'efficiency', e.target.value)
                      }
                      placeholder="e.g. 85"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={loom.keterangan}
                      onChange={e =>
                        setLoomField(i, 'keterangan', e.target.value)
                      }
                      placeholder="Defects, notes..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.looms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLoom(i)}
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

          {/* Section 3: Summary */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-5
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">3</span>
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Total Meters Output
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalMeterOut || ''}
                  readOnly
                  className="h-9 text-sm font-mono bg-zinc-50 
                    border-zinc-200"
                  placeholder="Auto-calculated"
                />
              </div>
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
              ) : 'Submit Weaving'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

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

interface RollRow {
  no_roll: string;
  panjang: string;
  lebar: string;
  berat: string;
  grade: string;
  cacat: string;
}

interface InspectGrayFormState {
  inspector_name: string;
  rolls: RollRow[];
}

const emptyRoll = (): RollRow => ({
  no_roll: '',
  panjang: '',
  lebar: '',
  berat: '',
  grade: '',
  cacat: '',
});

export default function InspectGrayFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<InspectGrayFormState>({
    inspector_name: '',
    rolls: [emptyRoll()],
  });

  // Auto-calculate summary statistics
  const summary = useMemo(() => {
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    return {
      totalRolls: validRolls.length,
      totalPanjang: validRolls.reduce((sum, r) => sum + (parseFloat(r.panjang) || 0), 0),
      totalBerat: validRolls.reduce((sum, r) => sum + (parseFloat(r.berat) || 0), 0),
      gradeACount: validRolls.filter(r => r.grade === 'A').length,
      gradeBCount: validRolls.filter(r => r.grade === 'B').length,
      gradeCCount: validRolls.filter(r => r.grade === 'C').length,
      rejectCount: validRolls.filter(r => r.grade === 'Reject').length,
    };
  }, [form.rolls]);

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

  const setField = (key: keyof InspectGrayFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const setRollField = (
    index: number,
    key: keyof RollRow,
    value: string
  ) => {
    setForm(f => {
      const rolls = [...f.rolls];
      rolls[index] = { ...rolls[index], [key]: value };
      return { ...f, rolls };
    });
  };

  const addRoll = () =>
    setForm(f => ({ ...f, rolls: [...f.rolls, emptyRoll()] }));

  const removeRoll = (index: number) =>
    setForm(f => ({
      ...f,
      rolls: f.rolls.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRolls = form.rolls.filter(r => r.no_roll.trim());
    if (validRolls.length === 0) {
      toast.error('Add at least one roll.');
      return;
    }
    setSubmitting(true);
    try {
      await authFetch('/denim/inspect-gray', {
        method: 'POST',
        body: JSON.stringify({
          kp,
          inspector_name: form.inspector_name || null,
          rolls: validRolls.map(r => ({
            no_roll: parseInt(r.no_roll),
            panjang: r.panjang ? parseFloat(r.panjang) : null,
            lebar: r.lebar ? parseFloat(r.lebar) : null,
            berat: r.berat ? parseFloat(r.berat) : null,
            grade: r.grade || null,
            cacat: r.cacat || null,
          })),
        }),
      });
      toast.success(`Inspection complete for KP ${kp}. Order marked Complete.`);
      router.push('/denim/inbox/inspect-gray');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save inspection data.');
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
        title={`Inspect Gray — ${kp}`}
        subtitle="Fill in gray fabric inspection data"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="INSPECT_GRAY"
      />

      <form onSubmit={handleSubmit}>
        <div className="px-8 pb-8 space-y-5">

          {/* Section 1: Inspection Details */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-1
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">1</span>
              Inspection Details
            </h2>
            <p className="text-xs text-zinc-400 mb-5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Date and time recorded automatically on submit
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Inspector Name
                </Label>
                <Input type="text" value={form.inspector_name}
                  onChange={e => setField('inspector_name', e.target.value)}
                  placeholder="Inspector name"
                  className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Section 2: Roll-by-Roll Inspection */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-zinc-800
                flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600
                  text-white text-xs flex items-center justify-center
                  font-bold">2</span>
                Roll-by-Roll Inspection
                <span className="ml-1 text-xs font-normal
                  text-zinc-400">
                  ({form.rolls.length})
                </span>
              </h2>
              <Button type="button" variant="outline" size="sm"
                onClick={addRoll} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Roll
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-1">
                <p className="col-span-1 text-xs text-zinc-400">#</p>
                <p className="col-span-1 text-xs font-medium
                  text-zinc-500">Roll No.</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Length (m)</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Width (cm)</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Weight (kg)</p>
                <p className="col-span-1 text-xs font-medium
                  text-zinc-500">Grade</p>
                <p className="col-span-2 text-xs font-medium
                  text-zinc-500">Defects</p>
                <p className="col-span-1" />
              </div>

              {form.rolls.map((roll, i) => (
                <div key={i}
                  className="grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-1 text-xs text-zinc-400
                    font-mono text-center">
                    {i + 1}
                  </span>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={roll.no_roll}
                      onChange={e =>
                        setRollField(i, 'no_roll', e.target.value)
                      }
                      placeholder="e.g. 1"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={roll.panjang}
                      onChange={e =>
                        setRollField(i, 'panjang', e.target.value)
                      }
                      placeholder="e.g. 50"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={roll.lebar}
                      onChange={e =>
                        setRollField(i, 'lebar', e.target.value)
                      }
                      placeholder="e.g. 150"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={roll.berat}
                      onChange={e =>
                        setRollField(i, 'berat', e.target.value)
                      }
                      placeholder="e.g. 25"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={roll.grade}
                      onChange={e =>
                        setRollField(i, 'grade', e.target.value)
                      }
                      className="w-full h-8 px-2 text-sm border border-zinc-200 
                        rounded-md focus:outline-none focus:ring-2 
                        focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={roll.cacat}
                      onChange={e =>
                        setRollField(i, 'cacat', e.target.value)
                      }
                      placeholder="Defect notes..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.rolls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoll(i)}
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
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4 text-center
                border border-zinc-100">
                <p className="text-xs text-zinc-500 mb-1">Total Rolls</p>
                <p className="text-2xl font-bold text-zinc-800">
                  {summary.totalRolls}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center
                border border-zinc-100">
                <p className="text-xs text-zinc-500 mb-1">Total Length</p>
                <p className="text-2xl font-bold text-zinc-800">
                  {summary.totalPanjang.toLocaleString(undefined, {
                    maximumFractionDigits: 1
                  })}
                </p>
                <p className="text-xs text-zinc-400">m</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4 text-center
                border border-zinc-100">
                <p className="text-xs text-zinc-500 mb-1">Total Weight</p>
                <p className="text-2xl font-bold text-zinc-800">
                  {summary.totalBerat.toLocaleString(undefined, {
                    maximumFractionDigits: 1
                  })}
                </p>
                <p className="text-xs text-zinc-400">kg</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center
                border border-green-100">
                <p className="text-xs text-green-600 mb-1">Grade A</p>
                <p className="text-2xl font-bold text-green-700">
                  {summary.gradeACount}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center
                border border-yellow-100">
                <p className="text-xs text-yellow-600 mb-1">Grade B</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.gradeBCount}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center
                border border-red-100">
                <p className="text-xs text-red-600 mb-1">Reject</p>
                <p className="text-2xl font-bold text-red-700">
                  {summary.rejectCount}
                </p>
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
              ) : 'Complete Inspection'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

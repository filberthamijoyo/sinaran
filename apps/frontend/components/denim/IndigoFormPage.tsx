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
import { Clock, Loader2 } from 'lucide-react';
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

interface IndigoFormState {
  start: string;
  stop: string;
  jumlah_rope: string;
  panjang_rope: string;
  bak_count: string;
  indigo_conc: string;
  indigo_bak: string;
  has_sulfur: boolean;
  sulfur_conc: string;
  sulfur_bak: string;
  total_meters: string;
  keterangan: string;
}

export default function IndigoFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<IndigoFormState>({
    start: '',
    stop: '',
    jumlah_rope: '',
    panjang_rope: '',
    bak_count: '',
    indigo_conc: '',
    indigo_bak: '',
    has_sulfur: false,
    sulfur_conc: '',
    sulfur_bak: '',
    total_meters: '',
    keterangan: '',
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

  const setField = (key: keyof IndigoFormState, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authFetch('/denim/indigo', {
        method: 'POST',
        body: JSON.stringify({
          kp,
          start: form.start || null,
          stop: form.stop || null,
          jumlah_rope: form.jumlah_rope ? parseInt(form.jumlah_rope) : null,
          panjang_rope: form.panjang_rope ? parseFloat(form.panjang_rope) : null,
          bak_count: form.bak_count ? parseInt(form.bak_count) : null,
          indigo_conc: form.indigo_conc ? parseFloat(form.indigo_conc) : null,
          indigo_bak: form.indigo_bak ? parseInt(form.indigo_bak) : null,
          has_sulfur: form.has_sulfur,
          sulfur_conc: form.has_sulfur && form.sulfur_conc ? parseFloat(form.sulfur_conc) : null,
          sulfur_bak: form.has_sulfur && form.sulfur_bak ? parseInt(form.sulfur_bak) : null,
          total_meters: form.total_meters ? parseInt(form.total_meters) : null,
          keterangan: form.keterangan || null,
        }),
      });
      toast.success(`Indigo saved for KP ${kp}. Moved to Weaving.`);
      router.push('/denim/inbox/indigo');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save indigo data.');
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
        title={`Indigo — ${kp}`}
        subtitle="Fill in indigo dyeing production data"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="INDIGO"
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
            </div>
          </div>

          {/* Section 2: Rope Details */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-5
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">2</span>
              Rope Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Number of Ropes
                </Label>
                <Input type="number" value={form.jumlah_rope}
                  onChange={e => setField('jumlah_rope', e.target.value)}
                  placeholder="e.g. 12" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Length per Rope (m)
                </Label>
                <Input type="number" step="0.01" value={form.panjang_rope}
                  onChange={e => setField('panjang_rope', e.target.value)}
                  placeholder="e.g. 1500" className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Section 3: Dye Bath (Indigo) */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-5
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">3</span>
              Dye Bath — Indigo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Number of Baths (Bak)
                </Label>
                <Input type="number" value={form.bak_count}
                  onChange={e => setField('bak_count', e.target.value)}
                  placeholder="e.g. 16" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Indigo Concentration (g/L)
                </Label>
                <Input type="number" step="0.01" value={form.indigo_conc}
                  onChange={e => setField('indigo_conc', e.target.value)}
                  placeholder="e.g. 20" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Indigo Bath Number
                </Label>
                <Input type="number" value={form.indigo_bak}
                  onChange={e => setField('indigo_bak', e.target.value)}
                  placeholder="e.g. 1" className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Section 4: Dye Bath (Sulfur) */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">4</span>
              <h2 className="text-sm font-semibold text-zinc-800">
                Dye Bath — Sulfur
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_sulfur}
                  onChange={e => setField('has_sulfur', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-700">Has Sulfur Bath?</span>
              </label>
              
              {form.has_sulfur && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-6 border-l-2 border-zinc-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">
                      Sulfur Concentration
                    </Label>
                    <Input type="number" step="0.01" value={form.sulfur_conc}
                      onChange={e => setField('sulfur_conc', e.target.value)}
                      placeholder="e.g. 50" className="h-9 text-sm font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">
                      Sulfur Bath Number
                    </Label>
                    <Input type="number" value={form.sulfur_bak}
                      onChange={e => setField('sulfur_bak', e.target.value)}
                      placeholder="e.g. 1" className="h-9 text-sm font-mono" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Output */}
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-800 mb-5
              flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600
                text-white text-xs flex items-center justify-center
                font-bold">5</span>
              Output
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Total Meters Output
                </Label>
                <Input type="number" value={form.total_meters}
                  onChange={e => setField('total_meters', e.target.value)}
                  placeholder="e.g. 15000" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Notes
                </Label>
                <textarea
                  value={form.keterangan}
                  onChange={e => setField('keterangan', e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm 
                    border border-zinc-200 rounded-md resize-y
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              ) : 'Submit Indigo'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

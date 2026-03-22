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
  tgl: string;
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
  // Process Parameters
  mc: string;
  speed: string;
  bak_celup: string;
  bb: string;
  p: string;
  te: string;
  // Full Chemistry
  strength: string;
  elongasi: string;
  moisture_mahlo: string;
  temp_dryer: string;
  indigo: string;
  caustic: string;
  hydro: string;
  ne: string;
  konst_idg: string;
  konst_sulfur: string;
  visc: string;
  mc_idg: string;
  strength_val: string;
  elongasi_idg: string;
  cv_pct: string;
  tenacity: string;
}

export default function IndigoFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChemistry, setShowChemistry] = useState(false);

  const [form, setForm] = useState<IndigoFormState>({
    tgl: new Date().toISOString().split('T')[0],
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
    // Process Parameters
    mc: '',
    speed: '',
    bak_celup: '',
    bb: '',
    p: '',
    te: '',
    // Full Chemistry
    strength: '',
    elongasi: '',
    moisture_mahlo: '',
    temp_dryer: '',
    indigo: '',
    caustic: '',
    hydro: '',
    ne: '',
    konst_idg: '',
    konst_sulfur: '',
    visc: '',
    mc_idg: '',
    strength_val: '',
    elongasi_idg: '',
    cv_pct: '',
    tenacity: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Load SC data
        const data = await authFetch(
          `/denim/sales-contracts/${kp}`
        ) as any;
        setSc(data);

        // If in edit mode, load existing indigo data
        if (isEditMode) {
          const pipelineData = await authFetch(
            `/denim/pipeline/${kp}`
          ) as any;
          if (pipelineData?.indigo_run) {
            const w = pipelineData.indigo_run;
            setForm(f => ({
              ...f,
              tgl: w.tgl ? new Date(w.tgl).toISOString().split('T')[0] : f.tgl,
              start: w.start || '',
              stop: w.stop || '',
              jumlah_rope: w.jumlah_rope?.toString() || '',
              panjang_rope: w.panjang_rope?.toString() || '',
              bak_count: w.bak_count?.toString() || '',
              indigo_conc: w.indigo_conc?.toString() || '',
              indigo_bak: w.indigo_bak?.toString() || '',
              has_sulfur: !!w.sulfur_conc || !!w.sulfur_bak,
              sulfur_conc: w.sulfur_conc?.toString() || '',
              sulfur_bak: w.sulfur_bak?.toString() || '',
              total_meters: w.total_meters?.toString() || '',
              keterangan: w.keterangan || '',
              // Process Parameters
              mc: w.mc?.toString() || '',
              speed: w.speed?.toString() || '',
              bak_celup: w.bak_celup?.toString() || '',
              bb: w.bb?.toString() || '',
              p: w.p?.toString() || '',
              te: w.te?.toString() || '',
              // Full Chemistry
              strength: w.strength?.toString() || '',
              elongasi: w.elongasi?.toString() || '',
              moisture_mahlo: w.moisture_mahlo?.toString() || '',
              temp_dryer: w.temp_dryer?.toString() || '',
              indigo: w.indigo?.toString() || '',
              caustic: w.caustic?.toString() || '',
              hydro: w.hydro?.toString() || '',
              ne: w.ne || '',
              konst_idg: w.konst_idg?.toString() || '',
              konst_sulfur: w.konst_sulfur?.toString() || '',
              visc: w.visc?.toString() || '',
              mc_idg: w.mc_idg || '',
              strength_val: w.strength?.toString() || '',
              elongasi_idg: w.elongasi_idg?.toString() || '',
              cv_pct: w.cv_pct?.toString() || '',
              tenacity: w.tenacity?.toString() || '',
            }));
            // Show chemistry section if there's data
            if (w.indigo || w.caustic || w.hydro || w.strength) {
              setShowChemistry(true);
            }
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

  const setField = (key: keyof IndigoFormState, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode) {
        // PUT to update existing indigo data without advancing pipeline
        await authFetch(`/denim/indigo/${kp}`, {
          method: 'PUT',
          body: JSON.stringify({
            kp,
            tgl: form.tgl || null,
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
            // Process Parameters
            mc: form.mc ? parseInt(form.mc) : null,
            speed: form.speed ? parseFloat(form.speed) : null,
            bak_celup: form.bak_celup ? parseFloat(form.bak_celup) : null,
            bb: form.bb ? parseFloat(form.bb) : null,
            p: form.p ? parseFloat(form.p) : null,
            te: form.te ? parseFloat(form.te) : null,
            // Full Chemistry
            strength: form.strength ? parseFloat(form.strength) : null,
            elongasi: form.elongasi ? parseFloat(form.elongasi) : null,
            moisture_mahlo: form.moisture_mahlo ? parseFloat(form.moisture_mahlo) : null,
            temp_dryer: form.temp_dryer ? parseFloat(form.temp_dryer) : null,
            indigo: form.indigo ? parseFloat(form.indigo) : null,
            caustic: form.caustic ? parseFloat(form.caustic) : null,
            hydro: form.hydro ? parseFloat(form.hydro) : null,
            ne: form.ne || null,
            konst_idg: form.konst_idg ? parseFloat(form.konst_idg) : null,
            konst_sulfur: form.konst_sulfur ? parseFloat(form.konst_sulfur) : null,
            visc: form.visc ? parseFloat(form.visc) : null,
            mc_idg: form.mc_idg || null,
            strength_val: form.strength_val ? parseFloat(form.strength_val) : null,
            elongasi_idg: form.elongasi_idg ? parseFloat(form.elongasi_idg) : null,
            cv_pct: form.cv_pct ? parseFloat(form.cv_pct) : null,
            tenacity: form.tenacity ? parseFloat(form.tenacity) : null,
          }),
        });
        toast.success(`Indigo updated for KP ${kp}.`);
        router.push(`/denim/admin/orders/${kp}`);
      } else {
        // POST to create new indigo data and advance pipeline
        await authFetch('/denim/indigo', {
          method: 'POST',
          body: JSON.stringify({
            kp,
            tgl: form.tgl || null,
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
            // Process Parameters
            mc: form.mc ? parseInt(form.mc) : null,
            speed: form.speed ? parseFloat(form.speed) : null,
            bak_celup: form.bak_celup ? parseFloat(form.bak_celup) : null,
            bb: form.bb ? parseFloat(form.bb) : null,
            p: form.p ? parseFloat(form.p) : null,
            te: form.te ? parseFloat(form.te) : null,
            // Full Chemistry
            strength: form.strength ? parseFloat(form.strength) : null,
            elongasi: form.elongasi ? parseFloat(form.elongasi) : null,
            moisture_mahlo: form.moisture_mahlo ? parseFloat(form.moisture_mahlo) : null,
            temp_dryer: form.temp_dryer ? parseFloat(form.temp_dryer) : null,
            indigo: form.indigo ? parseFloat(form.indigo) : null,
            caustic: form.caustic ? parseFloat(form.caustic) : null,
            hydro: form.hydro ? parseFloat(form.hydro) : null,
            ne: form.ne || null,
            konst_idg: form.konst_idg ? parseFloat(form.konst_idg) : null,
            konst_sulfur: form.konst_sulfur ? parseFloat(form.konst_sulfur) : null,
            visc: form.visc ? parseFloat(form.visc) : null,
            mc_idg: form.mc_idg || null,
            strength_val: form.strength_val ? parseFloat(form.strength_val) : null,
            elongasi_idg: form.elongasi_idg ? parseFloat(form.elongasi_idg) : null,
            cv_pct: form.cv_pct ? parseFloat(form.cv_pct) : null,
            tenacity: form.tenacity ? parseFloat(form.tenacity) : null,
          }),
        });
        toast.success(`Indigo saved for KP ${kp}. Moved to Weaving.`);
        router.push('/denim/inbox/indigo');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save indigo data.');
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
        <div className="px-4 sm:px-8 pb-8 space-y-5">

          {/* Section 1: Run Details */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#3D4852' }}
              >Run Details</h2>
            <p className="text-xs mb-5 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
              <Clock className="w-3 h-3" />
              Enter date and time for this production run
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Date
                </Label>
                <Input type="date" value={form.tgl}
                  onChange={e => setForm(f => ({ ...f, tgl: e.target.value }))}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Start Time
                </Label>
                <Input type="time" value={form.start}
                  onChange={e => setField('start', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Stop Time
                </Label>
                <Input type="time" value={form.stop}
                  onChange={e => setField('stop', e.target.value)}
                  className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Section 2: Rope Details */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#3D4852' }}
              >Rope Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Number of Ropes
                </Label>
                <Input type="number" value={form.jumlah_rope}
                  onChange={e => setField('jumlah_rope', e.target.value)}
                  placeholder="e.g. 12" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Length per Rope (m)
                </Label>
                <Input type="number" step="0.01" value={form.panjang_rope}
                  onChange={e => setField('panjang_rope', e.target.value)}
                  placeholder="e.g. 1500" className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Section 3: Process Parameters */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#3D4852' }}
              >Process Parameters</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Machine No.
                </Label>
                <Input type="number" value={form.mc}
                  onChange={e => setField('mc', e.target.value)}
                  placeholder="e.g. 1"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Speed
                </Label>
                <Input type="number" step="0.01" value={form.speed}
                  onChange={e => setField('speed', e.target.value)}
                  placeholder="e.g. 50"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Bak Celup
                </Label>
                <Input type="number" step="0.01" value={form.bak_celup}
                  onChange={e => setField('bak_celup', e.target.value)}
                  placeholder="e.g. 4"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  BB
                </Label>
                <Input type="number" step="0.01" value={form.bb}
                  onChange={e => setField('bb', e.target.value)}
                  placeholder="e.g. 10"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  P
                </Label>
                <Input type="number" step="0.01" value={form.p}
                  onChange={e => setField('p', e.target.value)}
                  placeholder="e.g. 0.8"
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  TE
                </Label>
                <Input type="number" step="0.01" value={form.te}
                  onChange={e => setField('te', e.target.value)}
                  placeholder="e.g. 4.5"
                  className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Section 4: Dye Bath (Indigo) */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#3D4852' }}
              >Dye Bath — Indigo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Number of Baths (Bak)
                </Label>
                <Input type="number" value={form.bak_count}
                  onChange={e => setField('bak_count', e.target.value)}
                  placeholder="e.g. 16" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Indigo Concentration (g/L)
                </Label>
                <Input type="number" step="0.01" value={form.indigo_conc}
                  onChange={e => setField('indigo_conc', e.target.value)}
                  placeholder="e.g. 20" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Indigo Bath Number
                </Label>
                <Input type="number" value={form.indigo_bak}
                  onChange={e => setField('indigo_bak', e.target.value)}
                  placeholder="e.g. 1" className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>

          {/* Section 5: Dye Bath (Sulfur) */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-semibold" style={{ color: '#3D4852' }}>
                Dye Bath — Sulfur
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_sulfur}
                  onChange={e => setField('has_sulfur', e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: '#6C63FF' }}
                />
                <span className="text-sm" style={{ color: '#3D4852' }}>Has Sulfur Bath?</span>
              </label>
              
              {form.has_sulfur && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-6" style={{ borderLeft: '2px solid rgb(163 177 198 / 0.4)' }}>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                      Sulfur Concentration
                    </Label>
                    <Input type="number" step="0.01" value={form.sulfur_conc}
                      onChange={e => setField('sulfur_conc', e.target.value)}
                      placeholder="e.g. 50" className="h-9 text-sm font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
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

          {/* Section 6: Output */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#3D4852' }}
              >Output</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Total Meters Output
                </Label>
                <Input type="number" value={form.total_meters}
                  onChange={e => setField('total_meters', e.target.value)}
                  placeholder="e.g. 15000" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  Notes
                </Label>
                <textarea
                  value={form.keterangan}
                  onChange={e => setField('keterangan', e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-[16px] resize-y"
                  style={{
                    background: '#E0E5EC',
                    color: '#3D4852',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    border: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 7: Full Chemistry (Collapsible) */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowChemistry(!showChemistry)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-sm font-semibold" style={{ color: '#3D4852' }}>
                Full Chemistry
              </h2>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                {showChemistry ? 'Hide chemistry fields ▴' : 'Show chemistry fields ▾'}
              </span>
            </button>

            {showChemistry && (
              <div className="mt-5 space-y-6">
                {/* Quality Parameters */}
                <div>
                  <h3 className="text-xs font-semibold mb-3" style={{ color: '#9CA3AF' }}>Quality Parameters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Strength</Label>
                      <Input type="number" step="0.01" value={form.strength}
                        onChange={e => setField('strength', e.target.value)}
                        placeholder="e.g. 3.5" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Elongasi %</Label>
                      <Input type="number" step="0.01" value={form.elongasi}
                        onChange={e => setField('elongasi', e.target.value)}
                        placeholder="e.g. 5.2" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Moisture Mahlo</Label>
                      <Input type="number" step="0.01" value={form.moisture_mahlo}
                        onChange={e => setField('moisture_mahlo', e.target.value)}
                        placeholder="e.g. 7.5" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Temp Dryer</Label>
                      <Input type="number" step="0.01" value={form.temp_dryer}
                        onChange={e => setField('temp_dryer', e.target.value)}
                        placeholder="e.g. 120" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Strength Val</Label>
                      <Input type="number" step="0.01" value={form.strength_val}
                        onChange={e => setField('strength_val', e.target.value)}
                        placeholder="e.g. 3.2" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Elongasi IDG</Label>
                      <Input type="number" step="0.01" value={form.elongasi_idg}
                        onChange={e => setField('elongasi_idg', e.target.value)}
                        placeholder="e.g. 5.0" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>CV%</Label>
                      <Input type="number" step="0.01" value={form.cv_pct}
                        onChange={e => setField('cv_pct', e.target.value)}
                        placeholder="e.g. 2.1" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Tenacity</Label>
                      <Input type="number" step="0.01" value={form.tenacity}
                        onChange={e => setField('tenacity', e.target.value)}
                        placeholder="e.g. 4.8" className="h-9 text-sm font-mono" />
                    </div>
                  </div>
                </div>

                {/* Indigo Chemistry */}
                <div>
                  <h3 className="text-xs font-semibold mb-3" style={{ color: '#9CA3AF' }}>Indigo Chemistry</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Indigo</Label>
                      <Input type="number" step="0.01" value={form.indigo}
                        onChange={e => setField('indigo', e.target.value)}
                        placeholder="e.g. 20" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Caustic</Label>
                      <Input type="number" step="0.01" value={form.caustic}
                        onChange={e => setField('caustic', e.target.value)}
                        placeholder="e.g. 50" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Hydro</Label>
                      <Input type="number" step="0.01" value={form.hydro}
                        onChange={e => setField('hydro', e.target.value)}
                        placeholder="e.g. 5" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>NE</Label>
                      <Input type="text" value={form.ne}
                        onChange={e => setField('ne', e.target.value)}
                        placeholder="e.g. 20/1"
                        className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Konst IDG</Label>
                      <Input type="number" step="0.01" value={form.konst_idg}
                        onChange={e => setField('konst_idg', e.target.value)}
                        placeholder="e.g. 1.0" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Konst Sulfur</Label>
                      <Input type="number" step="0.01" value={form.konst_sulfur}
                        onChange={e => setField('konst_sulfur', e.target.value)}
                        placeholder="e.g. 1.2" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Visc</Label>
                      <Input type="number" step="0.01" value={form.visc}
                        onChange={e => setField('visc', e.target.value)}
                        placeholder="e.g. 12" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>MC IDG</Label>
                      <Input type="text" value={form.mc_idg}
                        onChange={e => setField('mc_idg', e.target.value)}
                        placeholder="e.g. M-001"
                        className="h-9 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              ) : isEditMode ? 'Save Changes' : 'Submit Indigo'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FabricSpec, FormState } from './types';

const today = () => new Date().toISOString().split('T')[0];

const initForm = (): FormState => ({
  tgl: today(),
  permintaan: '',
  status: 'SCN',
  selectedSpec: null,
  ket_warna: '',
  proses: 'PROSES',
  te: '',
  catatan: '',
  anyaman: '',
  arah: '',
});

export function OrderFormFields({ spec }: { spec: FabricSpec | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initForm());
  const [submitting, setSubmitting] = useState(false);
  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<string[]>([]);
  const [custOpen, setCustOpen] = useState(false);
  const custRef = useRef<HTMLDivElement>(null);

  // Sync when spec changes from picker
  useEffect(() => {
    if (spec) {
      setForm(f => ({
        ...f,
        selectedSpec: spec,
        ket_warna: spec.warna || '',
        te: spec.te ? String(spec.te) : '',
        anyaman: spec.anyaman || '',
        arah: spec.arah || '',
      }));
    }
  }, [spec]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) setCustOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (custQuery.length < 1) { setCustResults([]); setCustOpen(false); return; }
    const t = setTimeout(async () => {
      try {
        const data = await authFetch(
          `/denim/sales-contracts?limit=5&permintaan=${encodeURIComponent(custQuery)}`
        ) as { items?: Array<{ permintaan: string }> };
        const unique = Array.from(new Set(
          (data?.items?.map((sc: { permintaan: string }) => sc.permintaan).filter(Boolean) || []) as string[]
        ));
        setCustResults(unique);
        setCustOpen(true);
      } catch { /* empty */ }
    }, 300);
    return () => clearTimeout(t);
  }, [custQuery]);

  const setField = (key: keyof Omit<FormState, 'selectedSpec'>, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.selectedSpec) { toast.error('Please select a construction code first.'); return; }
    setSubmitting(true);
    try {
      const sp = form.selectedSpec;
      const payload = {
        tgl: form.tgl,
        permintaan: form.permintaan,
        status: form.status,
        kat_kode: sp.kat_kode,
        codename: `${sp.kons_kode} ${sp.kode} ${sp.kat_kode}`.trim(),
        kode: sp.kode,
        kons_kode: sp.kons_kode,
        ket_warna: form.ket_warna,
        proses: form.proses,
        te: form.te ? parseInt(form.te) : sp.te,
        catatan: form.catatan,
        pipeline_status: 'PENDING_APPROVAL',
        ne_lusi: sp.lusi_ne,
        ne_pakan: sp.pakan_ne,
        sisir: sp.sisir,
        pick: sp.pick,
        anyaman: form.anyaman,
        arah: form.arah,
        oz_g: sp.oz_g,
        oz_f: sp.oz_f,
      };
      await authFetch('/denim/sales-contracts', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Order submitted for approval.');
      router.push('/denim/my-orders');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit order.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const effectiveTE = form.te || spec?.te?.toLocaleString() || '—';
  const effectiveKonstruksi = spec?.kode || '—';

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: form sections */}
        <div className="flex-1 space-y-3">
          {/* Order Details */}
          <div className="rounded-[32px] p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#181C20' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: '#0061A4', color: '#fff', fontSize: '10px' }}>1</span>
              Order Details
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>Date</Label>
                <Input type="date" value={form.tgl} onChange={e => setField('tgl', e.target.value)} required
                  className="h-8 text-sm"
                  style={{ color: '#181C20', border: '1px solid #C1C7CE', borderRadius: '16px' }} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>Order Type</Label>
                <Select value={form.status} onValueChange={v => setField('status', v)}>
                  <SelectTrigger className="h-8 text-sm" style={{ color: '#181C20', border: '1px solid #C1C7CE', borderRadius: '16px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)', border: '1px solid #C1C7CE', borderRadius: '16px' }}>
                    <SelectItem value="PO1" style={{ color: '#181C20' }}>PO1 — Priority</SelectItem>
                    <SelectItem value="RP" style={{ color: '#181C20' }}>RP — Running Process</SelectItem>
                    <SelectItem value="SCN" style={{ color: '#181C20' }}>SCN — Self Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>Customer / Buyer</Label>
                <div className="relative" ref={custRef}>
                  <Input placeholder="e.g. Prince Yuji, Levi's..."
                    value={custQuery} onChange={e => { setCustQuery(e.target.value); setField('permintaan', e.target.value); }}
                    className="h-8 text-sm"
                    style={{ color: '#181C20', border: '1px solid #C1C7CE', borderRadius: '16px' }} />
                  {custOpen && custResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-[16px] z-50 overflow-hidden"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                      {custResults.map((c, i) => (
                        <button key={i} type="button" onClick={() => { setCustQuery(c); setField('permintaan', c); setCustOpen(false); }}
                          className="w-full px-3 py-2 text-sm text-left" style={{ color: '#181C20' }}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Adjustments */}
          <div className="rounded-[32px] p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#181C20' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: '#0061A4', color: '#fff', fontSize: '10px' }}>3</span>
              Adjustments &amp; Notes
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>Color Notes <span className="font-normal ml-1">(from spec)</span></Label>
                <Input placeholder="e.g. Indigo S300" value={form.ket_warna} onChange={e => setField('ket_warna', e.target.value)}
                  className="h-8 text-sm"
                  style={{ color: '#181C20', border: '1px solid #C1C7CE', borderRadius: '16px' }} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>TE Override <span className="font-normal ml-1">(from spec)</span></Label>
                <Input type="number" placeholder={spec?.te?.toString() || 'from spec'} value={form.te}
                  onChange={e => setField('te', e.target.value)} className="h-8 text-sm font-mono"
                  style={{ color: '#181C20', border: '1px solid #C1C7CE', borderRadius: '16px' }} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>Internal Notes</Label>
                <textarea placeholder="Optional notes for Jakarta..." value={form.catatan}
                  onChange={e => setField('catatan', e.target.value)} rows={2}
                  className="w-full px-2.5 py-1.5 text-sm rounded-[16px]"
                  style={{ color: '#181C20', border: '1px solid #C1C7CE' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary + submit */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-8 rounded-[32px] p-4"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#181C20' }}>Order Summary</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Date', form.tgl || '—'],
                ['Type', form.status],
                ['Customer', form.permintaan || '—'],
                ['Construction', effectiveKonstruksi],
                ['TE', effectiveTE],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: '#71787E' }}>{k}</span>
                  <span className="font-medium truncate max-w-[100px] text-right" style={{ color: '#181C20' }}>{v}</span>
                </div>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid #C1C7CE' }}>
                <div className="rounded-[16px] px-3 py-2 mb-3" style={{}}>
                  <p className="text-xs" style={{ color: '#7D5700' }}>This order will be sent to Jakarta for approval.</p>
                </div>
                <Button type="submit" disabled={submitting || !spec} className="w-full h-9"
                  style={{ background: '#0061A4', color: '#fff', borderRadius: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit for Approval'}
                </Button>
                <Button type="button" variant="ghost" className="w-full mt-1.5 h-8" onClick={() => router.back()}
                  style={{ color: '#71787E' }}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, Search, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

type FabricSpec = {
  id: number;
  item: string;
  kons_kode: string;
  kode: string;
  kat_kode: string;
  te: number | null;
  lusi_ne: string | null;
  pakan_ne: string | null;
  sisir: string | null;
  pick: number | null;
  warna: string | null;
  oz_g: number | null;
  oz_f: number | null;
  arah: string | null;
  anyaman: string | null;
  usage_count?: number;
};

type FormState = {
  tgl: string;
  permintaan: string;
  status: string;
  selectedSpec: FabricSpec | null;
  ket_warna: string;
  proses: string;
  te: string;
  catatan: string;
};

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

function SpecField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-zinc-800">
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    tgl: today(),
    permintaan: '',
    status: 'SCN',
    selectedSpec: null,
    ket_warna: '',
    proses: 'PROSES',
    te: '',
    catatan: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FabricSpec[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await authFetch(
          `/denim/fabric-specs/search?q=${encodeURIComponent(searchQuery)}&_include_usage=1`
        ) as any;
        setSearchResults(data?.items || []);
        setSearchOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSpec = (spec: FabricSpec) => {
    setForm(f => ({
      ...f,
      selectedSpec: spec,
      ket_warna: spec.warna || '',
      te: spec.te ? String(spec.te) : '',
    }));
    setSearchQuery(spec.item);
    setSearchOpen(false);
  };

  const clearSpec = () => {
    setForm(f => ({ ...f, selectedSpec: null, ket_warna: '', te: '' }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const setField = (key: keyof Omit<FormState, 'selectedSpec'>, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.selectedSpec) {
      toast.error('Please select a construction code first.');
      return;
    }
    setSubmitting(true);
    try {
      const spec = form.selectedSpec;
      const codename = `${spec.kons_kode} ${spec.kode} ${spec.kat_kode}`.trim();

      const payload = {
        tgl: form.tgl,
        permintaan: form.permintaan,
        status: form.status,
        kat_kode: spec.kat_kode,
        codename,
        kode: spec.kode,
        kons_kode: spec.kons_kode,
        ket_warna: form.ket_warna,
        proses: form.proses,
        te: form.te ? parseInt(form.te) : spec.te,
        catatan: form.catatan,
        pipeline_status: 'PENDING_APPROVAL',
        ne_lusi: spec.lusi_ne,
        ne_pakan: spec.pakan_ne,
        sisir: spec.sisir,
        pick: spec.pick,
        anyaman: spec.anyaman,
        arah: spec.arah,
        oz_g: spec.oz_g,
        oz_f: spec.oz_f,
      };

      await authFetch('/denim/sales-contracts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Order submitted for approval.');
      router.push('/denim/my-orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  const spec = form.selectedSpec;

  return (
    <div>
      <PageHeader
        title="New Order"
        subtitle="Create a new sales contract and send it for approval"
      />

      <div className="px-8 pb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Section 1: Order identity */}
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                  Order Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">Date</Label>
                    <Input
                      type="date"
                      value={form.tgl}
                      onChange={e => setField('tgl', e.target.value)}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">Order Type</Label>
                    <Select value={form.status} onValueChange={v => setField('status', v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PO1">PO1 — Priority (Buyer Order)</SelectItem>
                        <SelectItem value="RP">RP — Running Process</SelectItem>
                        <SelectItem value="SCN">SCN — Self Order / Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs font-medium text-zinc-600">Customer / Buyer</Label>
                    <Input
                      placeholder="e.g. Prince Yuji, Levi's..."
                      value={form.permintaan}
                      onChange={e => setField('permintaan', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Construction code lookup */}
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                  Construction Code
                </h2>

                <div className="relative" ref={searchRef}>
                  <div className="relative">
                    {searchLoading ? (
                      <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 animate-spin" />
                    ) : (
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <Input
                      placeholder="Type KODE to search (e.g. VIRGO, DTR...)"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (form.selectedSpec) clearSpec();
                      }}
                      className="pl-8 h-9 text-sm pr-8"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSpec}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {searchOpen && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
                      {searchResults.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectSpec(s)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-0 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="text-sm font-medium text-zinc-800">{s.item}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{s.kons_kode} · {s.kat_kode}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {s.te && (
                                <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-medium">
                                  TE {s.te}
                                </span>
                              )}
                              {(s as any).usage_count > 10 && (
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-medium">
                                  🔥 {(s as any).usage_count}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                s.kat_kode === 'SC' ? 'bg-blue-50 text-blue-600' :
                                s.kat_kode === 'WS' ? 'bg-amber-50 text-amber-600' :
                                'bg-zinc-100 text-zinc-500'
                              }`}>{s.kat_kode}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {spec && (
                  <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-zinc-800">{spec.kode}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">{spec.kat_kode}</span>
                      </div>
                      <button type="button" onClick={clearSpec} className="text-zinc-400 hover:text-zinc-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      <SpecField label="TE" value={spec.te?.toLocaleString()} />
                      <SpecField label="Ne Lusi" value={spec.lusi_ne} />
                      <SpecField label="Ne Pakan" value={spec.pakan_ne} />
                      <SpecField label="Sisir" value={spec.sisir} />
                      <SpecField label="Pick" value={spec.pick} />
                      <SpecField label="Anyaman" value={spec.anyaman} />
                      <SpecField label="Arah" value={spec.arah} />
                      <SpecField label="Warna" value={spec.warna} />
                      <SpecField label="OZ G" value={spec.oz_g} />
                      <SpecField label="OZ F" value={spec.oz_f} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Adjustments */}
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-zinc-800 mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                  Adjustments & Notes
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">
                      Color Notes
                      <span className="text-zinc-400 font-normal ml-1">(auto-filled from spec)</span>
                    </Label>
                    <Input
                      placeholder="e.g. Indigo S300"
                      value={form.ket_warna}
                      onChange={e => setField('ket_warna', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-600">
                      TE Override
                      <span className="text-zinc-400 font-normal ml-1">(leave blank to use spec value)</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder={spec?.te?.toString() || 'from spec'}
                      value={form.te}
                      onChange={e => setField('te', e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs font-medium text-zinc-600">Internal Notes</Label>
                    <textarea
                      placeholder="Optional notes for Jakarta..."
                      value={form.catatan}
                      onChange={e => setField('catatan', e.target.value)}
                      rows={3}
                      className={cn(
                        'w-full px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 resize-none'
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Summary + submit */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 sticky top-8">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Date</span>
                    <span className="text-zinc-800 font-medium">{form.tgl || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Type</span>
                    <span className="text-zinc-800 font-medium">{form.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer</span>
                    <span className="text-zinc-800 font-medium truncate max-w-[120px] text-right">{form.permintaan || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Construction</span>
                    <span className="text-zinc-800 font-medium truncate max-w-[120px] text-right">{spec?.kode || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TE</span>
                    <span className="text-zinc-800 font-mono font-medium">{form.te || spec?.te?.toLocaleString() || '—'}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100">
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 mb-4">
                      <p className="text-xs text-amber-700">This order will be sent to Jakarta for approval. You will be notified when it&apos;s reviewed.</p>
                    </div>

                    <Button type="submit" disabled={submitting || !spec} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>

                    <Button type="button" variant="ghost" className="w-full mt-2 text-zinc-500 hover:text-zinc-700" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

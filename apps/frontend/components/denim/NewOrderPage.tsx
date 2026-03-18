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
  anyaman: string;
  arah: string;
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
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#3D4852' }}>
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
    anyaman: '',
    arah: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FabricSpec[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);

  // Customer autocomplete state
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<string[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setCustomerOpen(false);
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

  // Customer autocomplete search
  useEffect(() => {
    if (customerQuery.length < 1) {
      setCustomerResults([]);
      setCustomerOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const data = await authFetch(
          `/denim/sales-contracts?limit=5&permintaan=${encodeURIComponent(customerQuery)}`
        ) as any;
        // Extract unique permintaan values
        const uniqueCustomers = Array.from(
          new Set((data?.items?.map((sc: any) => sc.permintaan).filter(Boolean) || []) as string[])
        );
        setCustomerResults(uniqueCustomers);
        setCustomerOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setCustomerLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  const selectCustomer = (customer: string) => {
    setForm(f => ({ ...f, permintaan: customer }));
    setCustomerQuery(customer);
    setCustomerOpen(false);
  };

  const selectSpec = (spec: FabricSpec) => {
    setForm(f => ({
      ...f,
      selectedSpec: spec,
      ket_warna: spec.warna || '',
      te: spec.te ? String(spec.te) : '',
      anyaman: spec.anyaman || '',
      arah: spec.arah || '',
    }));
    setSearchQuery(spec.item);
    setSearchOpen(false);
  };

  const clearSpec = () => {
    setForm(f => ({ ...f, selectedSpec: null, ket_warna: '', te: '', anyaman: '', arah: '' }));
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
        anyaman: form.anyaman,
        arah: form.arah,
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

      <div className="px-4 sm:px-8 pb-8">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT: Form sections - compact vertical flow */}
            <div className="flex-1 space-y-3">
              {/* Section 1: Order Details */}
              <div
                className="rounded-[32px] p-4"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                }}
              >
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#3D4852' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#6C63FF', color: '#fff', fontSize: '10px' }}>1</span>
                  Order Details
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>Date</Label>
                    <Input
                      type="date"
                      value={form.tgl}
                      onChange={e => setField('tgl', e.target.value)}
                      required
                      className="h-8 text-sm"
                      style={{
                        background: '#E0E5EC',
                        color: '#3D4852',
                        boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '16px',
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>Order Type</Label>
                    <Select value={form.status} onValueChange={v => setField('status', v)}>
                      <SelectTrigger className="h-8 text-sm" style={{ background: '#E0E5EC', color: '#3D4852', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', border: 'none', borderRadius: '16px' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', border: 'none', borderRadius: '16px' }}>
                        <SelectItem value="PO1" style={{ color: '#3D4852' }}>PO1 — Priority</SelectItem>
                        <SelectItem value="RP" style={{ color: '#3D4852' }}>RP — Running Process</SelectItem>
                        <SelectItem value="SCN" style={{ color: '#3D4852' }}>SCN — Self Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>Customer / Buyer</Label>
                    <div className="relative" ref={customerRef}>
                      <Input
                        placeholder="e.g. Prince Yuji, Levi's..."
                        value={customerQuery}
                        onChange={e => {
                          setCustomerQuery(e.target.value);
                          setField('permintaan', e.target.value);
                        }}
                        className="h-8 text-sm"
                        style={{
                          background: '#E0E5EC',
                          color: '#3D4852',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                          border: 'none',
                          borderRadius: '16px',
                        }}
                      />
                      {customerOpen && customerResults.length > 0 && (
                        <div 
                          className="absolute top-full left-0 right-0 mt-1 rounded-[16px] z-50 overflow-hidden"
                          style={{
                            background: '#E0E5EC',
                            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                          }}
                        >
                          {customerResults.map((customer, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectCustomer(customer)}
                              className="w-full px-3 py-2 text-sm text-left transition-colors"
                              style={{ color: '#3D4852' }}
                            >
                              {customer}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Construction Code - between Order Details and Adjustments */}
              <div
                className="rounded-[32px] p-4"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                }}
              >
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#3D4852' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#6C63FF', color: '#fff', fontSize: '10px' }}>2</span>
                  Construction Code
                </h2>

                <div className="relative" ref={searchRef}>
                  <div className="relative">
                    {searchLoading ? (
                      <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: '#9CA3AF' }} />
                    ) : (
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
                    )}
                    <Input
                      placeholder="Type KODE to search (e.g. VIRGO, DTR...)"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (form.selectedSpec) clearSpec();
                      }}
                      className="pl-8 h-8 text-sm"
                      style={{
                        background: '#E0E5EC',
                        color: '#3D4852',
                        boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '16px',
                      }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSpec}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        style={{ color: '#9CA3AF' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {searchOpen && searchResults.length > 0 && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 rounded-[16px] z-50 overflow-hidden max-h-56 overflow-y-auto"
                      style={{
                        background: '#E0E5EC',
                        boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                      }}
                    >
                      {searchResults.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectSpec(s)}
                          className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors"
                          style={{ color: '#3D4852' }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#3D4852' }}>{s.item}</p>
                              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.kons_kode} · {s.kat_kode}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {s.te && (
                                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#E0E5EC', color: '#6B7280', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)' }}>
                                  TE {s.te}
                                </span>
                              )}
                              {(s as any).usage_count > 10 && (
                                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#D97706', color: '#fff' }}>
                                  🔥 {(s as any).usage_count}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                s.kat_kode === 'SC' ? 'text-[#6C63FF]' :
                                s.kat_kode === 'WS' ? 'text-[#D97706]' :
                                'text-[#9CA3AF]'
                              }`} style={{ background: '#E0E5EC', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)' }}>{s.kat_kode}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded spec detail - fills the section */}
                {spec && (
                  <div 
                    className="mt-3 rounded-[16px] p-3"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#6C63FF' }} />
                        <span className="text-sm font-bold" style={{ color: '#3D4852' }}>{spec.kode}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-[9999px]" style={{ background: '#6C63FF', color: '#fff' }}>{spec.kat_kode}</span>
                      </div>
                      <button type="button" onClick={clearSpec} style={{ color: '#6C63FF' }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-x-3 gap-y-1.5">
                      <SpecField label="TE" value={spec.te?.toLocaleString()} />
                      <SpecField label="Ne Lusi" value={spec.lusi_ne} />
                      <SpecField label="Ne Pakan" value={spec.pakan_ne} />
                      <SpecField label="SISIR" value={spec.sisir} />
                      <SpecField label="Pick" value={spec.pick} />
                      <SpecField label="Warna" value={spec.warna} />
                      <SpecField label="Anyaman" value={spec.anyaman} />
                      <SpecField label="Arah" value={spec.arah} />
                      <SpecField label="OZ" value={spec.oz_g ? `${spec.oz_g}/${spec.oz_f}` : null} />
                      <SpecField label="Konstruksi" value={spec.kons_kode} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Adjustments */}
              <div
                className="rounded-[32px] p-4"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                }}
              >
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#3D4852' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#6C63FF', color: '#fff', fontSize: '10px' }}>3</span>
                  Adjustments & Notes
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>
                      Color Notes
                      <span className="font-normal ml-1" style={{ color: '#9CA3AF' }}>(from spec)</span>
                    </Label>
                    <Input
                      placeholder="e.g. Indigo S300"
                      value={form.ket_warna}
                      onChange={e => setField('ket_warna', e.target.value)}
                      className="h-8 text-sm"
                      style={{
                        background: '#E0E5EC',
                        color: '#3D4852',
                        boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '16px',
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>
                      TE Override
                      <span className="font-normal ml-1" style={{ color: '#9CA3AF' }}>(from spec)</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder={spec?.te?.toString() || 'from spec'}
                      value={form.te}
                      onChange={e => setField('te', e.target.value)}
                      className="h-8 text-sm font-mono"
                      style={{
                        background: '#E0E5EC',
                        color: '#3D4852',
                        boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '16px',
                      }}
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#9CA3AF' }}>Internal Notes</Label>
                    <textarea
                      placeholder="Optional notes for Jakarta..."
                      value={form.catatan}
                      onChange={e => setField('catatan', e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-sm rounded-[16px]"
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
            </div>

            {/* RIGHT: Order Summary - flush at top */}
            <div className="w-full lg:w-72 shrink-0">
              <div
                className="lg:sticky lg:top-8"
                style={{
                  background: '#E0E5EC',
                  borderRadius: '32px',
                  padding: '16px',
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#3D4852' }}>Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: '#9CA3AF' }}>Date</span>
                    <span className="font-medium" style={{ color: '#3D4852' }}>{form.tgl || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#9CA3AF' }}>Type</span>
                    <span className="font-medium" style={{ color: '#3D4852' }}>{form.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#9CA3AF' }}>Customer</span>
                    <span className="font-medium truncate max-w-[100px] text-right" style={{ color: '#3D4852' }}>{form.permintaan || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#9CA3AF' }}>Construction</span>
                    <span className="font-medium truncate max-w-[100px] text-right" style={{ color: '#3D4852' }}>{spec?.kode || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#9CA3AF' }}>TE</span>
                    <span className="font-mono font-medium" style={{ color: '#3D4852' }}>{form.te || spec?.te?.toLocaleString() || '—'}</span>
                  </div>

                  <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgb(163 177 198 / 0.3)' }}>
                    <div className="rounded-[16px] px-3 py-2 mb-3" style={{ background: '#E0E5EC', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)' }}>
                      <p className="text-xs" style={{ color: '#D97706' }}>This order will be sent to Jakarta for approval.</p>
                    </div>

                    <Button type="submit" disabled={submitting || !spec} className="w-full h-9" style={{ background: '#6C63FF', color: '#fff', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>

                    <Button type="button" variant="ghost" className="w-full mt-1.5 h-8" onClick={() => router.back()} style={{ color: '#9CA3AF' }}>
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

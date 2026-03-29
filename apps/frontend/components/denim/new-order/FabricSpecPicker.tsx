'use client';

import { useState, useEffect, useRef } from 'react';
import { authFetch } from '../../../lib/authFetch';
import { Input } from '../../ui/input';
import { Loader2, Search, CheckCircle2, X } from 'lucide-react';
import type { FabricSpec } from './types';

type Props = {
  selectedSpec: FabricSpec | null;
  onSelect: (spec: FabricSpec) => void;
  onClear: () => void;
};

function SpecField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#71787E' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#181C20' }}>{value ?? '—'}</p>
    </div>
  );
}

export function FabricSpecPicker({ selectedSpec: spec, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FabricSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await authFetch(
          `/denim/fabric-specs/search?q=${encodeURIComponent(query)}&_include_usage=1`
        ) as { items?: FabricSpec[] };
        setResults(data?.items || []);
        setOpen(true);
      } catch { /* empty */ } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div
      className="rounded-[32px] p-4"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
    >
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#181C20' }}>
        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0"
          style={{ background: '#0061A4', color: '#fff', fontSize: '10px' }}>2</span>
        Construction Code
      </h2>

      <div className="relative" ref={ref}>
        <div className="relative">
          {loading
            ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: '#71787E' }} />
            : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#71787E' }} />}
          <Input
            placeholder="Type KODE to search (e.g. VIRGO, DTR...)"
            value={query}
            onChange={e => { setQuery(e.target.value); if (spec) onClear(); }}
            className="pl-8 h-8 text-sm"
            style={{ color: '#181C20', border: 'none', borderRadius: '16px' }}
          />
          {query && (
            <button type="button" onClick={onClear} className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: '#71787E' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-[16px] z-50 overflow-hidden max-h-56 overflow-y-auto"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            {results.map(s => (
              <button key={s.id} type="button" onClick={() => { onSelect(s); setQuery(s.item); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-left"
                style={{ color: '#181C20' }}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#181C20' }}>{s.item}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#71787E' }}>{s.kons_kode} · {s.kat_kode}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {s.te && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ color: '#41474D', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                        TE {s.te}
                      </span>
                    )}
                    {s.usage_count !== undefined && s.usage_count > 10 && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: '#7D5700', color: '#fff' }}>
                        {s.usage_count}x
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      s.kat_kode === 'SC' ? 'text-[#0061A4]' :
                      s.kat_kode === 'WS' ? 'text-[#7D5700]' : 'text-[#71787E]'
                    }`} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>{s.kat_kode}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {spec && (
        <div className="mt-3 rounded-[16px] p-3" style={{}}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#0061A4' }} />
              <span className="text-sm font-bold" style={{ color: '#181C20' }}>{spec.kode}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-[9999px]" style={{ background: '#0061A4', color: '#fff' }}>{spec.kat_kode}</span>
            </div>
            <button type="button" onClick={onClear} style={{ color: '#0061A4' }}>
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
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────
type SaconInboxRow = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  kons_kode: string | null;
  kat_kode: string | null;
  permintaan: string | null;
  sacon_date: string | null;
  ts: string | null;
  acc: string | null;
};

// Fabric spec fields returned by GET /api/denim/fabric-specs
type FabricSpec = {
  id: number;
  item: string;
  kons_kode: string;
  kode: string;
  kat_kode: string;
  te: number | null;
  lusi_type: string | null;
  lusi_ne: string | null;
  pakan_type: string | null;
  pakan_ne: string | null;
  sisir: string | null;
  pick: number | null;
  anyaman: string | null;
  arah: string | null;
  lg_inches: number | null;
  lf_inches: number | null;
  susut_pakan: number | null;
  warna: string | null;
  pretreatment: string | null;
  indigo_i: number | null;
  indigo_bak_i: number | null;
  sulfur_s: number | null;
  sulfur_bak_s: number | null;
  posttreatment: string | null;
  finish: string | null;
  oz_g: number | null;
  oz_f: number | null;
  p_kons: string | null;
  remarks: string | null;
};

type NewOrderPayload = {
  tgl: string;
  permintaan: string;
  kons_kode: string;
  kode_number: string;
  kat_kode: string;
  codename: string;
  ket_ct_ws: string;
  ket_warna: string;
  status: string;
  lot_lusi: string;
  delivery_time: string;
  remarks: string;
  // All FabricSpec fields (auto-filled from API)
  te: string;
  sisir: string;
  p_kons: string;
  lusi_type: string;
  lusi_ne: string;
  pick: string;
  anyaman: string;
  arah: string;
  lg_inches: string;
  lf_inches: string;
  pakan_type: string;
  pakan_ne: string;
  susut_pakan: string;
  warna: string;
  pretreatment: string;
  indigo_i: string;
  indigo_bak_i: string;
  sulfur_s: string;
  sulfur_bak_s: string;
  posttreatment: string;
  finish: string;
  oz_g: string;
  oz_f: string;
  // Measurement fields
  j: string;
  b_c: string;
  tb: string;
  tb_real: string;
};

// ─── Helpers ─────────────────────────────────────────────────────
function formatDate(iso: string) {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

// ─── Shimmer ─────────────────────────────────────────────────────
const SHIMMER = `@keyframes __sac_shimmer__ { 0%,100%{opacity:0.4} 50%{opacity:0.85} }`;

// ─── Spec Field (read-only display within modal) ──────────────────
function SpecField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>
        {label}
      </label>
      <input
        style={{
          width: '100%', height: 36, borderRadius: 8,
          border: '1px solid #E5E7EB', background: '#FFFFFF',
          color: '#0F1E2E', fontSize: 14, padding: '0 10px',
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
      />
    </div>
  );
}

// ─── Spec Display (read-only) ───────────────────────────────────────
function SpecDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>
        {label}
      </label>
      <div style={{
        fontSize: 14, fontWeight: 500, color: '#0F1E2E',
        padding: '8px 0', minHeight: 22,
      }}>
        {value || <span style={{ color: '#D1D5DB' }}>—</span>}
      </div>
    </div>
  );
}

// ─── Spec Combobox ─────────────────────────────────────────────────
// Single searchable field: user types → API search → select → auto-fill
function SpecCombobox({
  value,
  onChange,
}: {
  value: FabricSpec | null;
  onChange: (spec: FabricSpec) => void;
}) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<FabricSpec[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]       = useState(false);
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      const handler = (e: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const clickedOutside =
          e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top  || e.clientY > rect.bottom;
        if (clickedOutside) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, limit: '20' });
        const data = await authFetch<FabricSpec[]>(`/denim/fabric-specs?${params}`);
        if (!cancelled) { setResults(Array.isArray(data) ? data : []); setOpen(true); }
      } catch { if (!cancelled) setResults([]); }
      finally { if (!cancelled) setSearching(false); }
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const selectedLabel = value
    ? `${value.kons_kode} ${value.kode} ${value.kat_kode}`
    : '';

  return (
    <div style={{ position: 'relative' }}>
      {/* Selected chip */}
      {value && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: 8, padding: '6px 10px',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
            {selectedLabel}
          </span>
          {value.te != null && (
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>TE: {value.te}</span>
          )}
          <button
            type="button"
            onClick={() => { onChange(null as unknown as FabricSpec); setQuery(''); setResults([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', fontSize: 16, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Search input */}
      {!value && (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
          placeholder="Type to search (e.g. DALLAS, DTR, 1069)..."
          style={{
            width: '100%', height: 44, borderRadius: 10,
            border: '1px solid #E5E7EB', background: '#FFFFFF',
            color: '#0F1E2E', fontSize: 14, padding: '0 14px',
            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />
      )}

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: 10, marginTop: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            maxHeight: 260, overflowY: 'auto',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {searching && (
            <div style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>
              Searching…
            </div>
          )}
          {!searching && results.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>
              No results found
            </div>
          )}
          {!searching && results.map(spec => (
            <div
              key={spec.id}
              style={{ padding: '8px 12px', cursor: 'pointer', transition: 'background 100ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(spec);
                setQuery(`${spec.kons_kode} ${spec.kode} ${spec.kat_kode}`);
                setResults([]);
                setOpen(false);
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>
                {spec.kons_kode} {spec.kode} {spec.kat_kode}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                {spec.te != null ? `TE: ${spec.te}` : ''}
                {spec.lusi_ne != null ? ` · Ne Lusi: ${spec.lusi_ne}` : ''}
                {spec.pakan_ne != null ? ` · Ne Pakan: ${spec.pakan_ne}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── New Order Modal ──────────────────────────────────────────────
function NewOrderModal({
  open,
  onClose,
  onSubmit,
  loading,
  selectedSpec,
  onSpecChange,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewOrderPayload) => void;
  loading: boolean;
  selectedSpec: FabricSpec | null;
  onSpecChange: (spec: FabricSpec | null) => void;
}) {
  const [formData, setFormData] = useState<NewOrderPayload>({
    tgl: format(new Date(), 'yyyy-MM-dd'),
    permintaan: '', kons_kode: '', kode_number: '', kat_kode: '', codename: '',
    ket_ct_ws: '', ket_warna: '', status: '', lot_lusi: '',
    delivery_time: '', remarks: '',
    te: '', sisir: '', p_kons: '',
    lusi_type: '', lusi_ne: '', pick: '', anyaman: '', arah: '',
    lg_inches: '', lf_inches: '',
    pakan_type: '', pakan_ne: '', susut_pakan: '',
    warna: '', pretreatment: '',
    indigo_i: '', indigo_bak_i: '',
    sulfur_s: '', sulfur_bak_s: '',
    posttreatment: '', finish: '',
    oz_g: '', oz_f: '',
    j: '', b_c: '', tb: '', tb_real: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewOrderPayload, string>>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        tgl: format(new Date(), 'yyyy-MM-dd'),
        permintaan: '', kons_kode: '', kode_number: '', kat_kode: '', codename: '',
        ket_ct_ws: '', ket_warna: '', status: '', lot_lusi: '',
        delivery_time: '', remarks: '',
        te: '', sisir: '', p_kons: '',
        lusi_type: '', lusi_ne: '', pick: '', anyaman: '', arah: '',
        lg_inches: '', lf_inches: '',
        pakan_type: '', pakan_ne: '', susut_pakan: '',
        warna: '', pretreatment: '',
        indigo_i: '', indigo_bak_i: '',
        sulfur_s: '', sulfur_bak_s: '',
        posttreatment: '', finish: '',
        oz_g: '', oz_f: '',
        j: '', b_c: '', tb: '', tb_real: '',
      });
      setErrors({});
    }
  }, [open]);

  // When a spec is selected, auto-fill construction + all fabric spec fields
  useEffect(() => {
    if (!selectedSpec) return;
    const codename = `${selectedSpec.kons_kode} ${selectedSpec.kode} ${selectedSpec.kat_kode}`;
    setFormData(f => ({
      ...f,
      kons_kode:    selectedSpec.kons_kode,
      kode_number:  selectedSpec.kode,
      kat_kode:     selectedSpec.kat_kode,
      codename,
      te:           selectedSpec.te != null ? String(selectedSpec.te) : '',
      sisir:        selectedSpec.sisir || '',
      p_kons:       selectedSpec.p_kons || '',
      lusi_type:    selectedSpec.lusi_type || '',
      lusi_ne:      selectedSpec.lusi_ne || '',
      pick:         selectedSpec.pick != null ? String(selectedSpec.pick) : '',
      anyaman:      selectedSpec.anyaman || '',
      arah:         selectedSpec.arah || '',
      lg_inches:    selectedSpec.lg_inches != null ? String(selectedSpec.lg_inches) : '',
      lf_inches:    selectedSpec.lf_inches != null ? String(selectedSpec.lf_inches) : '',
      pakan_type:   selectedSpec.pakan_type || '',
      pakan_ne:     selectedSpec.pakan_ne || '',
      susut_pakan:  selectedSpec.susut_pakan != null ? String(selectedSpec.susut_pakan) : '',
      warna:        selectedSpec.warna || '',
      pretreatment: selectedSpec.pretreatment || '',
      indigo_i:     selectedSpec.indigo_i != null ? String(selectedSpec.indigo_i) : '',
      indigo_bak_i: selectedSpec.indigo_bak_i != null ? String(selectedSpec.indigo_bak_i) : '',
      sulfur_s:     selectedSpec.sulfur_s != null ? String(selectedSpec.sulfur_s) : '',
      sulfur_bak_s: selectedSpec.sulfur_bak_s != null ? String(selectedSpec.sulfur_bak_s) : '',
      posttreatment: selectedSpec.posttreatment || '',
      finish:       selectedSpec.finish || '',
      oz_g:         selectedSpec.oz_g != null ? String(selectedSpec.oz_g) : '',
      oz_f:         selectedSpec.oz_f != null ? String(selectedSpec.oz_f) : '',
    }));
    setErrors(e => ({ ...e, kons_kode: undefined, kode_number: undefined, kat_kode: undefined }));
  }, [selectedSpec]);

  const setField = (field: keyof NewOrderPayload, value: string) =>
    setFormData(f => ({ ...f, [field]: value }));

  const j  = parseFloat(formData.j)  || 0;
  const bC = parseFloat(formData.b_c) || 0;
  const tb = parseFloat(formData.tb)  || 0;
  const jClabel  = j && bC ? (j / bC).toFixed(2)   : '—';
  const bClabel   = j && bC ? (bC / j).toFixed(4)    : '—';
  const baleLusi  = j && bC ? Math.ceil(tb / bC)     : '—';

  const SL: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 12,
  };
  const LBL: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: '#374151', marginBottom: 4,
  };
  const IN: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid #E5E7EB', background: '#FFFFFF',
    color: '#0F1E2E', fontSize: 14, padding: '0 14px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const RO: React.CSSProperties = { ...IN, background: '#F9FAFB', color: '#6B7280' };
  const SEL: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid #E5E7EB', background: '#FFFFFF',
    color: '#0F1E2E', fontSize: 14, padding: '0 14px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    cursor: 'pointer',
  };
  const ROW: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: 14, padding: '28px 32px',
          width: '100%', maxWidth: 620,
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F1E2E', margin: 0 }}>
            New Sales Contract
        </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
          Factory submits order details. Order will appear in the Jakarta approval list.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section 1 — Order Info */}
          <div>
            <p style={SL}>Order Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={ROW}>
                <div>
                  <label style={LBL}>Date</label>
                  <input type="date" style={IN} value={formData.tgl}
                    onChange={e => setField('tgl', e.target.value)} />
                </div>
                <div>
                  <label style={LBL}>
                    <span style={{ color: '#DC2626', marginRight: 2 }}>*</span>
                    Permintaan / Customer
                  </label>
                  <input style={{ ...IN, ...(errors.permintaan ? { border: '1px solid #DC2626' } : {}) }}
                    value={formData.permintaan}
                    onChange={e => { setField('permintaan', e.target.value); setErrors(p => ({ ...p, permintaan: undefined })); }}
                    placeholder="e.g. PT样本" />
                  {errors.permintaan && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.permintaan}</p>}
                </div>
              </div>
              {/* Construction combobox — replaces Kons Kode / KODE / Kat Kode */}
              <div>
                <label style={LBL}>
                  <span style={{ color: '#DC2626', marginRight: 2 }}>*</span>
                  Construction
                </label>
                <SpecCombobox value={selectedSpec} onChange={onSpecChange} />
                {errors.kons_kode && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.kons_kode}</p>}
              </div>
              <div style={ROW}>
                <div>
                  <label style={LBL}>
                    <span style={{ color: '#DC2626', marginRight: 2 }}>*</span>
                    Ket Warna
                  </label>
                  <input style={{ ...IN, ...(errors.ket_warna ? { border: '1px solid #DC2626' } : {}) }}
                    value={formData.ket_warna}
                    onChange={e => { setField('ket_warna', e.target.value); setErrors(p => ({ ...p, ket_warna: undefined })); }}
                    placeholder="e.g. I4.2, S180" />
                  {errors.ket_warna && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.ket_warna}</p>}
                </div>
                <div>
                  <label style={LBL}>
                    <span style={{ color: '#DC2626', marginRight: 2 }}>*</span>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => { setField('status', e.target.value); setErrors(p => ({ ...p, status: undefined })); }}
                    style={{ ...SEL, ...(errors.status ? { border: '1px solid #DC2626' } : {}) }}
                  >
                    <option value="">— select —</option>
                    {['RP','PO 1','SCN','PO 2'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {errors.status && <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0' }}>{errors.status}</p>}
                </div>
              </div>
              <div style={ROW}>
                <div>
                  <label style={LBL}>Ket CT/WS</label>
                  <select
                    value={formData.ket_ct_ws}
                    onChange={e => setField('ket_ct_ws', e.target.value)}
                    style={SEL}
                  >
                    <option value="">— none —</option>
                    {['CT5','CT10','W+S'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Lot Lusi</label>
                  <input style={IN} value={formData.lot_lusi}
                    onChange={e => setField('lot_lusi', e.target.value)}
                    placeholder="Lot number" />
                </div>
              </div>
              <div style={ROW}>
                <div>
                  <label style={LBL}>Delivery Time</label>
                  <input type="date" style={IN} value={formData.delivery_time}
                    onChange={e => setField('delivery_time', e.target.value)} />
                </div>
                <div>
                  <label style={LBL}>Remarks</label>
                  <textarea style={{ ...IN, minHeight: 64, padding: '8px 10px', resize: 'vertical' }}
                    value={formData.remarks}
                    onChange={e => setField('remarks', e.target.value)}
                    placeholder="Additional notes..." />
                </div>
              </div>
            </div>
          </div>

          {/* Fabric Specification — auto-filled from spec selection */}
          {selectedSpec && (
            <div>
              <p style={SL}>Fabric Specification</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                Auto-filled from fabric database · Edit in Admin → Fabric Specs
              </p>
              <div style={{
                padding: '10px 14px', background: '#F0FDF4',
                border: '1px solid #A7F3D0', borderRadius: 8, marginBottom: 14,
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#065F46', margin: 0 }}>
                  Spec loaded — {selectedSpec.kons_kode} {selectedSpec.kode} {selectedSpec.kat_kode}
                  {selectedSpec.te != null && ` · TE: ${selectedSpec.te}`}
                </p>
              </div>

              {/* CONSTRUCTION */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                  Construction
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  <SpecDisplay label="TE"       value={formData.te} />
                  <SpecDisplay label="SISIR"    value={formData.sisir} />
                  <SpecDisplay label="P (Kons)" value={formData.p_kons} />
                  <SpecDisplay label="PICK"     value={formData.pick} />
                  <SpecDisplay label="ANYAMAN"  value={formData.anyaman} />
                  <SpecDisplay label="ARAH"     value={formData.arah} />
                </div>
              </div>

              {/* WARP (LUSI) */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                  Warp (Lusi)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  <SpecDisplay label="Type (Lusi)" value={formData.lusi_type} />
                  <SpecDisplay label="Ne (Lusi)"   value={formData.lusi_ne} />
                  <SpecDisplay label="LG&quot; (Lusi)" value={formData.lg_inches} />
                  <SpecDisplay label="LF&quot; (Lusi)" value={formData.lf_inches} />
                </div>
              </div>

              {/* WEFT (PAKAN) */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                  Weft (Pakan)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <SpecDisplay label="Type (Pakan)"  value={formData.pakan_type} />
                  <SpecDisplay label="Ne (Pakan)"    value={formData.pakan_ne} />
                  <SpecDisplay label="Susut Pakan %" value={formData.susut_pakan} />
                </div>
              </div>

              {/* COLOR & PROCESS */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                  Color &amp; Process
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  <SpecDisplay label="WARNA"          value={formData.warna} />
                  <SpecDisplay label="PRETREATMENT"   value={formData.pretreatment} />
                  <SpecDisplay label="INDIGO (I)"     value={formData.indigo_i} />
                  <SpecDisplay label="BAK INDIGO"     value={formData.indigo_bak_i} />
                  <SpecDisplay label="SULFUR (S)"     value={formData.sulfur_s} />
                  <SpecDisplay label="BAK SULFUR"     value={formData.sulfur_bak_s} />
                  <SpecDisplay label="POSTTREATMENT"  value={formData.posttreatment} />
                  <SpecDisplay label="FINISH"         value={formData.finish} />
                </div>
              </div>

              {/* WEIGHT */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                  Weight
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <SpecDisplay label="OZ G" value={formData.oz_g} />
                  <SpecDisplay label="OZ F" value={formData.oz_f} />
                </div>
              </div>

              {/* REMARKS */}
              {formData.remarks && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' }}>
                    Remarks
                  </p>
                  <div style={{
                    width: '100%', minHeight: 56, borderRadius: 8,
                    border: '1px solid #E5E7EB', background: '#F9FAFB',
                    color: '#0F1E2E', fontSize: 14, padding: '8px 10px',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}>
                    {formData.remarks}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2 — Measurements */}
          <div>
            <p style={SL}>Yarn Parameters</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={ROW}>
                <div>
                  <label style={LBL}>J (Panjang Tarikan)</label>
                  <input type="number" step="any" style={IN} value={formData.j}
                    onChange={e => setField('j', e.target.value)}
                    placeholder="e.g. 1750 (= 17500m)" />
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Enter in units of 100m. 1750 = 17,500 meters</p>
                </div>
                <div>
                  <label style={LBL}>B/C (Berat per Cone)</label>
                  <input type="number" step="any" style={IN} value={formData.b_c}
                    onChange={e => setField('b_c', e.target.value)}
                    placeholder="Berat per cone" />
                </div>
              </div>
              <div style={ROW}>
                <div>
                  <label style={LBL}>TB (Total Berat)</label>
                  <input type="number" step="any" style={IN} value={formData.tb}
                    onChange={e => setField('tb', e.target.value)}
                    placeholder="Total berat" />
                </div>
                <div>
                  <label style={LBL}>TB Real</label>
                  <input type="number" step="any" style={IN} value={formData.tb_real}
                    onChange={e => setField('tb_real', e.target.value)}
                    placeholder="Actual berat after weighing" />
                </div>
              </div>
              <div style={ROW}>
                <div>
                  <label style={LBL}>J/C (read-only)</label>
                  <input style={RO} value={jClabel} readOnly tabIndex={-1} />
                </div>
                <div>
                  <label style={LBL}>B/C Ratio (read-only)</label>
                  <input style={RO} value={bClabel} readOnly tabIndex={-1} />
                </div>
              </div>
              <div>
                <label style={LBL}>Bale Lusi (read-only)</label>
                <input style={RO} value={String(baleLusi)} readOnly tabIndex={-1} />
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 28, justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="default"
            loading={loading}
            onClick={() => {
              const errs: typeof errors = {};
              if (!selectedSpec) errs.kons_kode = 'Please select a construction spec';
              if (!formData.permintaan.trim()) errs.permintaan = 'Customer is required';
              if (!formData.ket_warna.trim()) errs.ket_warna = 'Color is required';
              if (!formData.status) errs.status = 'Status is required';
              if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
              }
              onSubmit(formData);
            }}
          >
            Submit Order
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────
export default function SaconInboxPage() {
  const [orders, setOrders]       = useState<SaconInboxRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);

  // The selected fabric spec drives the combobox and auto-fill
  const [selectedSpec, setSelectedSpec] = useState<FabricSpec | null>(null);

  // Reset selected spec when modal closes
  useEffect(() => {
    if (!showNewOrder) setSelectedSpec(null);
  }, [showNewOrder]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<SaconInboxRow[]>('/denim/sacon-inbox/awaiting');
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleNewOrder = async (data: NewOrderPayload) => {
    setSubmitting(true);
    try {
      await authFetch('/denim/sales-contracts', {
        method: 'POST',
        body: JSON.stringify({
          tgl:         data.tgl,
          permintaan:  data.permintaan || null,
          kons_kode:   data.kons_kode || null,
          kode_number: data.kode_number || null,
          kat_kode:    data.kat_kode || null,
          codename:    data.codename || null,
          ket_ct_ws:   data.ket_ct_ws || null,
          ket_warna:   data.ket_warna || null,
          status:      data.status || null,
          lot_lusi:    data.lot_lusi || null,
          delivery_time: data.delivery_time || null,
          remarks:     data.remarks || null,
          // Fabric spec fields
          te:            data.te             === '' ? null : Number(data.te),
          sisir:         data.sisir               || null,
          p_kons:        data.p_kons              || null,
          lusi_type:     data.lusi_type           || null,
          lusi_ne:       data.lusi_ne   === '' ? null : Number(data.lusi_ne),
          pick:          data.pick                === '' ? null : Number(data.pick),
          anyaman:       data.anyaman             || null,
          arah:          data.arah                || null,
          lg_inches:     data.lg_inches           === '' ? null : Number(data.lg_inches),
          lf_inches:     data.lf_inches           === '' ? null : Number(data.lf_inches),
          pakan_type:    data.pakan_type          || null,
          pakan_ne:      data.pakan_ne  === '' ? null : Number(data.pakan_ne),
          susut_pakan:   data.susut_pakan         === '' ? null : Number(data.susut_pakan),
          warna:         data.warna               || null,
          pretreatment:  data.pretreatment        || null,
          indigo_i:      data.indigo_i            === '' ? null : Number(data.indigo_i),
          indigo_bak_i:  data.indigo_bak_i         === '' ? null : Number(data.indigo_bak_i),
          sulfur_s:      data.sulfur_s            === '' ? null : Number(data.sulfur_s),
          sulfur_bak_s:  data.sulfur_bak_s        === '' ? null : Number(data.sulfur_bak_s),
          posttreatment: data.posttreatment       || null,
          finish:        data.finish              || null,
          oz_g:          data.oz_g                === '' ? null : Number(data.oz_g),
          oz_f:          data.oz_f                === '' ? null : Number(data.oz_f),
          // Measurement fields
          j:           data.j    === '' ? null : Number(data.j),
          b_c:         data.b_c  === '' ? null : Number(data.b_c),
          tb:          data.tb   === '' ? null : Number(data.tb),
          tb_real:     data.tb_real === '' ? null : Number(data.tb_real),
          kode:        data.kode_number || data.permintaan || 'UNKNOWN',
        }),
      });
      setSelectedSpec(null);
      setShowNewOrder(false);
      await fetchOrders();
    } catch {
      // keep modal open on error
    } finally {
      setSubmitting(false);
    }
  };

  const ACC_COLOR: Record<string, string> = {
    ACC: '#059669',
    'TIDAK ACC': '#DC2626',
  };
  const ACC_BG: Record<string, string> = {
    ACC: '#ECFDF5',
    'TIDAK ACC': '#FEF2F2',
  };
  const ACC_BORDER: Record<string, string> = {
    ACC: '#A7F3D0',
    'TIDAK ACC': '#FECACA',
  };

  const BORDER_COLOR = '#7C3AED';

  return (
    <PageShell
      title="Sales Contracts"
      subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''} pending Jakarta approval`}
      actions={
        <>
        <Button
          variant="ghost"
          size="sm"
            onClick={fetchOrders}
          loading={loading}
          leftIcon={<RefreshCw size={13} />}
        >
          Refresh
        </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewOrder(true)}
            leftIcon={<Plus size={13} />}
          >
            + New Sales Contract
          </Button>
        </>
      }
      noPadding
    >
      <div style={{
        backgroundColor: '#F0F4F8',
        minHeight: '100vh',
        padding: '24px 32px',
      }}>

        {/* Section header */}
          <p style={{
            fontSize:      13,
            fontWeight:    600,
            color:         '#0F1E2E',
            padding:      '12px 0',
            borderBottom: '1px solid #E5E7EB',
            marginBottom: 16,
          }}>
          Awaiting Jakarta Approval
          </p>

        {/* Table */}
        <div style={{
          background:    '#FFFFFF',
          border:       '1px solid #E5E7EB',
          borderRadius: 12,
          overflow:     'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ width: 4, padding: 0 }} />
                {['DATE', 'KP CODE', 'CONSTRUCTION', 'CUSTOMER', 'DATE SUBMITTED', 'ACC STATUS'].map(c => (
                  <th key={c} style={{
                    padding:    '0 16px',
                    height:     36,
                    fontSize:   11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color:      '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <style>{SHIMMER}</style>
                  {[0, 1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
                      <td style={{ borderLeft: `3px solid ${BORDER_COLOR}`, paddingLeft: 13, paddingRight: 0 }} />
                      {[0, 1, 2, 3, 4, 5].map(j => (
                        <td key={j} style={{ padding: '0 16px', height: 44 }}>
                          <div style={{
                            height: 12, borderRadius: 4,
                            background: '#E5E7EB',
                            animation: `__sac_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite`,
                            width: j === 2 ? '80%' : '60%',
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                      No orders awaiting Jakarta approval.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      transition: 'background 150ms',
                      height: 44,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ borderLeft: `3px solid ${BORDER_COLOR}`, paddingLeft: 13, paddingRight: 0 }} />
                    <td style={{ padding: '0 16px', height: 44, fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {formatDate(row.tgl)}
                  </td>
                  <td style={{ padding: '0 16px', height: 44 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
                        {row.kp}
                    </span>
                  </td>
                    <td style={{
                      padding: '0 16px', height: 44, fontSize: 13, color: '#0F1E2E',
                      maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.codename || '—'}
                  </td>
                  <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                      {row.permintaan || '—'}
                  </td>
                  <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                      {row.ts ? formatDate(row.ts) : '—'}
                  </td>
                  <td style={{ padding: '0 16px 0 0', height: 44 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      height: 24, padding: '0 10px',
                      borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: ACC_BG[row.acc ?? ''] ?? '#FFFBEB',
                        color: ACC_COLOR[row.acc ?? ''] ?? '#D97706',
                        border: `1px solid ${ACC_BORDER[row.acc ?? ''] ?? '#FDE68A'}`,
                    }}>
                        {row.acc ?? 'Pending'}
                    </span>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewOrderModal
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        onSubmit={handleNewOrder}
        loading={submitting}
        selectedSpec={selectedSpec}
        onSpecChange={setSelectedSpec}
      />
    </PageShell>
  );
}

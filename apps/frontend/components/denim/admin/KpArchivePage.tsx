'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../lib/authFetch';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Archive, Search } from 'lucide-react';
import { format } from 'date-fns';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type ArchivedKP = {
  id: number;
  kp: string;
  original_kp: string;
  tgl: string;
  codename: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  te: number | null;
  lebar: number | null;
  qr: number | null;
  pcs: number | null;
  acc: string | null;
  pipeline_status: string;
  kp_status: string;
};

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

/* ─────────────────────────────────────────────────────────
   Inline field label + value pair
   ───────────────────────────────────────────────────────── */
function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{
        fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: '#9CA3AF',
      }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E', lineHeight: 1.4 }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────── */
export default function KpArchivePage() {
  const [rows, setRows] = useState<ArchivedKP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchArchived = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      const data = await authFetch<ArchivedKP[]>(`/denim/admin/kp-archive?${params}`);
      if (Array.isArray(data)) {
        setRows(data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error('Failed to fetch archive:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchArchived, 300);
    return () => clearTimeout(timer);
  }, [fetchArchived]);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  /* ── Loading skeletons ───────────────────────────── */
  if (loading) {
    return (
      <PageShell
        title="KP Archive"
        subtitle="Archived and rejected contracts"
        noPadding
      >
        <div style={{ padding: '24px 32px' }}>
          {/* Search skeleton */}
          <div style={{
            height: 36, width: 240,
            background: 'var(--border)', borderRadius: 8,
            marginBottom: 16,
          }} />
          {/* Table skeleton */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '3px 1fr 1fr 1fr 80px 80px 100px 120px',
              height: 40,
              background: 'var(--content-bg)',
              borderBottom: '1px solid var(--border)',
              padding: '0 16px',
              alignItems: 'center',
            }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{
                  height: 10, borderRadius: 4,
                  background: 'var(--border)', opacity: 0.6,
                }} />
              ))}
            </div>
            {/* Data rows */}
            {[...Array(5)].map((_, r) => (
              <div key={r} style={{
                display: 'grid',
                gridTemplateColumns: '3px 1fr 1fr 1fr 80px 80px 100px 120px',
                height: 44,
                borderBottom: '1px solid #F3F4F6',
                padding: '0 16px',
                alignItems: 'center',
                background: '#FFFFFF',
              }}>
                <div />
                {[...Array(7)].map((_, c) => (
                  <div key={c} style={{
                    height: 10, borderRadius: 4,
                    background: 'var(--border)', opacity: 0.4,
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Empty state ────────────────────────────────── */
  if (!loading && rows.length === 0) {
    return (
      <PageShell
        title="KP Archive"
        subtitle="Archived and rejected contracts"
        noPadding
      >
        <div style={{ padding: '24px 32px' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: '0 1 280px' }}>
              <Search size={14} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search by KP code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  paddingRight: 12,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,122,155,0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          {/* Empty card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '64px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <Archive size={32} style={{ color: 'var(--border)', marginBottom: 8 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              No archived contracts
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : 'Rejected contracts will appear here'}
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Main render ─────────────────────────────────── */
  return (
    <PageShell
      title="KP Archive"
      subtitle="Archived and rejected contracts"
      noPadding
    >
      <div style={{ padding: '24px 32px' }}>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: '0 1 280px' }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search by KP code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 32,
                paddingRight: 12,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,122,155,0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3px 1fr 1fr 1fr 80px 80px 100px 120px',
            height: 40,
            background: 'var(--content-bg)',
            borderBottom: '1px solid var(--border)',
            alignItems: 'center',
          }}>
            <div />
            {['Date', 'Original KP', 'Construction', 'Type', 'Width', 'TE', 'ACC', 'Status'].map(col => (
              <div key={col} style={{
                padding: '0 16px',
                fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--text-muted)',
              }}>
                {col}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {rows.map(row => (
            <React.Fragment key={row.id}>
              {/* Data row */}
              <div
                onClick={() => toggleExpand(row.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3px 1fr 1fr 1fr 80px 80px 100px 120px',
                  height: 44,
                  borderBottom: '1px solid #F3F4F6',
                  background: expandedId === row.id ? '#F9FAFB' : '#FFFFFF',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={e => { if (expandedId !== row.id) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { if (expandedId !== row.id) e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <div />
                <div style={{ padding: '0 16px', fontSize: 13, color: '#6B7280' }}>
                  {formatDate(row.tgl)}
                </div>
                <div style={{ padding: '0 16px' }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 600,
                    color: '#1D4ED8',
                    fontSize: 13,
                  }}>
                    {row.original_kp}
                  </span>
                </div>
                <div style={{ padding: '0 16px', fontSize: 13, color: '#0F1E2E' }}>
                  {row.codename || '—'}
                </div>
                <div style={{ padding: '0 16px' }}>
                  {row.kat_kode && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                      background: '#F9FAFB',
                      color: '#6B7280',
                      border: '1px solid #E5E7EB',
                    }}>
                      {row.kat_kode}
                    </span>
                  )}
                </div>
                <div style={{ padding: '0 16px', fontSize: 13, color: '#6B7280' }}>
                  {row.lebar ? `${row.lebar} cm` : '—'}
                </div>
                <div style={{ padding: '0 16px', fontSize: 13, color: '#6B7280' }}>
                  {row.te != null ? row.te.toLocaleString() : '—'}
                </div>
                <div style={{ padding: '0 16px', fontSize: 13, color: '#6B7280' }}>
                  {row.acc || '—'}
                </div>
                <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-text)',
                    border: '1px solid var(--danger-border)',
                    letterSpacing: '0.03em',
                  }}>
                    REJECTED
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleExpand(row.id); }}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '2px 4px',
                      fontSize: 12, fontWeight: 500,
                      color: '#6B7280',
                      fontFamily: 'inherit',
                      borderRadius: 4,
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                  >
                    {expandedId === row.id ? 'Hide' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Expanded detail row */}
              {expandedId === row.id && (
                <div style={{
                  padding:         '16px 24px',
                  backgroundColor: '#F9FAFB',
                  borderTop:      '1px solid #E5E7EB',
                  borderBottom:   '1px solid #E5E7EB',
                  display:        'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap:            16,
                }}>
                  <DetailField label="KP" value={
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#1D4ED8', fontSize: 13 }}>
                      {row.original_kp}
                    </span>
                  } />
                  <DetailField label="Date" value={formatDate(row.tgl)} />
                  <DetailField label="Construction" value={row.codename || '—'} />
                  <DetailField label="Type" value={row.status || '—'} />
                  <DetailField label="Width" value={row.lebar ? `${row.lebar} cm` : '—'} />
                  <DetailField label="TE" value={row.te != null ? row.te.toLocaleString() : '—'} />
                  <DetailField label="QR" value={row.qr || '—'} />
                  <DetailField label="PCS" value={row.pcs || '—'} />
                  <DetailField label="Color" value={row.ket_warna || '—'} />
                  <DetailField label="Category" value={row.kat_kode || '—'} />
                  <DetailField label="ACC" value={row.acc || '—'} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .kp-archive-content { padding: 16px !important; }
        }
      `}</style>
    </PageShell>
  );
}

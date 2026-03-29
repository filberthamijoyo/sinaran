'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────
export type InboxRow = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  te: number | null;
  pipeline_status: string;
};

interface InboxTableProps {
  rows: InboxRow[];
  loading: boolean;
  formBasePath: string;
  emptyMessage?: string;
  stage?: string;
}

// ─── Stage border color ─────────────────────────────────────────
const STAGE_BORDER: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#4A7A9B',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:     '#D97706',
  BBSF:             '#EA580C',
  INSPECT_FINISH:   '#2B506E',
  COMPLETE:         '#059669',
  REJECTED:         '#DC2626',
};

// ─── Helpers ─────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

// ─── Shimmer ───────────────────────────────────────────────────
const SHIMMER = `
@keyframes __inbox_shimmer__ {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.85; }
}`;

function SkeletonRow({ borderColor }: { borderColor: string }) {
  return (
    <>
      <style>{SHIMMER}</style>
      {[0,1,2,3,4].map(i => (
        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
          <td style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 13, paddingRight: 0 }} />
          {[0,1,2,3,4,5,6].map(j => (
            <td key={j} style={{ padding: '0 16px', height: 44 }}>
              <div style={{
                height:        12,
                borderRadius:  4,
                background:    '#E5E7EB',
                animation:     `__inbox_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite`,
                width:         j === 2 ? '80%' : '60%',
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function InboxTable({
  rows,
  loading,
  formBasePath,
  emptyMessage = 'No orders pending.',
  stage,
}: InboxTableProps) {
  const router = useRouter();
  const borderColor = stage ? (STAGE_BORDER[stage] ?? '#B8CDD9') : '#B8CDD9';

  return (
    <div style={{
      background:    '#FFFFFF',
      border:       '1px solid #E5E7EB',
      borderRadius: 12,
      overflow:     'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            {/* Border stripe — no header text */}
            <th style={{ width: 4, padding: 0 }} />
            {[
              { key: 'DATE',         label: 'DATE' },
              { key: 'KP',          label: 'KP CODE' },
              { key: 'CONSTRUCTION', label: 'CONSTRUCTION' },
              { key: 'TYPE',        label: 'TYPE' },
              { key: 'TE',          label: 'TE' },
              { key: 'COLOR',       label: 'COLOR' },
              { key: 'ACTION',      label: '' },
            ].map(h => (
              <th
                key={h.key}
                style={{
                  padding:    '0 16px',
                  height:     36,
                  fontSize:   11,
                  fontWeight: 600,
                  textAlign:  h.key === 'ACTION' ? 'right' : 'left',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:      '#9CA3AF',
                  whiteSpace: 'nowrap',
                }}
              >{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRow borderColor={borderColor} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="6" y="14" width="36" height="28" rx="4" stroke="#E5E7EB" strokeWidth="2"/>
                    <path d="M6 18L24 28L42 18" stroke="#E5E7EB" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M18 8L24 14L30 8" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: '#9CA3AF' }}>{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr
                key={row.id}
                onClick={() => router.push(`${formBasePath}/${row.kp}`)}
                style={{
                  cursor:      'pointer',
                  borderBottom:'1px solid #F3F4F6',
                  transition:  'background 150ms',
                  height:      44,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Border stripe */}
                <td style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 13, paddingRight: 0 }} />

                {/* Date */}
                <td style={{ padding: '0 16px', height: 44, fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {formatDate(row.tgl)}
                </td>

                {/* KP */}
                <td style={{ padding: '0 16px', height: 44 }}>
                  <span style={{
                    fontFamily:  "'IBM Plex Mono', monospace",
                    fontSize:    13,
                    fontWeight:  600,
                    color:       '#1D4ED8',
                  }}>
                    {row.kp}
                  </span>
                </td>

                {/* Construction */}
                <td style={{
                  padding:    '0 16px',
                  height:     44,
                  fontSize:   13,
                  color:      '#0F1E2E',
                  maxWidth:   220,
                  overflow:   'hidden',
                  textOverflow:'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row.codename || '—'}
                </td>

                {/* Type */}
                <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                  {row.kat_kode || '—'}
                </td>

                {/* TE */}
                <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                  {row.te != null ? row.te.toLocaleString() : '—'}
                </td>

                {/* Color */}
                <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                  {row.ket_warna || '—'}
                </td>

                {/* Action */}
                <td
                  style={{ padding: '0 16px 0 0', height: 44, textAlign: 'right' }}
                  onClick={e => { e.stopPropagation(); router.push(`${formBasePath}/${row.kp}`); }}
                >
                  <span style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500, cursor: 'pointer' }}>
                    Fill Form &rarr;
                  </span>
                </td>
              </tr>
            ))
          )
        }</tbody>
      </table>
    </div>
  );
}

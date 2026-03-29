'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { authFetch } from '../../lib/authFetch';
import { useAuth } from '../../lib/AuthContext';
import { format } from 'date-fns';

type RecordItem = Record<string, unknown>;

type PaginatedRecords<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

const SHIMMER = `
@keyframes __hist_shimmer__ { 0%,100%{opacity:0.4} 50%{opacity:0.85} }`;

// ─── Toggle switch ─────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width:         32,
        height:        18,
        borderRadius:  9,
        background:   checked ? 'var(--primary)' : 'var(--border)',
        border:       'none',
        cursor:       'pointer',
        position:     'relative',
        transition:   'background 150ms',
        padding:       0,
        flexShrink:   0,
      }}
    >
      <span style={{
        display:     'block',
        width:       14,
        height:      14,
        borderRadius:'50%',
        background: '#FFFFFF',
        position:   'absolute',
        top:        2,
        left:       checked ? 16 : 2,
        transition: 'left 150ms',
        boxShadow:  '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

// ─── History table ────────────────────────────────────────────
function HistoryTable({
  apiEndpoint,
  stageColor,
  hasSubmittedBy,
}: {
  apiEndpoint: string;
  stageColor: string;
  hasSubmittedBy: boolean;
}) {
  const { user } = useAuth();
  const [rows,   setRows]   = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOnly, setMyOnly] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authFetch<PaginatedRecords<RecordItem>>(apiEndpoint);
      setRows(Array.isArray(result?.data) ? result.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const filtered = myOnly
    ? rows.filter(r => {
        const submittedBy = r.submitted_by as string | undefined;
        return submittedBy && user?.name
          ? submittedBy.toLowerCase().includes(user.name.toLowerCase())
          : false;
      })
    : rows;

  return (
    <>
      {hasSubmittedBy && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Toggle checked={myOnly} onChange={setMyOnly} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            My submissions only
          </span>
        </div>
      )}

      <div style={{
        background:    'var(--content-bg)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        overflow:     'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ width: 3, padding: 0 }} />
              {['DATE', 'KP CODE', 'CONSTRUCTION', 'SUBMITTED', 'STATUS'].map(h => (
                <th key={h} style={{
                  padding:    '0 14px',
                  height:     36,
                  fontSize:   11,
                  fontWeight: 500,
                  color:      'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <style>{SHIMMER}</style>
                {[0,1,2,3,4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--denim-100)' }}>
                    <td style={{ borderLeft: `3px solid ${stageColor}`, padding: 0 }} />
                    {[0,1,2,3,4,5].map(j => (
                      <td key={j} style={{ padding: '0 14px', height: 40 }}>
                        <div style={{
                          height: 12, borderRadius: 4,
                          background: 'var(--denim-100)',
                          animation: `__hist_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite`,
                          width: j === 2 ? '80%' : '60%',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--danger-text)', marginBottom: 8 }}>{error}</p>
                  <Button variant="secondary" size="sm" onClick={fetchRecords}>Retry</Button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {myOnly ? 'No submissions by you.' : 'No records found.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.slice(0, 100).map((row, i) => {
                const date = (row.tgl as string | undefined)
                  ?? (row.tanggal as string | undefined)
                  ?? (row.tg as string | undefined);
                const kp = row.kp as string | undefined;
                const codename = row.codename as string | undefined;
                const submittedBy = row.submitted_by as string | undefined;
                const submittedAt = (row.submitted_at as string | undefined)
                  ?? (row.created_at as string | undefined);
                const pipelineStatus = row.pipeline_status as string | undefined;

                return (
                  <tr
                    key={`${kp ?? i}`}
                    style={{ borderBottom: '1px solid var(--denim-100)', cursor: 'pointer' }}
                    onClick={() => { if (kp) window.location.href = `/denim/admin/orders/${kp}`; }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--denim-50)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ borderLeft: `3px solid ${stageColor}`, padding: 0 }} />
                    <td style={{ padding: '0 14px', height: 40, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(date)}
                    </td>
                    <td style={{ padding: '0 14px', height: 40 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                        {kp || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0 14px', height: 40, fontSize: 13, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {codename || '—'}
                    </td>
                    <td style={{ padding: '0 14px', height: 40, fontSize: 12, color: 'var(--text-muted)' }}>
                      {submittedBy ?? (submittedAt ? formatDate(submittedAt) : '—')}
                    </td>
                    <td style={{ padding: '0 14px', height: 40 }}>
                      {pipelineStatus ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          height: 22, padding: '0 8px',
                          borderRadius: 6, fontSize: 11, fontWeight: 500,
                          background: 'var(--success-bg)', color: 'var(--success-text)',
                        }}>
                          Done
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Stage config ───────────────────────────────────────────────
const STAGE_CONFIG: Record<string, {
  title: string;
  color: string;
  endpoint: string;
  hasSubmittedBy: boolean;
}> = {
  warping:   { title: 'Warping',   color: '#4A7A9B', endpoint: '/api/denim/warping/records',   hasSubmittedBy: false },
  indigo:    { title: 'Indigo',    color: '#0891B2', endpoint: '/api/denim/indigo/records',   hasSubmittedBy: false },
  weaving:   { title: 'Weaving',   color: '#059669', endpoint: '/api/denim/weaving/records',   hasSubmittedBy: false },
};

interface InboxHistoryPageProps {
  stage: string;
}

export default function InboxHistoryPage({ stage }: InboxHistoryPageProps) {
  const config = STAGE_CONFIG[stage];

  if (!config) {
    return (
      <div style={{ padding: '48px 32px' }}>
        <p style={{ fontSize: 15, color: 'var(--danger-text)' }}>
          History not available for this stage.
        </p>
      </div>
    );
  }

  const actions = (
    <a
      href={`/denim/inbox/${stage}`}
      style={{
        display:       'inline-flex',
        alignItems:   'center',
        gap:          6,
        padding:      '0 12px',
        height:       32,
        borderRadius: 'var(--button-radius)',
        fontSize:     12,
        fontWeight:   500,
        color:       'var(--text-secondary)',
        textDecoration: 'none',
      }}
    >
      &larr; Back to Inbox
    </a>
  );

  return (
    <PageShell
      title={`${config.title} History`}
      subtitle="All submissions"
      actions={actions}
      noPadding
    >
      <div style={{ padding: '24px 32px' }}>
        <HistoryTable
          apiEndpoint={config.endpoint}
          stageColor={config.color}
          hasSubmittedBy={config.hasSubmittedBy}
        />
      </div>
    </PageShell>
  );
}

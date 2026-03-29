'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type SaconRow = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  pipeline_status: string;
  sacon: boolean;
  acc: string | null;
  ts: string | null;
  j: number | string | null;
  j_c: number | string | null;
  b_c: number | string | null;
  tb: number | string | null;
  tb_real: number | string | null;
};

type SaconInboxResponse = { count: number; items: SaconRow[] };

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const fmtNum = (v: number | string | null | undefined) => {
  if (v == null) return '—';
  if (typeof v === 'number') return v.toLocaleString('id-ID', { maximumFractionDigits: 3 });
  return v;
};

const SHIMMER = `
@keyframes __sacapp_shimmer__ { 0%,100%{opacity:0.4} 50%{opacity:0.85} }`;

export interface SaconApprovalsPageProps {
  initialData?: { items?: SaconRow[] };
}

export default function SaconApprovalsPage({ initialData }: SaconApprovalsPageProps) {
  const [orders, setOrders] = useState<SaconRow[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingKp, setRejectingKp] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<SaconInboxResponse>(
        '/denim/sacon-inbox?status=awaiting_approval'
      );
      setOrders(data?.items ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData) return;
    fetchOrders();
  }, [fetchOrders]);

  const handleAcc = async (kp: string) => {
    setProcessing(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/sacon-decision`, {
        method: 'POST',
        body: JSON.stringify({ decision: 'ACC' }),
      });
      toast.success(`KP ${kp} approved. Sent to warping.`);
      setOrders(prev => prev.filter(o => o.kp !== kp));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (kp: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setProcessing(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/sacon-decision`, {
        method: 'POST',
        body: JSON.stringify({ decision: 'TIDAK ACC', rejection_reason: rejectionReason }),
      });
      toast.success(`KP ${kp} rejected.`);
      setRejectingKp(null);
      setRejectionReason('');
      setOrders(prev => prev.filter(o => o.kp !== kp));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <PageShell
      title="Sacon Approvals"
      subtitle={loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} awaiting Jakarta ACC`}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchOrders}
          loading={loading}
          leftIcon={<RefreshCw size={13} />}
        >
          Refresh
        </Button>
      }
      noPadding
    >
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '24px 32px' }}>
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
                {[
                  'DATE', 'KP CODE', 'CONSTRUCTION', 'CUSTOMER',
                  'SACON DATE', 'J', 'B/C', 'TB', 'TB REAL', '',
                ].map(h => (
                  <th key={h} style={{
                    padding:    '0 16px',
                    height:     36,
                    fontSize:   11,
                    fontWeight: 600,
                    textAlign:  h === '' ? 'right' : 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color:      '#9CA3AF',
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
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
                      <td style={{ borderLeft: '3px solid #7C3AED', paddingLeft: 13, paddingRight: 0 }} />
                      {[0,1,2,3,4,5,6,7,8,9].map(j => (
                        <td key={j} style={{ padding: '0 16px', height: 44 }}>
                          <div style={{
                            height: 12, borderRadius: 4,
                            background: '#E5E7EB',
                            animation: `__sacapp_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite`,
                            width: j === 2 ? '80%' : '60%',
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', marginBottom: 4 }}>
                      All caught up
                    </p>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                      No orders awaiting Jakarta ACC at the moment.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map(row => (
                  <>
                    <tr
                      key={row.id}
                      style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ borderLeft: '3px solid #7C3AED', paddingLeft: 13, paddingRight: 0 }} />
                      <td style={{ padding: '0 16px', height: 44, fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {formatDate(row.tgl)}
                      </td>
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
                      <td style={{
                        padding:    '0 16px', height: 44,
                        fontSize:   13, color: '#0F1E2E',
                        maxWidth:   220, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.codename || '—'}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                        {row.permintaan || '—'}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {formatDate(row.ts)}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(row.j)}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(row.b_c)}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(row.tb)}
                      </td>
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(row.tb_real)}
                      </td>
                      <td style={{ padding: '0 16px 0 0', height: 44 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            disabled={!!processing}
                            onClick={() => handleAcc(row.kp)}
                            style={{
                              height: 28, padding: '0 12px',
                              borderRadius: 6,
                              border: '1px solid #A7F3D0',
                              background: '#ECFDF5',
                              color: '#059669',
                              fontSize: 12, fontWeight: 600,
                              cursor: processing ? 'not-allowed' : 'pointer',
                              opacity: processing ? 0.6 : 1,
                              transition: 'background 150ms',
                            }}
                            onMouseEnter={e => { if (!processing) (e.currentTarget as HTMLElement).style.background = '#D1FAE5'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ECFDF5'; }}
                          >
                            {processing === row.kp ? <Loader2 size={12} /> : 'ACC'}
                          </button>
                          {rejectingKp !== row.kp ? (
                            <button
                              disabled={!!processing}
                              onClick={() => { setRejectingKp(row.kp); setRejectionReason(''); }}
                              style={{
                                height: 28, padding: '0 12px',
                                borderRadius: 6,
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: 12, fontWeight: 600,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                opacity: processing ? 0.6 : 1,
                                transition: 'background 150ms',
                              }}
                              onMouseEnter={e => { if (!processing) (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                            >
                              TIDAK ACC
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>

                    {/* Rejection reason row */}
                    {rejectingKp === row.kp && (
                      <tr key={`${row.id}-reject`} style={{ background: '#FFF1F2' }}>
                        <td colSpan={11} style={{ padding: '12px 20px' }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
                            Rejection reason for {row.kp}
                          </p>
                          <input
                            type="text"
                            placeholder="e.g. Yarn specification does not match order…"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleReject(row.kp); }}
                            style={{
                              width:         '100%',
                              height:        36,
                              borderRadius:  8,
                              border:        '1px solid #FECDD3',
                              background:    '#FFFFFF',
                              color:         '#0F1E2E',
                              fontSize:      13,
                              padding:       '0 12px',
                              outline:       'none',
                              boxSizing:    'border-box',
                              marginBottom: 10,
                            }}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => { setRejectingKp(null); setRejectionReason(''); }}
                              disabled={!!processing}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={!!processing || !rejectionReason.trim()}
                              onClick={() => handleReject(row.kp)}
                            >
                              {processing === row.kp ? <Loader2 size={13} /> : null}
                              Confirm Rejection
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

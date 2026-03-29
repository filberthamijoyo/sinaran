'use client';

import React from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Inbox } from 'lucide-react';
import { SummaryData, DashboardSummary, STAGE_COLORS } from './types';
import PipelineStagesCard from './PipelineStagesCard';

// ─── Chart (keep existing) ────────────────────────────────────────────────
const EfficiencyChart = dynamic(() => import('./EfficiencyChart').then(m => ({ default: m.EfficiencyChart })), { ssr: false });

// ─── Constants ─────────────────────────────────────────────────────────────
const STAGE_COLORS_PANEL: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#4A7A9B',
  BBSF:             '#EA580C',
  INSPECT_FINISH:   '#2B506E',
  COMPLETE:         '#059669',
  REJECTED:         '#DC2626',
};

// ─── Formatters ────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function stageDaysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

// ─── Sub-components ────────────────────────────────────────────────────────

function HeroCard({ total }: { total: number }) {
  return (
    <div style={{
      backgroundColor:   '#0D1B3E',
      backgroundImage:    "url('/denim_bg.jpg')",
      backgroundSize:     'cover',
      backgroundBlendMode:'multiply',
      borderRadius:       12,
      padding:            '28px 32px',
      border:             '1px solid rgba(255,255,255,0.08)',
      display:            'flex',
      flexDirection:      'column',
      justifyContent:     'space-between',
      minHeight:          220,
    }}>
      <p style={{
        fontSize:       10,
        letterSpacing:  '0.12em',
        textTransform:  'uppercase',
        color:          'rgba(255,255,255,0.45)',
        margin:         0,
        marginBottom:   8,
      }}>
        Production Pipeline
      </p>
      <div>
        <p style={{
          fontSize:       64,
          fontWeight:     800,
          color:          '#FFFFFF',
          fontFamily:     "'IBM Plex Mono', monospace",
          letterSpacing:  '-0.02em',
          lineHeight:     1,
          margin:         0,
        }}>
          {total.toLocaleString()}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0 0' }}>
          total orders
        </p>
      </div>
      <div />
    </div>
  );
}

function KpiActivePipeline({ count }: { count: number }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:          '1px solid #E5E7EB',
      borderRadius:    12,
      padding:         '20px 24px',
    }}>
      <p style={{
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         '#9CA3AF',
        margin:        0,
        marginBottom:  10,
      }}>
        Active Pipeline
      </p>
      <p style={{
        fontSize:      44,
        fontWeight:    800,
        color:         '#0F1E2E',
        fontFamily:    "'IBM Plex Mono', monospace",
        lineHeight:    1,
        margin:        0,
      }}>
        {count}
      </p>
      <p style={{ fontSize: 13, color: '#9CA3AF', margin: '8px 0 0 0' }}>
        orders in pipeline
      </p>
    </div>
  );
}

function KpiNeedsAttention({ count }: { count: number }) {
  return (
    <div style={{
      backgroundColor: '#1A0505',
      border:          '1px solid rgba(220,38,38,0.20)',
      borderRadius:    12,
      padding:         '20px 24px',
    }}>
      <p style={{
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         'rgba(220,38,38,0.60)',
        margin:        0,
        marginBottom:  10,
      }}>
        Needs Attention
      </p>
      <p style={{
        fontSize:      44,
        fontWeight:    800,
        color:         '#DC2626',
        fontFamily:    "'IBM Plex Mono', monospace",
        lineHeight:    1,
        margin:        0,
      }}>
        {count}
      </p>
      <p style={{ fontSize: 13, color: 'rgba(220,38,38,0.50)', margin: '8px 0 0 0' }}>
        pending &gt; 3 days
      </p>
    </div>
  );
}

function StatCardPanel({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: number;
  sublabel: string;
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:          '1px solid #E5E7EB',
      borderRadius:    10,
      padding:         '16px 20px',
    }}>
      <p style={{
        fontSize:      10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color,
        margin:        0,
        marginBottom:  8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize:      28,
        fontWeight:    700,
        color:         '#0F1E2E',
        fontFamily:    "'IBM Plex Mono', monospace",
        lineHeight:    1,
        margin:        0,
      }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
        {sublabel}
      </p>
    </div>
  );
}

// ─── Stale Orders Card ──────────────────────────────────────────────────────
interface StaleOrderItem { kp: string; pipeline_status: string; updatedAt: string; }

function StaleOrdersCard({ staleOrders }: { staleOrders: StaleOrderItem[] }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:          '1px solid #E5E7EB',
      borderRadius:    12,
      padding:         '20px 24px',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: '0 0 4px 0' }}>
        Stale Orders
      </p>
      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 14px 0' }}>
        Active orders with no updates in 7+ days
      </p>

      {staleOrders.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>No stale orders</p>
        </div>
      ) : (
        <>
          <div style={{
            display:         'grid',
            gridTemplateColumns: '80px 1fr 56px',
            gap:              8,
            paddingBottom:    8,
            borderBottom:     '1px solid #F3F4F6',
            marginBottom:     4,
          }}>
            {(['KP', 'Stage', 'Days'] as const).map(h => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {h}
              </span>
            ))}
          </div>
          {staleOrders.map(order => {
            const days = stageDaysAgo(order.updatedAt);
            const daysColor = days > 14 ? '#DC2626' : days >= 7 ? '#D97706' : '#9CA3AF';
            return (
              <div
                key={order.kp}
                style={{
                  display:         'grid',
                  gridTemplateColumns: '80px 1fr 56px',
                  gap:              8,
                  paddingTop:       8,
                  paddingBottom:    8,
                  borderBottom:     '1px solid #F9FAFB',
                  alignItems:      'center',
                }}
              >
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize:   12,
                  fontWeight: 600,
                  color:      '#1D4ED8',
                }}>
                  {order.kp}
                </span>
                <span style={{
                  fontSize:   11,
                  fontWeight: 500,
                  color:      STAGE_COLORS[order.pipeline_status] ?? '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {order.pipeline_status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 12, color: daysColor, textAlign: 'right' }}>
                  {days}d
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Recent Activity Card ───────────────────────────────────────────────────
function RecentActivityCard({ recentActivity }: { recentActivity: StaleOrderItem[] }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:          '1px solid #E5E7EB',
      borderRadius:    12,
      padding:         '20px 24px',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: '0 0 16px 0' }}>
        Recent Activity
      </p>

      {recentActivity.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
          <Inbox size={20} style={{ color: '#9CA3AF', marginRight: 8 }} />
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>No recent activity</p>
        </div>
      ) : (
        recentActivity.slice(0, 10).map((item, i) => (
          <div
            key={`${item.kp}-${item.updatedAt}-${i}`}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              height:       40,
              borderBottom: i < 9 ? '1px solid #F9FAFB' : 'none',
            }}
          >
            <span style={{
              width:             8,
              height:            8,
              borderRadius:      '50%',
              backgroundColor:   STAGE_COLORS[item.pipeline_status] ?? '#9CA3AF',
              flexShrink:        0,
            }} />
            <span style={{
              fontFamily:  "'IBM Plex Mono', monospace",
              fontSize:    13,
              fontWeight:  600,
              color:       '#1D4ED8',
            }}>
              {item.kp}
            </span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {item.pipeline_status.replace(/_/g, ' ').toLowerCase()}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
              {timeAgo(item.updatedAt)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
export default function OverviewPanel({ data }: { data: SummaryData | null }) {
  const total            = data?.total ?? 0;
  const inProgress       = data?.inProgress ?? 0;
  const blockedCount     = data?.blockedCount ?? 0;
  const stageCounts      = data?.stageCounts ?? {};

  const pendingApproval  = stageCounts['PENDING_APPROVAL'] ?? 0;
  const inWarping        = stageCounts['WARPING'] ?? 0;
  const inFinishing      = (stageCounts['BBSF'] ?? 0) + (stageCounts['INSPECT_FINISH'] ?? 0);
  const completed        = stageCounts['COMPLETE'] ?? 0;

  const chartData = (data?.weeklyEfficiency ?? []).map(w => ({
    ...w,
    weekLabel: format(new Date(w.week), 'MMM d'),
  }));

  const summaryData = data as DashboardSummary | null;
  const recentActivity: StaleOrderItem[] = (summaryData?.recentActivity ?? []).map(a => ({
    kp:              a.kp,
    pipeline_status: a.pipeline_status,
    updatedAt:       a.updatedAt,
  }));

  // Stale = active orders (not COMPLETE/REJECTED) with no update in 7+ days
  const staleOrders: StaleOrderItem[] = recentActivity.filter(a => {
    if (a.pipeline_status === 'COMPLETE' || a.pipeline_status === 'REJECTED') return false;
    return stageDaysAgo(a.updatedAt) >= 7;
  });

  return (
    <div style={{
      padding:         '24px 28px',
      display:         'flex',
      flexDirection:   'column',
      gap:             16,
      boxSizing:       'border-box',
    }}>
      { /* ── Row 1: Hero + KPI cluster ───────────────────────────── */ }
      <div style={{
        display:            'grid',
        gridTemplateColumns: '2fr 1fr',
        gap:                16,
        minHeight:          220,
      }}>
        <HeroCard total={total} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <KpiActivePipeline  count={inProgress} />
          <KpiNeedsAttention count={blockedCount} />
        </div>
      </div>

      { /* ── Row 2: 4 stat cards ──────────────────────────────────── */ }
      <div style={{
        display:            'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                12,
      }}>
        <StatCardPanel label="Pending Approval" value={pendingApproval} sublabel="awaiting factory" color="#D97706" />
        <StatCardPanel label="In Warping"      value={inWarping}       sublabel="at warping station"  color="#4A7A9B" />
        <StatCardPanel label="In Finishing"    value={inFinishing}     sublabel="at finishing station" color="#EA580C" />
        <StatCardPanel label="Completed"       value={completed}       sublabel="orders completed"    color="#059669" />
      </div>

      { /* ── Row 3: Efficiency chart + Pipeline stages ─────────────── */ }
      <div style={{
        display:            'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                16,
        minHeight:          280,
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border:          '1px solid #E5E7EB',
          borderRadius:    12,
          padding:         '20px 24px',
          minHeight:       280,
          display:         'flex',
          flexDirection:   'column',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: '0 0 16px 0' }}>
            Weaving Efficiency
          </p>
          {chartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>No efficiency data</p>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <EfficiencyChart chartData={chartData} />
            </div>
          )}
        </div>

        <PipelineStagesCard stageCounts={stageCounts} />
      </div>

      { /* ── Row 4: Stale Orders + Recent Activity ───────────────── */ }
      <div style={{
        display:            'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                16,
      }}>
        <StaleOrdersCard   staleOrders={staleOrders} />
        <RecentActivityCard recentActivity={recentActivity} />
      </div>
    </div>
  );
}

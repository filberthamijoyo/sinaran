'use client';

import React from 'react';
import { Package2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DashboardSummary } from './types';
import { Inbox } from 'lucide-react';
import { STAGE_ACTIVITY_CONFIG, formatRelativeTime } from './types';

/* ================================================================
   SHARED SUB-COMPONENTS
   ================================================================ */
function StatCard({ label, value, sub, icon: Icon, accent, dark = false }: {
  label: string; value: string | number; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string; dark?: boolean;
}) {
  const bg         = dark ? '#111318' : '#FFFFFF';
  const border     = dark ? '#2A2F3E' : '#E5E7EB';
  const labelColor = '#9CA3AF';
  const subColor   = dark ? '#9CA3AF' : '#6B7280';
  const valueColor = accent;

  return (
    <div
      className="ob-dashboard-grid"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '20px 24px',
        minHeight: 120,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: labelColor }}>{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
        )}
      </div>
      <p className="font-bold tracking-tight" style={{ color: valueColor, fontSize: '2rem', lineHeight: 1.1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs mt-1" style={{ color: subColor }}>{sub}</p>
    </div>
  );
}

/* ================================================================
   ACTIVITY FEED (dark card)
   ================================================================ */
function ActivityFeed({ recentActivity }: { recentActivity?: DashboardSummary['recentActivity'] }) {
  const items = recentActivity && recentActivity.length > 0 ? recentActivity : null;

  return (
    <div style={{ background: '#111318', border: '1px solid #2A2F3E', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
          Activity Feed
        </p>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#059669',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      </div>

      {!items ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 32, gap: 8 }}>
          <Inbox size={20} style={{ color: '#4B5563' }} />
          <p style={{ fontSize: 13, color: '#6B7280' }}>No recent activity</p>
        </div>
      ) : (
        <div>
          {items.slice(0, 8).map(item => {
            const stageConfig = STAGE_ACTIVITY_CONFIG[item.pipeline_status] ?? {
              label: item.pipeline_status,
              icon: '📦',
              color: '#6B7280',
              bgColor: '#F3F4F6',
            };
            return (
              <div
                key={item.kp}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  height: 44,
                  borderBottom: '1px solid #2A2F3E',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1C2030'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: stageConfig.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 8,
                    fontSize: 11,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{stageConfig.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 10 }}>
                  <p style={{ fontSize: 13, color: '#F3F4F6', lineHeight: 1.3 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#93BBFC', fontSize: 12 }}>{item.kp}</span>
                    {' — '}
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>{stageConfig.label}</span>
                  </p>
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{formatRelativeTime(item.updatedAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   JAKARTA HQ TAB
   ================================================================ */
interface Props {
  data: DashboardSummary;
}

export default function JakartaTab({ data }: Props) {
  const total = data?.total ?? 0;
  const completedThisMonth = data?.stageCounts['COMPLETE'] ?? 0;
  const rejectedCount = data?.stageCounts['REJECTED'] ?? 0;

  return (
    <div>
      <div className="ob-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Total Contracts — most important for Jakarta HQ, make it the dark accent */}
        <StatCard label="Total Contracts"    value={total.toLocaleString()}                  sub="all time"           icon={Package2}     accent="#F3F4F6" dark />
        <StatCard label="Active Orders"      value={(data?.inProgress ?? 0).toLocaleString()} sub="in production"      icon={Clock}        accent="#D97706" />
        <StatCard label="Completed This Month" value={completedThisMonth.toLocaleString()}    sub="all time total"     icon={CheckCircle2} accent="#059669" />
        {/* Rejected — negative metric, dark card for emphasis */}
        <StatCard label="Rejected"            value={rejectedCount}                         sub="cancelled orders"   icon={AlertTriangle} accent="#F3F4F6" dark />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ob-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

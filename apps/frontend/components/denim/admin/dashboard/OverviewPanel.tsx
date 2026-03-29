'use client';

import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { BentoHeroCard } from './BentoHeroCard';
import { BentoKPICards } from './BentoKPICards';
import { EfficiencyChart } from './EfficiencyChart';
import { PipelineStatusChart } from './PipelineStatusChart';
import { ActivityFeedCard } from './ActivityFeedCard';
import { SummaryData, DashboardSummary, STAGE_COLORS } from './types';

const ACTIVE_STAGES = ['WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'BBSF', 'INSPECT_FINISH'];

/* ─── Shared card wrappers ─────────────────────────────── */

function DarkCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0D1B2E 0%, #0A1628 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      minHeight: 160,
      ...style,
    }}>
      {children}
    </div>
  );
}

function LightCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      minHeight: 160,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── 3-col stat cards ─────────────────────────────── */

function StatCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string | number; sub: string;
  accent: string; icon?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r4)',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
      minHeight: 120,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--t3)',
        }}>
          {label}
        </p>
        {icon && (
          <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <p style={{
        fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1.1,
        fontFamily: "'IBM Plex Mono', monospace",
        marginTop: 6,
      }}>
        {typeof value === 'number' ? (value > 0 ? value.toLocaleString() : '—') : value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>
        {sub}
      </p>
    </div>
  );
}

/* ─── OverviewPanel ─────────────────────────────────── */

export default function OverviewPanel({ data }: { data: SummaryData | null }) {
  const total            = data?.total ?? 0;
  const inProgress       = data?.inProgress ?? 0;
  const completed        = (data as DashboardSummary)?.recentlyCompleted ?? 0;
  const needsAttention   = data?.blockedCount ?? 0;
  const pendingApprovals = data?.stageCounts?.['PENDING_APPROVAL'] ?? 0;

  const chartData = data?.weeklyEfficiency.map(w => ({
    ...w,
    weekLabel: format(new Date(w.week), 'MMM d'),
  })) ?? [];

  const getStageCount = (key: string) => data?.stageCounts?.[key] ?? 0;

  const pipelineRaw = ACTIVE_STAGES.map(s => ({
    short:  s.replace('_', ' '),
    status: s,
    count:  getStageCount(s),
    color:  STAGE_COLORS[s] ?? '#6B7280',
  })).filter(d => d.count > 0);

  const summaryData = data as DashboardSummary | null;
  const recentActivity = summaryData?.recentActivity;

  return (
    <div style={{ padding: 24, background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ROW 1: Hero (7fr) + KPI Cluster (5fr) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: 12,
        marginBottom: 12,
      }}>
        {/* Hero — total orders, dark */}
        <BentoHeroCard total={total} />

        {/* KPI Cluster */}
        <div style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gap: 12,
        }}>
          <BentoKPICards inProgress={inProgress} needsAttention={needsAttention} />
        </div>
      </div>

      {/* ROW 2: 3 stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 12,
      }}>
        <StatCard
          label="Completed"
          value={completed}
          sub="last 30 days"
          accent="var(--green)"
          icon={<CheckCircle2 size={14} />}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          sub="awaiting review"
          accent="var(--amber)"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          sub="active pipeline"
          accent="var(--blue)"
        />
      </div>

      {/* ROW 3: Efficiency chart + Pipeline status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 12,
      }}>
        <EfficiencyChart chartData={chartData} />
        <PipelineStatusChart funnelData={pipelineRaw} />
      </div>

      {/* ROW 4: Activity Feed */}
      <ActivityFeedCard recentActivity={recentActivity} />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Factory, TrendingUp, AlertTriangle } from 'lucide-react';
import { DashboardSummary } from './types';

/* ================================================================
   SHARED SUB-COMPONENTS
   ================================================================ */
function StatusPill({ status }: { status: string }) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(document.documentElement.classList.contains('dark') || mq.matches);
    const handler = () => setIsDark(document.documentElement.classList.contains('dark'));
    const mutationObserver = new MutationObserver(handler);
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mutationObserver.disconnect();
  }, []);

  const mapLight: Record<string, { label: string; color: string; bg: string }> = {
    good:    { label: 'Good',    color: '#059669', bg: '#D1FAE5' },
    average: { label: 'Average', color: '#8B5000', bg: '#FEF3C7' },
    low:     { label: 'Low',     color: '#DC2626', bg: '#FEE2E2' },
  };
  const mapDark: Record<string, { label: string; color: string; bg: string }> = {
    good:    { label: 'Good',    color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
    average: { label: 'Average', color: '#FCD34D', bg: 'rgba(252,211,77,0.12)' },
    low:     { label: 'Low',     color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const c = (isDark ? mapDark : mapLight)[status] ?? (isDark ? mapDark : mapLight).average;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent, dark = false }: {
  label: string; value: string | number; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string; dark?: boolean;
}) {
  const bg     = dark ? '#111318' : '#FFFFFF';
  const border = dark ? '#2A2F3E' : '#E5E7EB';
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

function PipelineCard({ label, count, stage, color, bgColor, route, router }: {
  label: string; count: number; stage: string; color: string; bgColor: string; route: string; router: ReturnType<typeof useRouter>;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '20px 24px',
      }}
      onClick={() => router.push(route)}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7F8FA'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
          <span className="w-3 h-3 rounded-full" style={{ background: color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0F1117' }}>{label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>{stage}</p>
        </div>
        <span
          style={{
            background: bgColor,
            color,
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {(count ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   FACTORY TAB
   ================================================================ */
interface Props {
  data: DashboardSummary;
}

export default function FactoryTab({ data }: Props) {
  const router = useRouter();
  const getStageCount = (key: string) => data?.stageCounts?.[key] ?? 0;

  const machineStatus = data?.machineEfficiencyToday.map(m => ({
    ...m,
    status: m.avg_efficiency >= 80 ? 'good' : m.avg_efficiency >= 70 ? 'average' : 'low',
  })).sort((a, b) => a.avg_efficiency - b.avg_efficiency) ?? [];

  const avgEfficiencyToday = machineStatus.length > 0
    ? (machineStatus.reduce((s, m) => s + m.avg_efficiency, 0) / machineStatus.length).toFixed(1)
    : '';
  const activeLooms   = machineStatus.length;
  const lowEffCount   = data?.lowEfficiencyMachines.length ?? 0;

  return (
    <div className="ob-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>

      {/* KPI Row: Active Looms is the most important — make it the dark accent card */}
      <StatCard label="Active Looms Today" value={activeLooms} sub="machines running" icon={Factory} accent="#F3F4F6" dark />
      <StatCard label="Avg Efficiency Today" value={`${avgEfficiencyToday}%`} sub="all machines" icon={TrendingUp} accent="#059669" />
      <StatCard label="Low Efficiency Alerts" value={lowEffCount} sub="machines below 70%" icon={AlertTriangle} accent="#DC2626" />

      {/* Machine Status Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 12 }}>
          Machine Status Today
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Machine', 'Shifts', 'Avg Eff', 'Status'].map(h => (
                <th
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#9CA3AF',
                    paddingBottom: 8,
                    borderBottom: '1px solid #E5E7EB',
                    textAlign: h === 'Machine' ? 'left' : 'right',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machineStatus.map(m => (
              <tr key={m.machine} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 0', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", color: '#0F1117' }}>{m.machine}</td>
                <td style={{ padding: '10px 0', fontSize: 14, color: '#6B7280', textAlign: 'right' }}>{m.record_count}</td>
                <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#0F1117', textAlign: 'right' }}>{m.avg_efficiency}%</td>
                <td style={{ padding: '10px 0', textAlign: 'center' }}><StatusPill status={m.status} /></td>
              </tr>
            ))}
            {machineStatus.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>No machine data for today</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Efficiency Breakdown */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 16 }}>
          Efficiency Breakdown
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Good (>80%)',    machineStatus.filter(m => m.status === 'good').length,    '#059669', '#ECFDF5'],
            ['Average (70–80%)', machineStatus.filter(m => m.status === 'average').length, '#D97706', '#FFFBEB'],
            ['Low (<70%)',     machineStatus.filter(m => m.status === 'low').length,      '#DC2626', '#FEF2F2'],
          ].map(([label, count, color, bg]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
              <span style={{ fontSize: 13, width: 120, color: '#6B7280', flexShrink: 0 }}>{label as string}</span>
              <div style={{ flex: 1, height: 28, borderRadius: 6, background: bg as string, overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 6,
                    background: color as string,
                    opacity: 0.8,
                    width: `${Math.max(0.5, ((count as number) / Math.max(activeLooms, 1)) * 100)}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 11, fontWeight: 600, color: '#374151' }}>
                  {count as number} machines
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline cards */}
      <div className="ob-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <PipelineCard label="Pending Approvals" count={data?.warpingQueue ?? 0} stage="awaiting factory review" color="#D97706" bgColor="#FFFBEB" route="/denim/admin/orders?status=PENDING_APPROVAL" router={router} />
        <PipelineCard label="In Warping"        count={getStageCount('WARPING')}       stage="active beams"       color="#1D4ED8" bgColor="#EFF6FF" route="/denim/admin/orders?status=WARPING"       router={router} />
        <PipelineCard label="In Indigo"         count={getStageCount('INDIGO')}         stage="dyeing process"     color="#0891B2" bgColor="#F0FDFA" route="/denim/admin/orders?status=INDIGO"        router={router} />
        <PipelineCard label="In Weaving"        count={getStageCount('WEAVING')}         stage="loom production"    color="#059669" bgColor="#ECFDF5" route="/denim/admin/orders?status=WEAVING"       router={router} />
        <PipelineCard label="Inspect Gray"      count={getStageCount('INSPECT_GRAY')}    stage="quality check queue" color="#D97706" bgColor="#FFFBEB" route="/denim/admin/orders?status=INSPECT_GRAY"  router={router} />
        <PipelineCard label="In BBSF"            count={getStageCount('BBSF')}            stage="finishing process"  color="#7C3AED" bgColor="#F5F3FF" route="/denim/admin/orders?status=BBSF"            router={router} />
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

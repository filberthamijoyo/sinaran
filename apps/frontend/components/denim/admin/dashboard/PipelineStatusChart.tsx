'use client';

import dynamic from 'next/dynamic';
const BarChart = dynamic(() => import('recharts').then(m => ({ default: m.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => ({ default: m.Bar })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => ({ default: m.Cell })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false });

const ACTIVE_STAGES = ['WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'BBSF', 'INSPECT_FINISH'];

const STAGE_COLORS: Record<string, string> = {
  WARPING:        '#4A7A9B',
  INDIGO:         '#0891B2',
  WEAVING:        '#059669',
  INSPECT_GRAY:   '#D97706',
  BBSF:           '#EA580C',
  INSPECT_FINISH: '#2B506E',
  SACON:          '#8B5CF6',
  STALED:         '#9CA3AF',
};

interface FunnelEntry {
  short: string;
  count: number;
  color: string;
  status?: string;
  stage?: string;
  pipeline_status?: string;
}

interface Props {
  funnelData: FunnelEntry[];
}

export function PipelineStatusChart({ funnelData }: Props) {
  const chartData = funnelData
    .filter(d => {
      const raw = (d.status ?? d.stage ?? d.pipeline_status ?? d.short ?? '').toUpperCase();
      return ACTIVE_STAGES.includes(raw);
    })
    .map(d => {
      const key = (d.status ?? d.stage ?? d.pipeline_status ?? d.short ?? '').toUpperCase();
      return {
        ...d,
        short: d.short || key.replace('_', ' '),
        color: STAGE_COLORS[key] ?? d.color ?? '#9CA3AF',
      };
    });

  if (chartData.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--t3)' }}>No pipeline data</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      minHeight: 200,
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
          Active Pipeline
        </p>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
          current stage distribution
        </p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" barSize={18}>
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'var(--t3)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="short"
            type="category"
            tick={{ fontSize: 10, fill: 'var(--t2)' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            wrapperStyle={{ cursor: 'crosshair' }}
            contentStyle={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 11,
              boxShadow: 'var(--shadow-md)',
              padding: '6px 10px',
            }}
            labelStyle={{ color: 'var(--t2)', fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

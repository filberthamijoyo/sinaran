'use client';

import dynamic from 'next/dynamic';
const ResponsiveContainer = dynamic(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => ({ default: m.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => ({ default: m.Line })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false });

interface Props {
  chartData: Array<{ weekLabel: string; avg_efficiency: number }>;
}

export function EfficiencyChart({ chartData }: Props) {
  const lastValue = chartData.length > 0
    ? `${chartData[chartData.length - 1].avg_efficiency.toFixed(1)}%`
    : null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      minHeight: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
            Weaving Efficiency
          </p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
            8-week rolling avg
          </p>
        </div>
        {lastValue && (
          <span style={{
            background: 'var(--blue-dim)',
            color: 'var(--blue)',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
          }}>
            {lastValue}
          </span>
        )}
      </div>

      {chartData.length === 0 ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--t3)' }}>No efficiency data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12}/>
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 10, fill: 'var(--t3)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 10, fill: 'var(--t3)' }}
              axisLine={false}
              tickLine={false}
              width={28}
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
              itemStyle={{ color: 'var(--blue)' }}
              formatter={(v: unknown) => [`${v as number}%`, 'Efficiency']}
            />
            <Line
              type="monotone"
              dataKey="avg_efficiency"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

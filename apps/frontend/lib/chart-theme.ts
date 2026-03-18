export const CHART_COLORS = {
  indigo:  '#4338ca',
  emerald: '#059669',
  amber:   '#d97706',
  rose:    '#e11d48',
  cyan:    '#0891b2',
  slate:   '#64748b',
};

export const chartDefaults = {
  cartesianGrid: { strokeDasharray: '3 3', stroke: '#27272a', vertical: false },
  xAxis: { tick: { fontSize: 11, fill: '#71717a', fontFamily: 'var(--font-sans)' }, axisLine: false, tickLine: false },
  yAxis: { tick: { fontSize: 11, fill: '#71717a', fontFamily: 'var(--font-sans)' }, axisLine: false, tickLine: false, width: 44 },
  tooltip: {
    contentStyle: {
      background: '#18181f',
      border: '1px solid #27272a',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'var(--font-sans)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    labelStyle: { fontWeight: 600, color: '#f4f4f5' },
    itemStyle: { color: '#a1a1aa' },
  },
};

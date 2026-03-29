/* ================================================================
   Chart Theme — Atmospheric Industrial Design System
   Applied to all Recharts components across the application.
   Phase 4: Premium Polish
   ================================================================ */

export const CHART_COLORS = {
  primary:  '#003D6B',  // Deep Ocean Blue
  indigo:   '#006874',  // Indigo/Teal
  emerald:  '#059669',  // Success Green
  amber:    '#D97706',  // Warning Amber
  rose:     '#DC2626',  // Error Red
  copper:   '#D4630A',  // Brand Copper
  purple:   '#6750A4',  // BBSF Purple
  slate:    '#4B5563',  // Muted Text
};

export const CHART_GRADIENTS = {
  primary: {
    id:    'chartGradPrimary',
    color: '#003D6B',
  },
  indigo: {
    id:    'chartGradIndigo',
    color: '#006874',
  },
  emerald: {
    id:    'chartGradEmerald',
    color: '#059669',
  },
  copper: {
    id:    'chartGradCopper',
    color: '#D4630A',
  },
};

/* Reusable SVG gradient definitions for <defs> in charts */
export const CHART_GRADIENT_DEFS = `
  <defs>
    <linearGradient id="chartGradPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#003D6B" stopOpacity={0.28} />
      <stop offset="95%" stopColor="#003D6B" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="chartGradIndigo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#006874" stopOpacity={0.28} />
      <stop offset="95%" stopColor="#006874" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="chartGradEmerald" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#059669" stopOpacity={0.28} />
      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="chartGradCopper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#D4630A" stopOpacity={0.28} />
      <stop offset="95%" stopColor="#D4630A" stopOpacity={0} />
    </linearGradient>
  </defs>
`;

/* ================================================================
   ANIMATION PRESETS
   Staggered by index — pass `animationBegin={index * 100}` to each chart.
   ================================================================ */
export const CHART_ANIMATION = {
  /** Default: 500ms, gentle ease */
  default: { animationDuration: 500, isAnimationActive: true },
  /** Fast: 300ms for small bars/dots */
  fast:    { animationDuration: 300, isAnimationActive: true },
  /** Off: disables animation (SSR / print) */
  off:     { animationDuration: 0,   isAnimationActive: false },
};

/* ================================================================
   AXIS STYLES
   ================================================================ */
const AXIS_TICK_STYLE = {
  fontSize:   11,
  fill:        '#9CA3AF',
  fontFamily:  'var(--font-sans)',
};

export const CHART_AXIS = {
  xAxis: {
    tick:          AXIS_TICK_STYLE,
    axisLine:      false,
    tickLine:      false,
    dy:            6,
  },
  yAxis: {
    tick:          AXIS_TICK_STYLE,
    axisLine:      false,
    tickLine:      false,
    width:         44,
    dx:            -4,
  },
};

/* ================================================================
   CARTESIAN GRID
   strokeDasharray="4 4" at very low opacity for subtle guidance.
   ================================================================ */
export const CHART_GRID = {
  strokeDasharray: '4 4',
  stroke:          '#E5E9F0',
  strokeOpacity:   0.5,
  vertical:        false,
};

/* Dark mode grid — slightly brighter on dark backgrounds */
export const CHART_GRID_DARK = {
  strokeDasharray: '4 4',
  stroke:          '#2A3848',
  strokeOpacity:   0.8,
  vertical:        false,
};

/* ================================================================
   PREMIUM GLASS TOOLTIP
   Wraps the Recharts Tooltip in the .glass-panel CSS class.
   Apply className="glass-panel" to the <Tooltip> wrapper in JSX,
   then use this contentStyle.
   ================================================================ */
export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background:    'rgba(248, 251, 254, 0.88)',
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    border:       '1px solid rgba(255, 255, 255, 0.60)',
    borderRadius: '20px',
    boxShadow:     '0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 0 rgba(255, 255, 255, 0.80) inset',
    fontSize:      '12px',
    fontFamily:    'var(--font-sans)',
    color:         '#111827',
    padding:       '10px 14px',
    minWidth:      '120px',
  },
  labelStyle: {
    fontWeight:   600,
    color:         '#003D6B',
    fontSize:      '11px',
    fontFamily:    'var(--font-sans)',
    letterSpacing: '0.02em',
    marginBottom:  '4px',
  },
  itemStyle: {
    color:         '#4B5563',
    fontSize:       '12px',
    fontFamily:     'var(--font-sans)',
    paddingTop:     '2px',
  },
};

export const CHART_TOOLTIP_DARK = {
  contentStyle: {
    background:     'rgba(19, 28, 40, 0.88)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border:        '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius:  '20px',
    boxShadow:      '0 8px 32px rgba(0, 0, 0, 0.50), 0 1px 0 rgba(255, 255, 255, 0.04) inset',
    fontSize:       '12px',
    fontFamily:     'var(--font-sans)',
    color:          '#E8ECF0',
    padding:        '10px 14px',
    minWidth:       '120px',
  },
  labelStyle: {
    fontWeight:    600,
    color:          '#4A9FD4',
    fontSize:       '11px',
    fontFamily:     'var(--font-sans)',
    letterSpacing:  '0.02em',
    marginBottom:   '4px',
  },
  itemStyle: {
    color:          '#8B9AAD',
    fontSize:        '12px',
    fontFamily:      'var(--font-sans)',
    paddingTop:      '2px',
  },
};

/* ================================================================
   FULL DEFAULTS OBJECT
   Import this in charts: import { chartDefaults } from '@/lib/chart-theme';
   ================================================================ */
export const chartDefaults = {
  /* Cartesian grid — subtle dashed lines */
  cartesianGrid: CHART_GRID,
  /* Axis config */
  xAxis: CHART_AXIS.xAxis,
  yAxis: CHART_AXIS.yAxis,
  /* Premium glass tooltip */
  tooltip: {
    contentStyle:  CHART_TOOLTIP_STYLE.contentStyle,
    labelStyle:    CHART_TOOLTIP_STYLE.labelStyle,
    itemStyle:     CHART_TOOLTIP_STYLE.itemStyle,
  },
};

/* ================================================================
   AREA CHART — buildGradientMarkup
   Returns the SVG <defs> block for use inside <AreaChart>.
   Usage:
     <AreaChart>
       <BuildGradientDefs color="#003D6B" id="chartGradPrimary" />
       {// ... area elements}
     </AreaChart>
   ================================================================ */
export function buildGradientMarkup(
  color: string = '#003D6B',
  id:    string = 'chartGradPrimary',
  opacityStart: number = 0.28,
  opacityEnd:   number = 0,
) {
  return `<defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="${color}" stopOpacity="${opacityStart}" />
      <stop offset="95%" stopColor="${color}" stopOpacity="${opacityEnd}" />
    </linearGradient>
  </defs>`;
}

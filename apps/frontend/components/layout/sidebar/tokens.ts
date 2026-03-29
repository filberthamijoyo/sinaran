/* ── Sidebar Design Tokens ─────────────────────────────── */
/* Light denim theme:
   Medium-light blue (#4A7A9B) background with denim texture.
   All text is very dark navy (#0A1628) for maximum contrast. */

export const T = {
  /* Background layers */
  bg:             '#4A7A9B',   /* denim-600 — medium-light blue base */
  overlay:        'rgba(74, 122, 155, 0.88)',
  surface:        '#5A96AC',
  surfaceAlt:     '#6BA0BC',
  hover:          'rgba(0, 0, 0, 0.12)',
  active:         'rgba(255, 255, 255, 0.50)',

  /* Borders */
  border:         'rgba(0, 0, 0, 0.15)',
  borderStrong:   'rgba(0, 0, 0, 0.18)',

  /* Accent — very dark navy on light bg (#0A1628) */
  accent:         '#0A1628',    /* near-black navy — maximum contrast on light denim */
  accentDim:      'rgba(10, 22, 40, 0.12)',
  accentGlow:     'rgba(10, 22, 40, 0.20)',
  accentBright:   '#0A1628',

  /* Secondary — muted on light bg */
  secondary:      'rgba(10, 22, 40, 0.35)',
  secondaryDim:   'rgba(10, 22, 40, 0.08)',

  /* Text hierarchy — dark on light denim blue */
  text:           '#0A1628',                    /* unselected nav items — max contrast */
  textBold:       '#0A1628',                   /* hovered nav items */
  textBright:     '#0A1628',                   /* active / brand — maximum contrast */
  textMuted:      'rgba(10, 22, 40, 0.70)',   /* section labels — darker, more readable */
  textMid:        'rgba(10, 22, 40, 0.65)',   /* mid-weight — roles, meta */
  textPlaceholder:'rgba(10, 22, 40, 0.50)',   /* search placeholder */

  /* Avatar */
  avatarBg:       'rgba(0, 0, 0, 0.20)',

  /* Badge */
  badgeBg:        'rgba(0, 0, 0, 0.18)',

  /* Search */
  searchBg:       'rgba(255, 255, 255, 0.40)',
  searchBorder:   'rgba(255, 255, 255, 0.60)',

  /* Role badges */
  role: {
    admin:   { bg: 'rgba(0, 0, 0, 0.20)', text: '#0A1628' },
    factory: { bg: 'rgba(0, 0, 0, 0.20)', text: '#0A1628' },
    jakarta: { bg: 'rgba(0, 0, 0, 0.20)', text: '#0A1628' },
  } as const,

  /* Geometry */
  radius:    8,
  radiusSm:  4,
  radiusLg:  12,
  w:         272,
  wc:        68,

  /**
   * File mapping:
   * - logo.jpg  → denim fabric texture (sidebar background)
   * - bg.jpg    → brand artwork (logo circle)
   */
  bgImage:   '/denim_bg.jpg',
  logoImage: '/denim_bg.jpg',
} as const;

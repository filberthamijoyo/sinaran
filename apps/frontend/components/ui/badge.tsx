'use client';

import * as React from 'react';

/* ─────────────────────────────────────────────────────────
   Design tokens (from globals.css)
   ───────────────────────────────────────────────────────── */
const T = {
  denim100:      'var(--denim-100)',
  textSecondary: 'var(--text-secondary)',
  textMuted:     'var(--text-muted)',
  textPrimary:   'var(--text-primary)',
  primary:       'var(--primary)',
  successBg:     'var(--success-bg)',
  successText:   'var(--success-text)',
  warningBg:     'var(--warning-bg)',
  warningText:   'var(--warning-text)',
  dangerBg:      'var(--danger-bg)',
  dangerText:    'var(--danger-text)',
  infoBg:        'var(--info-bg)',
  infoText:      'var(--info-text)',
  purpleBg:      'var(--purple-bg)',
  purpleText:    'var(--purple-text)',
  orangeBg:      'var(--orange-bg)',
  orangeText:    'var(--orange-text)',
  badgeRadius:   'var(--badge-radius)',
} as const;

/* ─────────────────────────────────────────────────────────
   Variants
   ───────────────────────────────────────────────────────── */
type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'orange'
  | 'primary';

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { backgroundColor: T.denim100,      color: T.textSecondary },
  success: { backgroundColor: T.successBg,    color: T.successText   },
  warning: { backgroundColor: T.warningBg,    color: T.warningText   },
  danger:  { backgroundColor: T.dangerBg,     color: T.dangerText    },
  info:    { backgroundColor: T.infoBg,       color: T.infoText      },
  purple:  { backgroundColor: T.purpleBg,     color: T.purpleText    },
  orange:  { backgroundColor: T.orangeBg,     color: T.orangeText    },
  primary: { backgroundColor: T.denim100,     color: T.primary       },
};

/* ─────────────────────────────────────────────────────────
   Badge
   ───────────────────────────────────────────────────────── */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({
  variant = 'default',
  style,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      style={{
        borderRadius:   T.badgeRadius,
        padding:        '2px 8px',
        fontSize:      11,
        fontWeight:    500,
        display:       'inline-flex',
        alignItems:    'center',
        gap:           4,
        whiteSpace:    'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeVariant, BadgeProps };

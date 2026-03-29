'use client';

import * as React from 'react';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark' | 'outline';
type ButtonSize    = 'sm' | 'default' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  leftIcon?: React.ReactNode;
  rightIcon?:React.ReactNode;
}

/* ─────────────────────────────────────────────────────────
   Design tokens (from globals.css)
   ───────────────────────────────────────────────────────── */
const T = {
  primary:        'var(--primary)',
  primaryHover:   'var(--primary-hover)',
  contentBg:     'var(--content-bg)',
  textPrimary:   'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textOnDark:    '#EEF3F7',
  border:        'var(--border)',
  denim950:      'var(--denim-950)',
  denim900:      'var(--denim-900)',
  denim100:      'var(--denim-100)',
  dangerBg:      'var(--danger-bg)',
  dangerText:    'var(--danger-text)',
  dangerBorder:  'var(--danger-border)',
  buttonRadius:  'var(--button-radius)',
} as const;

/* ─────────────────────────────────────────────────────────
   Variant style maps
   ───────────────────────────────────────────────────────── */
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: T.primary,
    color:            T.textOnDark,
    border:           'none',
  },
  secondary: {
    backgroundColor: T.contentBg,
    color:            T.textPrimary,
    border:           `1px solid ${T.border}`,
  },
  danger: {
    backgroundColor: T.dangerBg,
    color:            T.dangerText,
    border:           `1px solid ${T.dangerBorder}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color:            T.textSecondary,
    border:           'none',
  },
  dark: {
    backgroundColor: T.denim950,
    color:            T.textOnDark,
    border:           'none',
  },
  outline: {
    backgroundColor: T.contentBg,
    color:            T.textPrimary,
    border:           `1px solid ${T.border}`,
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { backgroundColor: 'var(--primary-hover)' },
  secondary: { backgroundColor: 'var(--denim-100)' },
  danger:    { backgroundColor: '#FEE2E2' },
  ghost:     { backgroundColor: 'var(--denim-100)' },
  dark:      { backgroundColor: 'var(--denim-900)' },
  outline:   { backgroundColor: 'var(--denim-100)' },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm:      { height: 32, padding: '0 12px', fontSize: 12 },
  default: { height: 36, padding: '0 16px', fontSize: 13 },
  lg:      { height: 40, padding: '0 20px', fontSize: 14 },
};

/* ─────────────────────────────────────────────────────────
   Spin keyframe — injected once
   ───────────────────────────────────────────────────────── */
const SPIN_KEYFRAMES = `
@keyframes __btn_spin__ {
  to { transform: rotate(360deg); }
}
`;

/* ─────────────────────────────────────────────────────────
   Spinner
   ───────────────────────────────────────────────────────── */
const Spinner = ({ color }: { color: string }) => (
  <span
    aria-hidden="true"
    style={{
      display:        'inline-block',
      width:          14,
      height:         14,
      borderRadius:   '50%',
      border:         '2px solid rgba(255,255,255,0.3)',
      borderTopColor: color,
      animation:      '__btn_spin__ 0.6s linear infinite',
      flexShrink:     0,
    }}
  />
);

/* ─────────────────────────────────────────────────────────
   Button
   ───────────────────────────────────────────────────────── */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'default',
      loading   = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [hovered, setHovered] = React.useState(false);

    const baseStyle: React.CSSProperties = {
      fontFamily:      'inherit',
      fontWeight:      500,
      borderRadius:    T.buttonRadius,
      cursor:          disabled || loading ? 'not-allowed' : 'pointer',
      display:         'inline-flex',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             6,
      whiteSpace:      'nowrap',
      transition:      'background-color 150ms ease, opacity 150ms ease',
      outline:         'none',
      border:          variantStyles[variant].border,
      opacity:         disabled || loading ? 0.5 : 1,
      pointerEvents:   disabled || loading ? 'none' : 'auto',
      userSelect:      'none',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
      ...style,
    };

    const textColor = variantStyles[variant].color as string;

    return (
      <>
        {/* Inject keyframes once */}
        <style>{SPIN_KEYFRAMES}</style>
        <button
          ref={ref}
          disabled={disabled || loading}
          aria-disabled={disabled || loading}
          aria-busy={loading}
          onMouseEnter={e => { setHovered(true); onMouseEnter?.(e); }}
          onMouseLeave={e => { setHovered(false); onMouseLeave?.(e); }}
          style={baseStyle}
          {...rest}
        >
          {loading && <Spinner color={textColor} />}
          {!loading && leftIcon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{leftIcon}</span>}
          {children}
          {!loading && rightIcon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{rightIcon}</span>}
        </button>
      </>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonVariant, ButtonSize, ButtonProps };

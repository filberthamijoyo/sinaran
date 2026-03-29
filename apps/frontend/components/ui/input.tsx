'use client';

import * as React from 'react';

/* ─────────────────────────────────────────────────────────
   Design tokens (from globals.css)
   ───────────────────────────────────────────────────────── */
const T = {
  pageBg:          'var(--page-bg)',
  border:         'var(--border)',
  borderFocus:    'var(--border-focus)',
  textPrimary:    'var(--text-primary)',
  textSecondary:  'var(--text-secondary)',
  textMuted:      'var(--text-muted)',
  danger:         'var(--danger)',
  dangerText:     'var(--danger-text)',
  denim100:       'var(--denim-100)',
  inputRadius:    'var(--input-radius)',
} as const;

/* ─────────────────────────────────────────────────────────
   Shared input base styles
   ───────────────────────────────────────────────────────── */
const baseInputStyle: React.CSSProperties = {
  height:        36,
  borderRadius:  T.inputRadius,
  borderWidth:   '1px',
  borderStyle:   'solid',
  borderColor:   T.border,
  background:    T.pageBg,
  padding:       '0 12px',
  fontSize:      14,
  fontFamily:    'inherit',
  color:         T.textPrimary,
  width:         '100%',
  outline:       'none',
  transition:    'border-color 150ms ease, box-shadow 150ms ease',
  boxSizing:     'border-box',
};

const baseInputFocus: React.CSSProperties = {
  borderColor: T.borderFocus,
  boxShadow:   '0 0 0 3px rgba(74, 122, 155, 0.15)',
};

const baseInputDisabled: React.CSSProperties = {
  opacity:    0.5,
  cursor:     'not-allowed',
  background: T.denim100,
};

/* ─────────────────────────────────────────────────────────
   Input
   ───────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  /** @deprecated Use <FormField label="..."><Input /></FormField> instead */
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, disabled, style, onFocus, onBlur, label: _label, ...rest }, ref) => {
    const [focused, setFocused] = React.useState(false);

    const computedStyle: React.CSSProperties = {
      ...baseInputStyle,
      ...(error
        ? { borderColor: T.danger }
        : focused
        ? baseInputFocus
        : {}),
      ...(disabled ? baseInputDisabled : {}),
      ...style,
    };

    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        style={computedStyle}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';

/* ─────────────────────────────────────────────────────────
   Textarea
   ───────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, disabled, style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = React.useState(false);

    const computedStyle: React.CSSProperties = {
      ...baseInputStyle,
      height:      'auto',
      minHeight:   80,
      padding:     '10px 12px',
      resize:      'vertical',
      ...(error
        ? { borderColor: T.danger }
        : focused
        ? baseInputFocus
        : {}),
      ...(disabled ? baseInputDisabled : {}),
      ...style,
    };

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        style={computedStyle}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

/* ─────────────────────────────────────────────────────────
   FormField
   ───────────────────────────────────────────────────────── */
interface FormFieldProps {
  label?:      React.ReactNode;
  error?:      string | boolean;
  hint?:       React.ReactNode;
  required?:   boolean;
  children:    React.ReactNode;
  style?:      React.CSSProperties;
}

function FormField({ label, error, hint, required, children, style }: FormFieldProps) {
  const hasError = Boolean(error);
  const errorId = React.useId();
  const hintId  = React.useId();

  // Inject error/border-focus styles onto the child input/textarea
  const child = React.Children.only(children) as React.ReactElement<{
    error?: boolean;
    'aria-describedby'?: string;
    style?: React.CSSProperties;
  }>;

  const describedBy = [
    hasError && error ? errorId : undefined,
    hint ? hintId : undefined,
    child.props['aria-describedby'],
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const childWithAria = React.cloneElement(child, {
    error: hasError,
    'aria-describedby': describedBy,
    style: {
      ...child.props.style,
      ...(hasError
        ? {
            borderColor: T.danger,
            boxShadow:   '0 0 0 3px rgba(220, 38, 38, 0.12)',
          }
        : {}),
    },
  });

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label style={{
          display:       'block',
          fontSize:      13,
          fontWeight:    500,
          color:         T.textSecondary,
          marginBottom:  6,
        }}>
          {label}
          {required && (
            <span style={{ color: T.danger, marginLeft: 3 }} aria-hidden="true">*</span>
          )}
        </label>
      )}
      {childWithAria}
      {hasError && error && (
        <p
          id={errorId}
          role="alert"
          style={{
            fontSize: 12,
            color:    T.dangerText,
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
      {hint && (
        <p
          id={hintId}
          style={{
            fontSize: 12,
            color:    T.textMuted,
            marginTop: 4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export { Input, Textarea, FormField };

'use client';

import { useState } from 'react';

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  autoFocus,
  autoComplete,
  error,
  icon,
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isFloated = focused || value.length > 0;
  const isPassword = type === 'password';

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Left icon */}
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              display: 'flex',
              alignItems: 'center',
              color: isFloated ? 'rgba(139,169,196,0.90)' : 'rgba(255,255,255,0.38)',
              transition: 'color 0.25s ease',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </div>
        )}

        {/* Floating label */}
        <label
          style={{
            position: 'absolute',
            left: icon ? 42 : 16,
            top: isFloated ? -8 : '50%',
            transform: `translateY(${isFloated ? 0 : '-50%'}) scale(${isFloated ? 0.78 : 1})`,
            transformOrigin: 'left center',
            fontSize: isFloated ? 11 : 14,
            fontWeight: 600,
            letterSpacing: isFloated ? '0.08em' : '0',
            textTransform: isFloated ? 'uppercase' : 'none',
            color: isFloated ? 'rgba(139,169,196,0.90)' : 'rgba(255,255,255,0.38)',
            backgroundColor: 'transparent',
            padding: isFloated ? '0 4px' : '0',
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </label>

        {/* Input */}
        <input
          type={isPassword && !showPassword ? 'password' : 'text'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: 56,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${
              error
                ? 'rgba(220,38,38,0.60)'
                : focused
                ? 'rgba(29,78,216,0.55)'
                : 'rgba(255,255,255,0.09)'
            }`,
            borderRadius: 12,
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 500,
            paddingLeft: icon ? 42 : 16,
            paddingRight: isPassword ? 48 : 16,
            outline: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
            boxShadow: focused
              ? `0 0 0 3px ${error ? 'rgba(220,38,38,0.10)' : 'rgba(29,78,216,0.10)'}, inset 0 1px 3px rgba(0,0,0,0.20)`
              : 'inset 0 1px 3px rgba(0,0,0,0.15)',
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.30)',
              padding: 4,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.60)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.30)')
            }
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            marginTop: 6,
            marginLeft: 4,
            fontSize: 12,
            color: 'rgba(252,165,165,0.90)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

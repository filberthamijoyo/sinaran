'use client'

import * as React from 'react'
import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'default' | 'outline' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  strength?: number
  stiffness?: number
  damping?: number
  onClick?: React.ComponentProps<'button'>['onClick']
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

const DEFAULTS = { strength: 6, stiffness: 400, damping: 18 }

const variantStyles: Record<string, React.CSSProperties> = {
  primary:      { background: '#1D4ED8', color: '#FFFFFF' },
  secondary:    { background: '#F7F8FA', color: '#374151', border: '1px solid #E5E7EB' },
  danger:       { background: '#FEF2F2', color: '#DC2626' },
  ghost:        { background: 'transparent', color: '#6B7280' },
  default:      { background: '#1D4ED8', color: '#FFFFFF' },
  outline:      { background: '#F7F8FA', color: '#374151', border: '1px solid #E5E7EB' },
  destructive:  { background: '#FEF2F2', color: '#DC2626' },
}

const hoverStyles: Record<string, React.CSSProperties> = {
  primary:     { background: '#1E40AF' },
  secondary:   { background: '#F3F4F6' },
  danger:      { background: '#FEE2E2' },
  ghost:       { background: '#F7F8FA' },
  default:     { background: '#1E40AF' },
  outline:     { background: '#F3F4F6' },
  destructive: { background: '#FEE2E2' },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm:     { height: 32, padding: '0 12px', fontSize: 13 },
  default:{ height: 36, padding: '0 16px', fontSize: 14 },
  lg:     { height: 40, padding: '0 20px', fontSize: 15 },
}

export function MagneticButton({
  children,
  variant = 'primary',
  size = 'default',
  className,
  strength = DEFAULTS.strength,
  stiffness = DEFAULTS.stiffness,
  damping = DEFAULTS.damping,
  onClick,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const shouldReduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = React.useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, {
    stiffness: shouldReduce ? 1000 : stiffness,
    damping:   shouldReduce ? 40   : damping,
  })
  const springY = useSpring(y, {
    stiffness: shouldReduce ? 1000 : stiffness,
    damping:   shouldReduce ? 40   : damping,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || shouldReduce) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = Math.max(-strength, Math.min(strength, e.clientX - cx))
      const dy = Math.max(-strength, Math.min(strength, e.clientY - cy))
      x.set(dx)
      y.set(dy)
    },
    [disabled, shouldReduce, strength, x, y]
  )

  const handleMouseLeave = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      x.set(0)
      y.set(0)
    },
    [disabled, x, y]
  )

  const resolvedVariant = variant === 'default' ? 'primary' : variant
  const baseStyle: React.CSSProperties = {
    height: 36,
    borderRadius: 8,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
    ...variantStyles[resolvedVariant],
    ...sizeStyles[size],
    ...(hovered && !disabled ? hoverStyles[resolvedVariant] : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}),
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex' }}
      className={className}
    >
      <motion.div
        style={{ x: springX, y: springY }}
        aria-hidden="true"
      >
        <button
          type={type}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={onClick}
          style={baseStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {children}
        </button>
      </motion.div>
    </div>
  )
}

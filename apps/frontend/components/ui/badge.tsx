import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 gap-1",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
        ghost: "",
        link: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  const variantStyle: React.CSSProperties = (() => {
    switch (variant) {
      case "default":
        return { background: '#E0E5EC', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#6C63FF' }
      case "secondary":
        return { background: '#E0E5EC', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#6B7280' }
      case "destructive":
        return { background: '#DC2626', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#fff' }
      case "outline":
        return { background: '#E0E5EC', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#6B7280' }
      case "ghost":
        return { background: 'transparent', color: '#6B7280' }
      case "link":
        return { background: '#E0E5EC', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#6C63FF', fontWeight: 600 }
      default:
        return { background: '#E0E5EC', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', color: '#6C63FF' }
    }
  })()

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyle, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

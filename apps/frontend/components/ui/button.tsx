import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        default: [
          "rounded-2xl font-semibold text-white",
          "bg-[#6C63FF]",
          "[box-shadow:5px_5px_10px_rgb(163_177_198_/_0.6),_-5px_-5px_10px_rgba(255,255,255,0.5)]",
          "hover:bg-[#8B84FF] hover:-translate-y-px",
          "hover:[box-shadow:8px_8px_16px_rgb(163_177_198_/_0.7),_-8px_-8px_16px_rgba(255,255,255,0.6)]",
          "active:translate-y-px",
          "active:[box-shadow:inset_4px_4px_8px_rgba(0,0,0,0.2),_inset_-4px_-4px_8px_rgba(255,255,255,0.1)]",
          "focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC]",
        ].join(' '),
        destructive: [
          "rounded-2xl font-semibold text-white bg-[#DC2626]",
          "[box-shadow:5px_5px_10px_rgb(163_177_198_/_0.6),_-5px_-5px_10px_rgba(255,255,255,0.5)]",
          "hover:-translate-y-px hover:bg-[#EF4444]",
          "active:translate-y-px active:[box-shadow:inset_4px_4px_8px_rgba(0,0,0,0.2),_inset_-4px_-4px_8px_rgba(255,255,255,0.1)]",
        ].join(' '),
        outline: [
          "rounded-2xl text-[#3D4852] bg-[#E0E5EC]",
          "[box-shadow:5px_5px_10px_rgb(163_177_198_/_0.6),_-5px_-5px_10px_rgba(255,255,255,0.5)]",
          "hover:-translate-y-px",
          "hover:[box-shadow:8px_8px_16px_rgb(163_177_198_/_0.7),_-8px_-8px_16px_rgba(255,255,255,0.6)]",
          "active:translate-y-px",
          "active:[box-shadow:inset_4px_4px_8px_rgb(163_177_198_/_0.6),_inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
        ].join(' '),
        secondary: [
          "rounded-2xl text-[#3D4852] bg-[#E0E5EC]",
          "[box-shadow:5px_5px_10px_rgb(163_177_198_/_0.6),_-5px_-5px_10px_rgba(255,255,255,0.5)]",
          "hover:-translate-y-px",
          "active:translate-y-px active:[box-shadow:inset_4px_4px_8px_rgb(163_177_198_/_0.6),_inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
        ].join(' '),
        ghost: [
          "rounded-2xl text-[#6B7280]",
          "hover:text-[#3D4852]",
          "hover:[box-shadow:5px_5px_10px_rgb(163_177_198_/_0.6),_-5px_-5px_10px_rgba(255,255,255,0.5)]",
          "active:[box-shadow:inset_3px_3px_6px_rgb(163_177_198_/_0.6),_inset_-3px_-3px_6px_rgba(255,255,255,0.5)]",
        ].join(' '),
        link: "text-[#6C63FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs:  "h-6 gap-1 rounded-xl px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm:  "h-8 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg:  "h-11 rounded-2xl px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-2xl",
        "icon-xs": "size-6 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-xl",
        "icon-lg": "size-11 rounded-2xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectItemText,
  SelectItemIndicator,
} from "@radix-ui/react-select"
import { Portal } from "@radix-ui/react-portal"
import { cn } from "@/lib/utils"

export type SelectOption = {
  value: string | number;
  label: string;
}

function SelectWithOptions({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className,
  style,
}: {
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium",
          "bg-white text-[#0F1117]",
          "border border-[#E5E7EB]",
          "rounded-lg",
          "outline-none cursor-pointer",
          "transition-all duration-200",
          "[transition-timing-function:cubic-bezier(0.2,0,0,1)]",
          "hover:border-[#1D4ED8] hover:ring-[3px] hover:ring-[#1D4ED8]/10",
          "focus-visible:border-[#1D4ED8] focus-visible:ring-[3px] focus-visible:ring-[#1D4ED8]/12",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        style={style}
      >
        <SelectValue placeholder={placeholder} />
        <ChevronDownIcon className="size-4" style={{ color: "#71787E" }} />
      </SelectTrigger>
      <Portal>
        <SelectContent
          position="popper"
          sideOffset={4}
          style={{
            background: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              className="relative flex w-full cursor-pointer items-center rounded-lg py-2.5 pr-8 pl-4 text-sm select-none outline-none transition-colors duration-150 bg-white text-[#0F1117] hover:bg-[#F3F4F6]"
              style={{ color: "#0F1117" }}
            >
              <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                  <CheckIcon className="size-4" style={{ color: "#1D4ED8" }} />
                </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Portal>
    </Select>
  )
}

// Thin wrapper — used as <Select> directly with children (no options prop)
function SelectWrapper({
  options,
  placeholder: _placeholder,
  ...props
}: React.ComponentProps<typeof Select> & {
  options?: SelectOption[];
  placeholder?: string;
}) {
  if (options) {
    return <SelectWithOptions options={options} placeholder={_placeholder} {...props} />
  }
  return <Select data-slot="select" {...props} />
}

// Re-exported as Select for backward compatibility
export { SelectWrapper as Select }

export {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

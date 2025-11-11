"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border shadow-subtle transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
          checked
            ? "bg-[#0E5E4B] border-[#0E5E4B] shadow-sm"
            : "bg-[#E7DFD3] border-primary/30 shadow-[inset_0_1px_2px_rgba(0,27,43,0.05)]",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white border ring-0 transition-all duration-200 ease-in-out shadow-sm",
            checked 
              ? "translate-x-5 border-[#0E5E4B]/20" 
              : "translate-x-0.5 border-primary/20"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }


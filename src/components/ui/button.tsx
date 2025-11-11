import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full min-h-[48px] md:min-h-[44px] h-auto py-3 md:py-2.5 px-5 md:px-6 font-sans text-sm font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        // Primary
        default: "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/60",
        // Accent CTA
        accent: "bg-accent text-white hover:bg-accent/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // Light button for dark backgrounds
        light: "bg-white text-primary hover:bg-white/90",
        // Secondary subtle
        secondary: "bg-primary/5 text-primary hover:bg-primary/10",
        ghost:
          "text-primary hover:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
        // Level CTA expects class from caller to set bg-[var(--level-X)]
        level: "text-white hover:opacity-90",
      },
      size: {
        default: "",
        sm: "h-9 gap-1.5 px-3",
        lg: "h-11 px-7",
        icon: "size-10 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

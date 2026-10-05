"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-1 group/switch inline-flex h-5 w-9 items-center rounded-4xl border border-transparent transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "data-[checked]:bg-primary data-[checked]:border-primary",
        "data-[checked]:after:translate-x-0",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 shrink-0 rounded-full bg-background shadow-xs transition-transform duration-200"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
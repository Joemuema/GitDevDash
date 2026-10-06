"use client"

import { useTheme } from "next-themes"

import { FlickeringGrid } from "@/components/ui/flickering-grid"

/**
 * Animated Magic UI `FlickeringGrid`, used only on the home page.
 *
 * `FlickeringGrid` paints into a canvas, and `canvas.fillStyle` does not accept
 * `currentColor`, so the square colour is resolved from the active theme here
 * instead. Both palettes are low-contrast greys so the grid stays a texture
 * rather than a focal point.
 */
export function HomeFlicker() {
  const { resolvedTheme } = useTheme()

  return (
    <FlickeringGrid
      className="absolute inset-0 -z-10 size-full"
      squareSize={4}
      gridGap={6}
      flickerChance={0.15}
      maxOpacity={0.14}
      color={resolvedTheme === "dark" ? "#cfc9db" : "#6b6478"}
    />
  )
}
"use client"

import { usePathname } from "next/navigation"

import { routes } from "@/lib/routes"

/**
 * Fixed circuit-board backdrop painted behind every page except the home page,
 * which uses `HomeFlicker` (Magic UI `FlickeringGrid`) instead.
 *
 * Why a Client Component: the choice depends on the current route, and
 * `usePathname()` is only readable on the client. It resolves during the server
 * render too, so there is no flash of the wrong backdrop.
 *
 * `-z-10` places it above the `body` background but below in-flow content. Any
 * full-bleed wrapper painted `bg-background` would hide it — `SidebarInset`
 * therefore gets `bg-transparent` in `app-shell.tsx`.
 */
export function PageBackdrop() {
  const pathname = usePathname()

  if (pathname === routes.home) {
    return null
  }

  return (
    <div
      aria-hidden
      className="circuit-backdrop pointer-events-none fixed inset-0 -z-10"
    />
  )
}
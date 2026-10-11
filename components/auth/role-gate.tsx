"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/auth/types"
import { routes } from "@/lib/routes"

/**
 * Client-side fallback for role-gated UI. Server layouts use `requireRole`;
 * this covers buttons and links that must degrade gracefully instead of
 * navigating into a redirect loop.
 */
export function RoleGate({
  role,
  children,
  fallback,
}: {
  role: UserRole
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || user?.role !== role) {
    if (fallback !== undefined) return <>{fallback}</>
    const label = role === "hirer" ? "Hirer workspace" : "Developer workspace"
    const href =
      !isAuthenticated || user?.role == null
        ? routes.welcome
        : user.role === "hirer"
          ? routes.hire.home
          : routes.grow.home
    return (
      <Button variant="outline" size="sm" render={<Link href={href} />}>
        {isAuthenticated ? label : "Sign in to continue"}
      </Button>
    )
  }

  return <>{children}</>
}

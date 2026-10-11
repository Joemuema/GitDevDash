import "server-only"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/dal"
import type { SessionUser, UserRole } from "@/lib/auth/types"

/**
 * Server-only role guard for `/hire/*` and `/grow/*` layouts.
 *
 * Anonymous visitors go to `/welcome?next=<path>` so the picker can send them
 * back after sign-in. Signed-in users without a role go to `/welcome`.
 * Signed-in users with the wrong role go to their own home — never a 404 loop.
 */
export async function requireRole(
  role: UserRole,
  nextPath?: string
): Promise<SessionUser & { role: UserRole }> {
  const user = await getCurrentUser()

  if (!user) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
    redirect(`/welcome${params}`)
  }

  if (user.role === null) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
    redirect(`/welcome${params}`)
  }

  if (user.role !== role) {
    redirect(user.role === "hirer" ? "/hire" : "/grow")
  }

  return user as SessionUser & { role: UserRole }
}

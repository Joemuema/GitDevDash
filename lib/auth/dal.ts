import "server-only"

import { cache } from "react"

import { getSessionPayload } from "@/lib/auth/session"
import type { SessionUser } from "@/lib/auth/types"
import { findUserById, toSessionUser } from "@/lib/auth/user-store"

/**
 * Data Access Layer for auth.
 *
 * Every read of the current user funnels through here so that session
 * verification, user lookup and version checking can never be forgotten or
 * implemented inconsistently. `cache` dedupes the work across components that
 * render in the same pass.
 */

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSessionPayload()
  if (!session) return null

  const user = await findUserById(session.sub)
  if (!user) return null

  // A password change bumps the version, which signs out stale sessions.
  if (user.sessionVersion !== session.ver) return null

  return toSessionUser(user)
})

/** Full record (including the password hash) — for server-only account logic. */
export const getCurrentUserRecord = cache(
  async () => {
    const session = await getSessionPayload()
    if (!session) return null

    const user = await findUserById(session.sub)
    if (!user) return null
    if (user.sessionVersion !== session.ver) return null

    return user
  }
)

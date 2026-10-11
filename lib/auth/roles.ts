import type { SessionUser, UserRole } from "@/lib/auth/types"

/**
 * Client-safe role helpers.
 *
 * This module is imported by both Server and Client Components, so it must not
 * import `server-only` or touch `next/headers`. Server-only redirects live in
 * `lib/auth/require-role.ts`.
 */

/** Where each interface starts. `null` roles land on the picker first. */
export function roleHome(role: UserRole | null): string {
  if (role === "hirer") return "/hire"
  if (role === "developer") return "/grow"
  return "/welcome"
}

export function isRole(
  user: SessionUser | null,
  role: UserRole
): user is SessionUser & { role: UserRole } {
  return user?.role === role
}

/** True when a signed-in user still needs to pick an interface. */
export function needsRolePick(user: SessionUser | null): user is SessionUser & {
  role: null
} {
  return user !== null && user.role === null
}

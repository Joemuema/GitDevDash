/**
 * Auth domain types.
 *
 * This module is imported by both server and client code, so it must never
 * import `server-only` or anything that touches the filesystem or Node APIs.
 * The stored user (including the password hash) deliberately lives only in
 * `lib/auth/user-store.ts`.
 */

/** How the account was created. */
export type AuthProvider = "email" | "google"

/**
 * The shape of a user that is safe to hand to React components. It mirrors the
 * "Data Transfer Object" pattern from the Next.js authentication guide: never
 * pass the full user record (which contains a password hash) to the client.
 */
export type SessionUser = {
  id: string
  name: string
  email: string
  provider: AuthProvider
  image: string | null
  createdAt: string
}

/** A signed-in session, as recovered from the session cookie. */
export type SessionPayload = {
  /** User id. Mirrors the JWT `sub` claim so `jose` types stay happy. */
  sub: string
  email: string
  /**
   * Bumped whenever the password changes so every other outstanding session is
   * invalidated. Mismatches are treated as "signed out".
   */
  ver: number
}
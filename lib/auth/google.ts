import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { cookies } from "next/headers"

import type { AuthErrorCode } from "@/lib/auth/messages"
import {
  createUser,
  findUserByEmail,
  normalizeEmail,
  updateUser,
  type StoredUser,
} from "@/lib/auth/user-store"

/**
 * Google OAuth 2.0 (authorization code flow with PKCE).
 *
 * Two cookies carry the handshake between the redirect out and the callback
 * back. Both are short-lived and `httpOnly`:
 * - `state` protects against CSRF — the callback must reference a state value
 *   this browser started.
 * - `code_verifier` is the PKCE secret proving the callback came from the app
 *   that started the flow, not someone replaying an intercepted code.
 */

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"
const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
])

const STATE_COOKIE = "gdd_oauth_state"
const VERIFIER_COOKIE = "gdd_oauth_verifier"
const HANDSHAKE_MAX_AGE = 60 * 10 // 10 minutes is plenty to click through Google

/** Exported so handlers can set the cookies on a `NextResponse`. */
export const GOOGLE_STATE_COOKIE = STATE_COOKIE
export const GOOGLE_VERIFIER_COOKIE = VERIFIER_COOKIE

export const GOOGLE_HANDSHAKE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: HANDSHAKE_MAX_AGE,
}

export type GoogleCredentials = {
  clientId: string
  clientSecret: string
}

export function getGoogleCredentials(): GoogleCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

/**
 * Google requires the redirect URI to match the console configuration exactly,
 * so an explicit `GOOGLE_REDIRECT_URI` always wins. Otherwise it is derived from
 * the incoming request origin, which keeps local development working.
 */
export function resolveRedirectUri(origin: string): string {
  const configured = process.env.GOOGLE_REDIRECT_URI
  if (configured) return new URL(configured, origin).toString()
  return new URL("/api/auth/google/callback", origin).toString()
}

export type GoogleHandshake = {
  url: string
  state: string
  codeVerifier: string
}

export function createGoogleHandshake(
  credentials: GoogleCredentials,
  redirectUri: string
): GoogleHandshake {
  const state = randomBytes(32).toString("base64url")
  const codeVerifier = randomBytes(32).toString("base64url")
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")

  const url = new URL(GOOGLE_AUTH_ENDPOINT)
  url.searchParams.set("client_id", credentials.clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid email profile")
  url.searchParams.set("state", state)
  url.searchParams.set("code_challenge", codeChallenge)
  url.searchParams.set("code_challenge_method", "S256")
  url.searchParams.set("prompt", "select_account")

  return { url: url.toString(), state, codeVerifier }
}

/** Reads the `state` and PKCE verifier cookies set by the entry-point handler. */
export async function readGoogleHandshake(): Promise<{
  state: string | null
  codeVerifier: string | null
}> {
  const cookieStore = await cookies()
  return {
    state: cookieStore.get(STATE_COOKIE)?.value ?? null,
    codeVerifier: cookieStore.get(VERIFIER_COOKIE)?.value ?? null,
  }
}

export async function clearGoogleHandshake(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(STATE_COOKIE)
  cookieStore.delete(VERIFIER_COOKIE)
}

/** Length-safe comparison for the CSRF `state` value. */
export function statesMatch(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false
  let mismatch = 0
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ received.charCodeAt(index)
  }
  return mismatch === 0
}

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

export async function exchangeCodeForTokens(input: {
  code: string
  codeVerifier: string
  redirectUri: string
  credentials: GoogleCredentials
}): Promise<
  { ok: true; accessToken: string } | { ok: false; detail: string }
> {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.credentials.clientId,
    client_secret: input.credentials.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.codeVerifier,
  })

  let response: Response
  try {
    response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    })
  } catch (error) {
    return {
      ok: false,
      detail: `Network error contacting Google: ${String(error)}`,
    }
  }

  const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse

  if (!response.ok || !payload.access_token) {
    return {
      ok: false,
      detail: payload.error_description ?? payload.error ?? `HTTP ${response.status}`,
    }
  }

  return { ok: true, accessToken: payload.access_token }
}

export type GoogleProfile = {
  sub: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
}

export async function fetchGoogleProfile(
  accessToken: string
): Promise<GoogleProfile | null> {
  let payload: {
    sub?: string
    email?: string
    name?: string
    picture?: string
    email_verified?: boolean
    iss?: string
  }

  try {
    const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!response.ok) return null
    payload = await response.json()
  } catch {
    return null
  }

  if (!payload.sub || !payload.email) return null
  // `iss` is optional in the userinfo response; validate it when present.
  if (payload.iss && !GOOGLE_ISSUERS.has(payload.iss)) return null

  return {
    sub: payload.sub,
    email: normalizeEmail(payload.email),
    name: payload.name?.trim() || payload.email.split("@")[0],
    picture: payload.picture ?? null,
    emailVerified: payload.email_verified === true,
  }
}

/**
 * Signs a Google profile into a local account, creating one if needed.
 *
 * - A returning Google user is refreshed with the latest name and avatar.
 * - An existing email/password account with the same verified address is linked
 *   to the Google identity rather than duplicated, and keeps its password so
 *   both sign-in methods keep working.
 * - An unverified Google address is rejected.
 */
export async function findOrCreateGoogleUser(
  profile: GoogleProfile
): Promise<
  { ok: true; user: StoredUser } | { ok: false; reason: AuthErrorCode }
> {
  if (!profile.emailVerified) {
    return { ok: false, reason: "profile_failed" }
  }

  const existing = await findUserByEmail(profile.email)
  if (existing) {
    const updated = await updateUser(existing.id, {
      name: existing.name || profile.name,
      image: profile.picture ?? existing.image,
    })
    return { ok: true, user: updated ?? existing }
  }

  const created = await createUser({
    name: profile.name,
    email: profile.email,
    provider: "google",
    image: profile.picture,
  })

  if (!created.ok) {
    // Lost a duplicate race — read the record that won.
    const raced = await findUserByEmail(profile.email)
    if (raced) return { ok: true, user: raced }
    return { ok: false, reason: "profile_failed" }
  }

  return { ok: true, user: created.user }
}


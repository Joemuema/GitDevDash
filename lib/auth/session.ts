import "server-only"

import { createHash } from "node:crypto"

import { cache } from "react"
import { cookies } from "next/headers"
import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose"

import type { SessionPayload } from "@/lib/auth/types"

/**
 * Stateless sessions stored in a signed, encrypted JWT cookie.
 *
 * Following the Next.js authentication guide, the payload is encrypted (JWE)
 * rather than merely signed, so a user can read nothing from it and cannot
 * tamper with it. The cookie is `httpOnly`, so client JavaScript can't touch it
 * either.
 */

const SESSION_COOKIE = "gdd_session"
const ISSUER = "gitdevdash"
const AUDIENCE = "gitdevdash:session"
const MAX_AGE_REMEMBERED = 60 * 60 * 24 * 30 // 30 days
const MAX_AGE_SESSION = 60 * 60 * 12 // 12 hours

/**
 * A JWT secret is required in production. In development a fixed fallback keeps
 * sign-in working on a fresh clone without any setup; it is obviously unsafe and
 * therefore never used outside development.
 */
const DEV_FALLBACK_SECRET =
  "gitdevdash-development-only-secret-do-not-use-in-production"

/**
 * Derives a fixed-length AES-256 key from the configured secret. Hashing means
 * any secret length works while still producing the 32 bytes that `dir` +
 * `A256GCM` require.
 */
function deriveKey(secret: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(secret, "utf8").digest())
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET

  if (secret && secret.length >= 32) {
    return deriveKey(secret)
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters in production. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""
    )
  }

  if (!secret) {
    console.warn(
      "[auth] SESSION_SECRET is not set — using an insecure development-only secret. Set SESSION_SECRET in .env.local before deploying."
    )
  } else {
    console.warn(
      "[auth] SESSION_SECRET is shorter than 32 characters — using the insecure development-only secret instead."
    )
  }

  return deriveKey(DEV_FALLBACK_SECRET)
}

function isSessionPayload(payload: JWTPayload): payload is JWTPayload &
  Record<keyof SessionPayload, unknown> {
  return (
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    typeof payload.ver === "number"
  )
}

async function encrypt(payload: SessionPayload, expiresAt: Date): Promise<string> {
  return new EncryptJWT({ email: payload.email, ver: payload.ver })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .encrypt(getSecretKey())
}

/** Verifies signature, issuer, audience and expiry. Returns `null` on any failure. */
async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    })

    if (!isSessionPayload(payload)) return null

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      ver: payload.ver as number,
    }
  } catch {
    return null
  }
}

/**
 * Issues a session cookie. Must be called from a Server Action or Route Handler
 * (contexts where Next.js allows writing cookies).
 */
export async function createSession(
  userId: string,
  email: string,
  options: { remember?: boolean; sessionVersion?: number } = {}
): Promise<void> {
  const maxAge = options.remember ? MAX_AGE_REMEMBERED : MAX_AGE_SESSION
  const expiresAt = new Date(Date.now() + maxAge * 1000)

  const token = await encrypt(
    { sub: userId, email, ver: options.sessionVersion ?? 1 },
    expiresAt
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Reads and verifies the current session. Wrapped in React's `cache` so multiple
 * components in one render pass share a single verification.
 */
export const getSessionPayload = cache(
  async (): Promise<SessionPayload | null> => {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null
    return decrypt(token)
  }
)

export { SESSION_COOKIE }
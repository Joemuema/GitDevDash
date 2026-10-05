import { NextResponse, type NextRequest } from "next/server"

import {
  clearGoogleHandshake,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
  getGoogleCredentials,
  readGoogleHandshake,
  resolveRedirectUri,
  statesMatch,
} from "@/lib/auth/google"
import type { AuthErrorCode } from "@/lib/auth/messages"
import { createSession } from "@/lib/auth/session"

/**
 * Google OAuth callback: `GET /api/auth/google/callback`.
 *
 * Google sends the user back here with either `code` (success) or `error`
 * (denied / cancelled). Every failure path ends in a redirect back into the app
 * with an `auth_error` code that `components/auth/auth-notice.tsx` renders, so
 * the user always lands somewhere that explains what happened rather than on a
 * bare 500 page.
 */
export const dynamic = "force-dynamic"

function fail(origin: string, code: AuthErrorCode): NextResponse {
  return NextResponse.redirect(
    new URL(`/?auth_error=${encodeURIComponent(code)}`, origin)
  )
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.nextUrl.origin
  const searchParams = request.nextUrl.searchParams

  const credentials = getGoogleCredentials()
  if (!credentials) {
    return fail(origin, "not_configured")
  }

  // The user declined the consent screen, or Google reported an error.
  if (searchParams.get("error")) {
    await clearGoogleHandshake()
    return fail(origin, "cancelled")
  }

  const code = searchParams.get("code")
  const returnedState = searchParams.get("state")
  if (!code || !returnedState) {
    await clearGoogleHandshake()
    return fail(origin, "invalid_state")
  }

  // CSRF check: the state must match the cookie this browser was issued.
  const { state, codeVerifier } = await readGoogleHandshake()
  if (!state || !codeVerifier || !statesMatch(state, returnedState)) {
    await clearGoogleHandshake()
    return fail(origin, "invalid_state")
  }

  const tokens = await exchangeCodeForTokens({
    code,
    codeVerifier,
    redirectUri: resolveRedirectUri(origin),
    credentials,
  })
  if (!tokens.ok) {
    console.error("[auth] Google token exchange failed:", tokens.detail)
    await clearGoogleHandshake()
    return fail(origin, "exchange_failed")
  }

  const profile = await fetchGoogleProfile(tokens.accessToken)
  if (!profile) {
    await clearGoogleHandshake()
    return fail(origin, "profile_failed")
  }

  const account = await findOrCreateGoogleUser(profile)
  if (!account.ok) {
    await clearGoogleHandshake()
    return fail(origin, account.reason)
  }

  await createSession(account.user.id, account.user.email, {
    remember: true,
    sessionVersion: account.user.sessionVersion,
  })
  await clearGoogleHandshake()

  // `auth=google` lets the UI confirm the sign-in that just completed.
  return NextResponse.redirect(new URL("/?auth=google", origin))
}

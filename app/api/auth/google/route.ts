import { NextResponse, type NextRequest } from "next/server"

import {
  GOOGLE_HANDSHAKE_COOKIE_OPTIONS,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  createGoogleHandshake,
  getGoogleCredentials,
  resolveRedirectUri,
} from "@/lib/auth/google"

/**
 * Google OAuth entry point: `GET /api/auth/google`.
 *
 * A plain GET is used rather than a Server Action so the button works without
 * JavaScript and the URL stays linkable. This handler does three things:
 *
 * 1. Bails out with a helpful error if credentials aren't configured.
 * 2. Creates the CSRF `state` and PKCE `code_verifier` for this attempt.
 * 3. Stashes both in short-lived `httpOnly` cookies before redirecting to Google.
 */
export const dynamic = "force-dynamic"

export function GET(request: NextRequest): NextResponse {
  const origin = request.nextUrl.origin

  const credentials = getGoogleCredentials()
  if (!credentials) {
    return NextResponse.redirect(new URL("/?auth_error=not_configured", origin))
  }

  const redirectUri = resolveRedirectUri(origin)
  const handshake = createGoogleHandshake(credentials, redirectUri)

  const response = NextResponse.redirect(handshake.url)
  response.cookies.set(
    GOOGLE_STATE_COOKIE,
    handshake.state,
    GOOGLE_HANDSHAKE_COOKIE_OPTIONS
  )
  response.cookies.set(
    GOOGLE_VERIFIER_COOKIE,
    handshake.codeVerifier,
    GOOGLE_HANDSHAKE_COOKIE_OPTIONS
  )

  return response
}

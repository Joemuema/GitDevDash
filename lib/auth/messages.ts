/**
 * Shared auth copy for both server and client code.
 *
 * The Google OAuth callback redirects back to the app with an error code in the
 * URL, which `components/auth/auth-notice.tsx` renders. Keeping the mappings
 * here means the two sides can never drift apart.
 */
export const AUTH_ERROR_PARAM = "auth_error"
export const AUTH_STATUS_PARAM = "auth"

export type AuthErrorCode =
  | "not_configured"
  | "cancelled"
  | "invalid_state"
  | "exchange_failed"
  | "profile_failed"

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  not_configured:
    "Google sign-in isn't configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, then register the redirect URI in Google Cloud.",
  cancelled: "Google sign-in was cancelled before it finished.",
  invalid_state:
    "That sign-in attempt expired or didn't come from this browser. Please try again.",
  exchange_failed:
    "Google rejected the sign-in request. Check that your client secret and redirect URI match the Google Cloud console.",
  profile_failed:
    "Google didn't return your profile details, so the account couldn't be created.",
}

export function isAuthErrorCode(value: string): value is AuthErrorCode {
  return Object.prototype.hasOwnProperty.call(AUTH_ERROR_MESSAGES, value)
}

export function authErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code]
}
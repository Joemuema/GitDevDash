"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AUTH_ERROR_PARAM,
  AUTH_STATUS_PARAM,
  authErrorMessage,
  isAuthErrorCode,
  type AuthErrorCode,
} from "@/lib/auth/messages"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

/**
 * Surfaces the outcome of a Google OAuth round-trip.
 *
 * The callback can only communicate with the UI through a redirect, so it lands
 * back on the app with `?auth_error=<code>` or `?auth=google`. This banner reads
 * that, explains what happened, and then strips the parameters so a refresh or
 * a shared link doesn't replay a stale message.
 *
 * Uses `useSearchParams`, so render it inside a `<Suspense>` boundary.
 */
export function AuthNotice() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const errorParam = searchParams.get(AUTH_ERROR_PARAM)
  const statusParam = searchParams.get(AUTH_STATUS_PARAM)
  const [dismissed, setDismissed] = useState(false)

  const errorCode: AuthErrorCode | null =
    errorParam && isAuthErrorCode(errorParam) ? errorParam : null

  function clearParams() {
    setDismissed(true)
    // Rebuild the URL without the auth parameters, keeping any other query.
    const next = new URLSearchParams(searchParams.toString())
    next.delete(AUTH_ERROR_PARAM)
    next.delete(AUTH_STATUS_PARAM)
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  // Tidy the URL once the message has been shown.
  useEffect(() => {
    if (!errorParam && !statusParam) return
    const timeout = window.setTimeout(clearParams, 100)
    return () => window.clearTimeout(timeout)
    // `clearParams` is intentionally omitted: it would re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorParam, statusParam])

  if (dismissed) return null
  if (!errorCode && statusParam !== "google") return null

  // Match `PageContainer`'s gutters so the banner lines up with page content.
  const wrapperClassName = "mx-auto w-full max-w-5xl px-4 pt-4 md:px-6"

  if (statusParam === "google") {
    return (
      <div className={wrapperClassName}>
        <Alert>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
          <AlertTitle>Signed in with Google</AlertTitle>
          <AlertDescription>
            Your Google account is now connected to GitDevDash.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const message = errorCode
    ? authErrorMessage(errorCode)
    : "Google sign-in didn't complete. Please try again."

  return (
    <div className={wrapperClassName}>
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <AlertTitle>Google sign-in didn&apos;t finish</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>{message}</span>
          <Button size="sm" variant="outline" onClick={clearParams}>
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Crown02Icon } from "@hugeicons/core-free-icons"

/**
 * Tier badge shown next to the account name in settings and headers.
 *
 * Free accounts get a muted "Free" badge; Pro accounts get a crown. Until
 * billing lands every account renders "Free" — the badge exists now so the
 * upgrade surface is already in place when the flag flips.
 */
export function ProBadge() {
  const { user } = useAuth()
  const isPro = user?.isPro === true

  if (isPro) {
    return (
      <Badge>
        <HugeiconsIcon icon={Crown02Icon} strokeWidth={2} />
        Pro
      </Badge>
    )
  }

  return <Badge variant="secondary">Free</Badge>
}

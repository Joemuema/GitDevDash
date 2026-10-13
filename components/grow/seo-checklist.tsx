"use client"

import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import type { SeoCheck } from "@/lib/grow/seo"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"

/**
 * Step 12 — SEO / discoverability checklist: pass/fail checks with concrete
 * fixes, reusing the `TipsPanel` `Item` pattern. Passed checks collapse to a
 * count; failures render with their fix inline.
 */
export function SeoChecklist({
  checks,
  passed,
  total,
}: {
  checks: SeoCheck[]
  passed: number
  total: number
}) {
  const failed = checks.filter((c) => !c.passed)

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {passed}/{total}
        </span>{" "}
        discoverability checks passing.
        {failed.length > 0
          ? " Fix the open ones to surface in more JD searches."
          : " Your profile is fully discoverable."}
      </p>
      {failed.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} />
          Bio, location, repos, README, license, and keywords all check out.
        </p>
      ) : (
        <ItemGroup>
          {failed.map((check) => (
            <Item key={check.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>
                  {check.label}{" "}
                  <Badge variant="secondary" className="ml-1">
                    Fix
                  </Badge>
                </ItemTitle>
                <ItemDescription>{check.detail}</ItemDescription>
                <p className="text-xs text-foreground">{check.fix}</p>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toggleEndorsement } from "@/lib/hire/actions"
import { HugeiconsIcon } from "@hugeicons/react"
import { ThumbsUpIcon } from "@hugeicons/core-free-icons"

/**
 * Step 10 — merit endorsement toggle for a shortlist row.
 *
 * Hirer-only (the page is already guarded; the action re-checks). Shows the
 * public aggregate count; toggling adds/removes *this* account's endorsement.
 * Re-endorsing replaces the previous one server-side.
 */
export function EndorseButton({
  login,
  roleTag,
  langTags,
  allowedTags,
  initialEndorsed,
  initialCount,
}: {
  login: string
  roleTag: string
  langTags: string[]
  allowedTags: string[]
  initialEndorsed: boolean
  initialCount: number
}) {
  const [endorsed, setEndorsed] = useState(initialEndorsed)
  const [count, setCount] = useState(initialCount)
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => {
      const result = await toggleEndorsement(
        login,
        roleTag,
        langTags,
        allowedTags
      )
      setEndorsed(result.endorsed)
      setCount((c) => c + (result.endorsed ? 1 : -1))
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant={endorsed ? "secondary" : "ghost"}
            size="sm"
            disabled={pending}
            onClick={onToggle}
            aria-pressed={endorsed}
            aria-label={`${endorsed ? "Withdraw endorsement of" : "Endorse"} ${login}`}
          >
            <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={2} />
            <span className="tabular-nums">{count}</span>
          </Button>
        )}
      />
      <TooltipContent>
        <p>
          {endorsed
            ? "Endorsed by you — click to withdraw"
            : "Endorse for this role (counts only, never your name)"}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { batchResultToCsv } from "@/lib/match/export-csv"
import type { BatchMatchResult } from "@/lib/match/match-batch"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, Link01Icon } from "@hugeicons/core-free-icons"

export function MatchShareActions({ batch }: { batch: BatchMatchResult }) {
  const { isAuthenticated } = useAuth()
  const [copied, setCopied] = useState(false)
  const [denied, setDenied] = useState(false)

  function copyShareLink() {
    // The URL already encodes JD + logins, so it round-trips anywhere.
    const url = window.location.href
    void navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => setCopied(false))
  }

  function downloadCsv() {
    // CSV export is an account feature: anonymous visitors get a nudge to
    // sign in (their data stays local until they do).
    if (!isAuthenticated) {
      setDenied(true)
      window.setTimeout(() => setDenied(false), 4000)
      return
    }
    const csv = batchResultToCsv(batch)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `gitdevdash-shortlist-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <Button
              {...props}
              type="button"
              variant="outline"
              size="sm"
              onClick={copyShareLink}
            >
              <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
              {copied ? "Copied" : "Copy share link"}
            </Button>
          )}
        />
        <TooltipContent>
          <p>Copies this shortlist URL — JD and logins included</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <Button
              {...props}
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadCsv}
            >
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
              Export CSV
            </Button>
          )}
        />
        <TooltipContent>
          <p>
            {isAuthenticated
              ? "Download ranked results for your ATS"
              : "Sign in to export — sharing stays free for everyone"}
          </p>
        </TooltipContent>
      </Tooltip>
      {denied ? (
        <p className="text-xs text-muted-foreground" role="status">
          CSV export needs an account — sign in from the header, then retry.
          Your shortlist is unaffected.
        </p>
      ) : null}
    </div>
  )
}

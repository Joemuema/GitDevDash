"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ActiveFilterChip, AppSearchParams } from "@/lib/search/params"
import { searchUrlWithPatch } from "@/lib/search/params"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

export function ActiveFilters({
  filters,
  params,
}: {
  filters: ActiveFilterChip[]
  params: AppSearchParams
}) {
  if (filters.length === 0) return null

  const clearAllHref = searchUrlWithPatch(params, {
    language: undefined,
    location: undefined,
    reposMin: undefined,
    joinedAfter: undefined,
  })

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Active filters"
    >
      {filters.map((f) => (
        <Tooltip key={f.id}>
          <TooltipTrigger
            render={(props) => (
              <Badge
                {...props}
                variant="secondary"
                className="cursor-pointer"
                render={<Link href={searchUrlWithPatch(params, f.patch)} />}
              >
                {f.label}
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Badge>
            )}
          />
          <TooltipContent>Remove the “{f.label}” filter</TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="sm"
              render={<Link href={clearAllHref} />}
            />
          )}
        >
          Clear all
        </TooltipTrigger>
        <TooltipContent>Remove every active filter</TooltipContent>
      </Tooltip>
    </div>
  )
}
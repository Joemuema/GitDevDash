import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { AppSearchParams } from "@/lib/search/params"
import { searchUrlWithPatch } from "@/lib/search/params"

export function SearchPagination({
  page = 1,
  totalPages = 1,
  params,
}: {
  page?: number
  totalPages?: number
  params: AppSearchParams
}) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-4"
      aria-label="Search results pagination"
    >
      {canPrev ? (
        <Button
          render={
            <Link
              href={searchUrlWithPatch(params, { page: page - 1 })}
            />
          }
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm tabular-nums text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {canNext ? (
        <Button
          render={
            <Link
              href={searchUrlWithPatch(params, { page: page + 1 })}
            />
          }
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  )
}

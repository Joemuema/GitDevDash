import Link from "next/link"

import { SearchForm } from "@/components/search/search-form"
import { SearchSortSelect } from "@/components/search/search-sort-select"
import { routes } from "@/lib/routes"
import type { AppSearchParams } from "@/lib/search/params"

export function SearchContextBar({
  query,
  resultCount,
  params,
}: {
  query: string
  resultCount?: number
  params: AppSearchParams
}) {
  return (
    <div className="space-y-4 border-b border-border/60 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p>
          Results for{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          {typeof resultCount === "number" ? (
            <span className="text-muted-foreground"> · {resultCount} developers</span>
          ) : null}
        </p>
        <Link
          href={routes.home}
          className="text-muted-foreground hover:text-foreground"
        >
          Modify search
        </Link>
      </div>
      <SearchForm
        defaultQuery={query}
        defaultLocation={params.location ?? ""}
        defaultLanguage={params.language ?? ""}
        defaultReposMin={params.reposMin?.toString() ?? ""}
        defaultJoinedAfter={params.joinedAfter ?? ""}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="search-sort" className="text-muted-foreground">
          Sort
        </label>
        <SearchSortSelect params={params} />
      </div>
    </div>
  )
}

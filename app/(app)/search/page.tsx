import { ActiveFilters } from "@/components/search/active-filters"
import { SearchContextBar } from "@/components/search/search-context-bar"
import { SearchPagination } from "@/components/search/search-pagination"
import { SearchResultsList } from "@/components/search/search-results-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageContainer } from "@/components/layout/page-container"
import { GitHubApiError } from "@/lib/github/errors"
import { searchUsers } from "@/lib/github/users"
import type { GitHubUserSummary } from "@/lib/types/github"
import {
  SEARCH_PER_PAGE,
  activeFilterChips,
  parseAppSearchParams,
} from "@/lib/search/params"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { redirect } from "next/navigation"

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams
  const params = parseAppSearchParams(raw)
  const { q: query } = params

  if (!query) {
    redirect("/")
  }

  let users: GitHubUserSummary[] = []
  let totalCount = 0
  let error: string | null = null

  try {
    const result = await searchUsers(params)
    users = result.users
    totalCount = result.totalCount
  } catch (e) {
    if (e instanceof GitHubApiError) {
      error = e.message
    } else {
      error = "Something went wrong while fetching results."
    }
  }

  const filters = activeFilterChips(params)
  const totalPages = Math.max(1, Math.ceil(totalCount / SEARCH_PER_PAGE))

  return (
    <PageContainer className="space-y-6">
      <SearchContextBar
        query={query}
        resultCount={totalCount}
        params={params}
      />
      <ActiveFilters filters={filters} params={params} />
      {error ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Couldn&apos;t load results</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <SearchResultsList users={users} />
      )}
      {totalCount > 0 && !error ? (
        <SearchPagination
          page={params.page}
          totalPages={totalPages}
          params={params}
        />
      ) : null}
    </PageContainer>
  )
}

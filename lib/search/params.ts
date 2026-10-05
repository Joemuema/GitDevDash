import { searchRoute } from "@/lib/routes"

export const SEARCH_SORTS = [
  "relevance",
  "followers",
  "repositories",
  "joined",
] as const

export type SearchSort = (typeof SEARCH_SORTS)[number]

export const SORT_LABELS: Record<SearchSort, string> = {
  relevance: "Relevance",
  followers: "Followers",
  repositories: "Repositories",
  joined: "Recently joined",
} as const

export type AppSearchParams = {
  q: string
  page: number
  sort: SearchSort
  order: "asc" | "desc"
  language?: string
  location?: string
  reposMin?: number
  joinedAfter?: string
}

export type SearchUsersResultMeta = AppSearchParams & {
  totalCount: number
  perPage: number
}

export const SEARCH_PER_PAGE = 30

export function parseAppSearchParams(
  raw: Record<string, string | string[] | undefined>
): AppSearchParams {
  const pick = (key: string) => {
    const v = raw[key]
    return Array.isArray(v) ? v[0] : v
  }

  const sortRaw = pick("sort")
  const sort = SEARCH_SORTS.includes(sortRaw as SearchSort)
    ? (sortRaw as SearchSort)
    : "relevance"

  const reposRaw = pick("repos")
  const reposMin = reposRaw
    ? Math.max(0, Number.parseInt(reposRaw, 10) || 0)
    : undefined

  return {
    q: pick("q")?.trim() ?? "",
    page: Math.max(1, Number.parseInt(pick("page") ?? "1", 10) || 1),
    sort,
    order: pick("order") === "asc" ? "asc" : "desc",
    language: pick("language")?.trim() || undefined,
    location: pick("location")?.trim() || undefined,
    reposMin: reposMin && reposMin > 0 ? reposMin : undefined,
    joinedAfter: pick("joinedAfter")?.trim() || undefined,
  }
}

function quoteQualifier(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value
}

export function buildGitHubUserSearchQuery(params: AppSearchParams): string {
  const parts: string[] = []
  if (params.q) parts.push(params.q)
  if (params.location) parts.push(`location:${quoteQualifier(params.location)}`)
  if (params.language) parts.push(`language:${params.language}`)
  if (params.reposMin) parts.push(`repos:>=${params.reposMin}`)
  if (params.joinedAfter) parts.push(`created:>${params.joinedAfter}`)
  return parts.join(" ").trim() || "*"
}

export function toSearchQueryRecord(
  params: AppSearchParams
): Record<string, string> {
  const record: Record<string, string> = { q: params.q }
  if (params.page > 1) record.page = String(params.page)
  if (params.sort !== "relevance") record.sort = params.sort
  if (params.order !== "asc") record.order = params.order
  if (params.language) record.language = params.language
  if (params.location) record.location = params.location
  if (params.reposMin) record.repos = String(params.reposMin)
  if (params.joinedAfter) record.joinedAfter = params.joinedAfter
  return record
}

export function searchUrl(params: AppSearchParams): string {
  return searchRoute(params.q, toSearchQueryRecord(params))
}

export function searchUrlWithPatch(
  current: AppSearchParams,
  patch: Partial<AppSearchParams>
): string {
  const next: AppSearchParams = { ...current, ...patch }
  if (patch.q === undefined && !next.q) next.q = current.q
  if (patch.page === undefined && patch.q !== undefined) next.page = 1
  if (
    "language" in patch ||
    "location" in patch ||
    "reposMin" in patch ||
    "joinedAfter" in patch ||
    "sort" in patch
  ) {
    if (patch.page === undefined) next.page = 1
  }
  return searchUrl(next)
}

export type ActiveFilterChip = {
  id: string
  label: string
  patch: Partial<AppSearchParams>
}

export function activeFilterChips(params: AppSearchParams): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (params.language) {
    chips.push({
      id: "language",
      label: `Language: ${params.language}`,
      patch: { language: undefined },
    })
  }
  if (params.location) {
    chips.push({
      id: "location",
      label: `Location: ${params.location}`,
      patch: { location: undefined },
    })
  }
  if (params.reposMin) {
    chips.push({
      id: "repos",
      label: `Min repos: ${params.reposMin}`,
      patch: { reposMin: undefined },
    })
  }
  if (params.joinedAfter) {
    chips.push({
      id: "joinedAfter",
      label: `Joined after: ${params.joinedAfter}`,
      patch: { joinedAfter: undefined },
    })
  }
  return chips
}

export function githubSearchSort(params: AppSearchParams): {
  sort?: string
  order: "asc" | "desc"
} {
  if (params.sort === "relevance") return { order: params.order }
  return { sort: params.sort, order: params.order }
}

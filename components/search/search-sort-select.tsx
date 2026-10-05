"use client"

import { useRouter } from "next/navigation"
import {
  SEARCH_SORTS,
  SORT_LABELS,
  type AppSearchParams,
  type SearchSort,
  searchUrlWithPatch,
} from "@/lib/search/params"

export function SearchSortSelect({
  params,
}: {
  params: AppSearchParams
}) {
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sort = e.target.value as SearchSort
    router.push(searchUrlWithPatch(params, { sort }))
  }

  return (
    <select
      id="search-sort"
      name="sort"
      className="rounded-md border border-input bg-background px-2 py-1"
      value={params.sort}
      onChange={onChange}
    >
      {SEARCH_SORTS.map((sort) => (
        <option key={sort} value={sort}>
          {SORT_LABELS[sort]}
        </option>
      ))}
    </select>
  )
}
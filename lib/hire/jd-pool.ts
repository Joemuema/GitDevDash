import { githubFetch } from "@/lib/github/client"
import { GitHubApiError } from "@/lib/github/errors"
import type { JobSignal } from "@/lib/match/types"

export type JdCandidatePool = {
  logins: string[]
  /** Where each login came from, in assembly order. */
  sources: Record<string, "pasted" | "search">
  /** True when the search leg failed but explicitly chosen logins still scored. */
  searchDegraded: boolean
}

function normaliseLogins(raw: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw) {
    const login = part.trim()
    if (!login) continue
    const key = login.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(login)
  }
  return out
}

type SearchUsersResponse = {
  total_count: number
  items: Array<{ login: string }>
}

/**
 * Assembles the Step 9 candidate pool for a parsed JD, cheapest first:
 * (a) explicitly pasted logins (the intake pre-fills these from the hirer's
 * favorites, which live in browser localStorage and are invisible
 * server-side), then (b) a GitHub user search constrained by JD
 * location/language filters.
 *
 * The search leg is best-effort: a 403/network failure degrades into
 * `searchDegraded` instead of failing the batch, so explicitly chosen
 * candidates still score.
 */
export async function assembleJdPool(
  signal: JobSignal,
  pastedLogins: string[],
  maxCandidates: number,
  locationOverride?: string
): Promise<JdCandidatePool> {
  const logins: string[] = []
  const sources: Record<string, "pasted" | "search"> = {}
  const seen = new Set<string>()

  for (const login of normaliseLogins(pastedLogins)) {
    if (logins.length >= maxCandidates) break
    const key = login.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    logins.push(login)
    sources[login] = "pasted"
  }

  let searchDegraded = false
  if (logins.length < maxCandidates) {
    try {
      const parts: string[] = ["type:user"]
      const topLanguage = signal.requiredLanguages[0]
      const loc = (locationOverride ?? "").trim()
      if (loc) {
        parts.push(`location:${/\s/.test(loc) ? `"${loc}"` : loc}`)
      }
      if (topLanguage) parts.push(`language:${topLanguage}`)
      parts.push("repos:>=3")

      const sp = new URLSearchParams({
        q: parts.join(" "),
        per_page: String(Math.min(30, maxCandidates * 3)),
        page: "1",
        sort: "followers",
        order: "desc",
      })
      const data = await githubFetch<SearchUsersResponse>(
        `/search/users?${sp.toString()}`,
        { revalidate: 120 }
      )
      for (const item of data.items) {
        if (logins.length >= maxCandidates) break
        const key = item.login.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        logins.push(item.login)
        sources[item.login] = "search"
      }
    } catch (e) {
      // Rate limit or network on the discovery leg only — the explicitly
      // chosen candidates above still score.
      if (!(e instanceof GitHubApiError)) throw e
      searchDegraded = true
    }
  }

  return { logins, sources, searchDegraded }
}

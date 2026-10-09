import "server-only"

import { getUserActivity } from "@/lib/github/activity"
import { GitHubApiError } from "@/lib/github/errors"
import {
  getRepoLanguageStats,
  getUserLanguageOverview,
} from "@/lib/github/languages"
import {
  getRepository,
  listUserRepos,
  sortReposForFeatured,
} from "@/lib/github/repos"
import { getRepoTree } from "@/lib/github/tree"
import type { JobSignal } from "@/lib/match"
import { scoreDeveloper, scoreRepo, type DeveloperMatch } from "@/lib/match"

/*
 * Step 4 — batch orchestration. Scores several developers against one parsed
 * `JobSignal`, reusing the same per-developer pipeline as Step 2/3:
 * repo list + language overview + activity, then up to
 * `MATCH_REPOS_PER_CANDIDATE` deep-scanned repos.
 *
 * Budget guard: `MAX_MATCH_CANDIDATES` (5) caps a single page load at roughly
 * 5 × 27 ≈ 135 cached API calls worst-case; anything beyond is trimmed with a
 * `trimmedLogins` note. Per-developer failures degrade into `failedLogins`
 * instead of failing the batch.
 */

export const MAX_MATCH_CANDIDATES = 5
export const MATCH_REPOS_PER_CANDIDATE = 8

export type BatchCandidateResult = {
  login: string
  match: DeveloperMatch
  scannedRepos: number
}

export type BatchMatchResult = {
  results: BatchCandidateResult[]
  /** Requested logins that errored before any scoring happened. */
  failedLogins: string[]
  /** Requested logins dropped by the MAX_MATCH_CANDIDATES cap. */
  trimmedLogins: string[]
}

function normaliseLogins(raw: string | undefined): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  for (const part of raw.split(",")) {
    const login = part.trim()
    if (login && !seen.has(login.toLowerCase())) seen.add(login)
  }
  return [...seen]
}

/** Parses `?jd=` (base64url JobSignal text) + `?devs=a,b,c` from the URL. */
export function parseBatchMatchParams(
  raw: Record<string, string | string[] | undefined>
): {
  jdEncoded: string | null
  logins: string[]
} {
  const pick = (key: string) => {
    const v = raw[key]
    return Array.isArray(v) ? v[0] : v
  }
  const jd = pick("jd")
  const devs = pick("devs")
  return {
    jdEncoded: jd && jd.trim() ? jd.trim() : null,
    logins: normaliseLogins(devs),
  }
}

async function matchOneCandidate(
  login: string,
  signal: JobSignal
): Promise<BatchCandidateResult> {
  const [repos, langOverview, activity] = await Promise.all([
    listUserRepos(login, "updated"),
    getUserLanguageOverview(login),
    getUserActivity(login).catch(() => null),
  ])

  const shortlist = sortReposForFeatured(repos.filter((r) => !r.fork)).slice(
    0,
    MATCH_REPOS_PER_CANDIDATE
  )

  const repoMatches = (
    await Promise.all(
      shortlist.map(async (repo) => {
        try {
          const detail = await getRepository(login, repo.name)
          const [languages, tree] = await Promise.all([
            getRepoLanguageStats(login, repo.name).catch(() => []),
            getRepoTree(login, repo.name, detail.defaultBranch)
              .then((result) => result.files)
              .catch(() => []),
          ])
          return scoreRepo({ repo: detail, languages, tree }, signal)
        } catch (e) {
          // A 404 mid-scan means the repo vanished; anything else (403 rate
          // limit, network) just drops this repo from the match.
          if (e instanceof GitHubApiError && e.status === 404) return null
          return null
        }
      })
    )
  ).filter((m): m is NonNullable<typeof m> => m !== null)

  return {
    login,
    match: scoreDeveloper(
      {
        login,
        languages: langOverview.languages,
        sampledRepoCount: langOverview.sampledRepoCount,
        activity,
        repoMatches,
      },
      signal
    ),
    scannedRepos: repoMatches.length,
  }
}

export async function batchMatchDevelopers(
  logins: string[],
  signal: JobSignal
): Promise<BatchMatchResult> {
  const unique = [...new Set(logins.map((l) => l.trim()).filter(Boolean))]
  const kept = unique.slice(0, MAX_MATCH_CANDIDATES)
  const trimmedLogins = unique.slice(MAX_MATCH_CANDIDATES)

  const settled = await Promise.all(
    kept.map(async (login) => {
      try {
        return await matchOneCandidate(login, signal)
      } catch {
        return null
      }
    })
  )

  const results: BatchCandidateResult[] = []
  const failedLogins: string[] = []
  settled.forEach((result, i) => {
    if (result) results.push(result)
    else failedLogins.push(kept[i])
  })
  results.sort((a, b) => b.match.score - a.match.score)

  return { results, failedLogins, trimmedLogins }
}

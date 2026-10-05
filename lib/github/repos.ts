import { githubFetch } from "@/lib/github/client"
import { mapRepo, mapRepoDetail } from "@/lib/github/mappers"
import type { GitHubRepoDetail, GitHubRepoSummary } from "@/lib/types/github"

type ApiRepo = Parameters<typeof mapRepo>[0]

export type RepoSortOption = "updated" | "stars" | "name"

export async function listUserRepos(
  username: string,
  sort: RepoSortOption = "updated"
): Promise<GitHubRepoSummary[]> {
  const apiSort =
    sort === "name" ? "full_name" : sort === "stars" ? "updated" : "updated"
  const sp = new URLSearchParams({
    per_page: "100",
    sort: apiSort,
    direction: "desc",
  })

  const repos = await githubFetch<ApiRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?${sp.toString()}`,
    { revalidate: 300 }
  )

  const mapped = repos.map(mapRepo)
  if (sort === "stars") {
    return [...mapped].sort((a, b) => b.stargazersCount - a.stargazersCount)
  }
  if (sort === "name") {
    return [...mapped].sort((a, b) => a.name.localeCompare(b.name))
  }
  return mapped
}

export async function getRepository(
  username: string,
  repo: string
): Promise<GitHubRepoDetail> {
  const data = await githubFetch<ApiRepo>(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`,
    { revalidate: 3600 } // Cache repo metadata for 1 hour
  )
  return mapRepoDetail(data)
}

export async function getRepositoryLanguages(
  username: string,
  repo: string
): Promise<Record<string, number>> {
  return githubFetch<Record<string, number>>(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/languages`,
    { revalidate: 600 }
  )
}

/**
 * Orders repositories for the featured carousel: most starred first, and where
 * the star counts match (or are both zero) the most recently updated wins.
 */
export function sortReposForFeatured(
  repos: GitHubRepoSummary[]
): GitHubRepoSummary[] {
  return [...repos].sort((a, b) => {
    if (b.stargazersCount !== a.stargazersCount) {
      return b.stargazersCount - a.stargazersCount
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

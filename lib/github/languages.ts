import { mergeLanguageStats, mapLanguageStats } from "@/lib/github/mappers"
import { getRepositoryLanguages, listUserRepos } from "@/lib/github/repos"
import type { LanguageStat } from "@/lib/types/github"

const MAX_REPOS_FOR_AGGREGATE = 25

export async function getUserLanguageOverview(
  username: string
): Promise<{ languages: LanguageStat[]; sampledRepoCount: number }> {
  const repos = await listUserRepos(username, "updated")
  const sample = repos.filter((r) => !r.fork).slice(0, MAX_REPOS_FOR_AGGREGATE)

  if (sample.length === 0) {
    return { languages: [], sampledRepoCount: 0 }
  }

  const languageMaps = await Promise.all(
    sample.map(async (repo) => {
      try {
        return await getRepositoryLanguages(username, repo.name)
      } catch {
        return {}
      }
    })
  )

  return {
    languages: mergeLanguageStats(languageMaps),
    sampledRepoCount: sample.length,
  }
}

export async function getRepoLanguageStats(
  username: string,
  repo: string
): Promise<LanguageStat[]> {
  const bytes = await getRepositoryLanguages(username, repo)
  return mapLanguageStats(bytes)
}

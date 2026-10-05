import { githubFetch } from "@/lib/github/client"
import { mapUser } from "@/lib/github/mappers"
import {
  buildGitHubUserSearchQuery,
  githubSearchSort,
  SEARCH_PER_PAGE,
  type AppSearchParams,
} from "@/lib/search/params"
import type { GitHubUserSummary } from "@/lib/types/github"

type SearchUsersResponse = {
  total_count: number
  items: Array<{
    login: string
    name: string | null
    avatar_url: string
    html_url: string
    bio: string | null
    location: string | null
    company: string | null
    blog: string | null
    public_repos: number
    followers: number
    following: number
    created_at: string | null
    id: number
  }>
}

export async function getUser(username: string): Promise<GitHubUserSummary> {
  const data = await githubFetch<Parameters<typeof mapUser>[0]>(
    `/users/${encodeURIComponent(username)}`,
    { revalidate: 3600 } // Cache user profiles for 1 hour — they change rarely
  )
  return mapUser(data, username)
}

export async function getUsers(logins: string[]): Promise<GitHubUserSummary[]> {
  const unique = [...new Set(logins.filter(Boolean))]
  const results = await Promise.all(
    unique.map(async (login) => {
      try {
        return await getUser(login)
      } catch {
        return null
      }
    })
  )
  return results.filter((u): u is GitHubUserSummary => u != null)
}

export async function searchUsers(params: AppSearchParams): Promise<{
  users: GitHubUserSummary[]
  totalCount: number
}> {
  const q = buildGitHubUserSearchQuery(params)
  const { sort, order } = githubSearchSort(params)
  const sp = new URLSearchParams({
    q,
    per_page: String(SEARCH_PER_PAGE),
    page: String(params.page),
    order,
  })
  if (sort) sp.set("sort", sort)

  const data = await githubFetch<SearchUsersResponse>(
    `/search/users?${sp.toString()}`,
    { revalidate: 120 }
  )

  // The GitHub Search API (/search/users) returns only basic fields
  // (login, avatar_url, html_url). Enrich each result with full user
  // data from the /users/{username} endpoint so that stats like
  // public_repos, followers, and following are populated.
  const users = await Promise.all(
    data.items.map(async (item) => {
      try {
        return await getUser(item.login)
      } catch {
        return mapUser({
          login: item.login,
          name: item.name,
          avatar_url: item.avatar_url,
          html_url: item.html_url,
          bio: item.bio,
          location: item.location,
          company: item.company,
          blog: item.blog,
          public_repos: item.public_repos,
          followers: item.followers,
          following: item.following,
          created_at: item.created_at,
        })
      }
    })
  )

  return { users, totalCount: data.total_count }
}

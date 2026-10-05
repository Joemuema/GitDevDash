import { GitHubApiError } from "@/lib/github/errors"

const GITHUB_API = "https://api.github.com"

type GitHubFetchOptions = {
  revalidate?: number | false
}

export async function githubFetch<T>(
  path: string,
  options: GitHubFetchOptions = {}
): Promise<T> {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next:
      options.revalidate === false
        ? { revalidate: 0 }
        : { revalidate: options.revalidate ?? 300 },
  })

  const rateLimitRemaining = parseRateLimit(response.headers.get("x-ratelimit-remaining"))

  if (!response.ok) {
    let message = `GitHub API error (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new GitHubApiError(message, response.status, rateLimitRemaining)
  }

  return (await response.json()) as T
}

function parseRateLimit(value: string | null): number | null {
  if (value == null) return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

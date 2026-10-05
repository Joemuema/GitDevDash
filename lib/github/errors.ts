export class GitHubApiError extends Error {
  readonly status: number
  readonly rateLimitRemaining: number | null

  constructor(
    message: string,
    status: number,
    rateLimitRemaining: number | null = null
  ) {
    super(message)
    this.name = "GitHubApiError"
    this.status = status
    this.rateLimitRemaining = rateLimitRemaining
  }
}

export function isGitHubNotFound(error: unknown): boolean {
  return error instanceof GitHubApiError && error.status === 404
}

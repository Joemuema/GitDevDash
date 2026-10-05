import { DeveloperResultCard } from "@/components/search/developer-result-card"
import type { GitHubUserSummary } from "@/lib/types/github"

export function SearchResultsList({ users }: { users: GitHubUserSummary[] }) {
  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No developers match this query. Try a broader search or remove filters.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li key={user.login}>
          <DeveloperResultCard user={user} />
        </li>
      ))}
    </ul>
  )
}

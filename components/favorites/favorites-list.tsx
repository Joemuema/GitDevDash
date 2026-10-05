import Link from "next/link"

import { DeveloperResultCard } from "@/components/search/developer-result-card"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { GitHubUserSummary } from "@/lib/types/github"

export function FavoritesList({ users }: { users: GitHubUserSummary[] }) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">You haven&apos;t saved any developers yet.</p>
        <Button className="mt-4" render={<Link href={routes.home} />}>
          Search developers
        </Button>
      </div>
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

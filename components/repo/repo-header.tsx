import Link from "next/link"

import { GitHubExternalLink } from "@/components/shared/github-external-link"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/lib/routes"
import { formatDate } from "@/lib/utils"
import type { GitHubRepoSummary } from "@/lib/types/github"

export function RepoHeader({
  username,
  repo,
}: {
  username: string
  repo: GitHubRepoSummary
}) {
  return (
    <header className="space-y-3 border-b border-border/60 pb-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground">{repo.name}</span>
        <Badge variant="secondary">Public</Badge>
        {repo.fork ? <Badge variant="outline">Fork</Badge> : null}
        {repo.language ? <Badge variant="outline">{repo.language}</Badge> : null}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{repo.fullName}</h1>
      <p className="text-sm">
        Owner{" "}
        <Link
          href={routes.developer(username)}
          className="font-medium hover:underline"
        >
          @{username}
        </Link>
      </p>
      {repo.description ? (
        <p className="text-muted-foreground">{repo.description}</p>
      ) : null}
      <GitHubExternalLink href={repo.htmlUrl}>
        Open on GitHub
      </GitHubExternalLink>
      <dl className="flex flex-wrap gap-6 text-sm">
        <div className="flex flex-col items-center text-center">
          <dt className="text-muted-foreground">Stars</dt>
          <dd className="font-medium tabular-nums">
            {repo.stargazersCount.toLocaleString()}
          </dd>
        </div>
        <div className="flex flex-col items-center text-center">
          <dt className="text-muted-foreground">Forks</dt>
          <dd className="font-medium tabular-nums">
            {repo.forksCount.toLocaleString()}
          </dd>
        </div>
        <div className="flex flex-col items-center text-center">
          <dt className="text-muted-foreground">Updated</dt>
          <dd>{formatDate(repo.updatedAt)}</dd>
        </div>
      </dl>
    </header>
  )
}

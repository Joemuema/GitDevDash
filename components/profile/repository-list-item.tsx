import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item"
import { routes } from "@/lib/routes"
import { formatDate } from "@/lib/utils"
import type { GitHubRepoSummary } from "@/lib/types/github"

export function RepositoryListItem({
  username,
  repo,
}: {
  username: string
  repo: GitHubRepoSummary
}) {
  return (
    <Item variant="muted">
      <ItemContent>
        <ItemTitle>
          <Link
            href={routes.repository(username, repo.name)}
            className="hover:underline"
          >
            {repo.name}
          </Link>
          {repo.fork ? <Badge variant="outline">Fork</Badge> : null}
        </ItemTitle>
        {repo.description ? (
          <ItemDescription>{repo.description}</ItemDescription>
        ) : null}
        <ItemFooter>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {repo.language ? (
              <Badge variant="secondary">{repo.language}</Badge>
            ) : null}
            <span className="tabular-nums">
              ★ {repo.stargazersCount.toLocaleString()}
            </span>
            <span>Updated {formatDate(repo.updatedAt)}</span>
          </div>
        </ItemFooter>
      </ItemContent>
    </Item>
  )
}
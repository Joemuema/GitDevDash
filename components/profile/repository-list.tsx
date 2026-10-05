"use client"

import { Fragment, useMemo, useState } from "react"

import { PageSection } from "@/components/layout/page-section"
import { RepositoryListItem } from "@/components/profile/repository-list-item"
import { GitHubExternalLink } from "@/components/shared/github-external-link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import type { GitHubRepoSummary } from "@/lib/types/github"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChevronDownIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons"

type RepoSort = "updated" | "stars" | "name"

const SORT_OPTIONS: { value: RepoSort; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "stars", label: "Stars" },
  { value: "name", label: "Name" },
]

export function RepositoryList({
  username,
  repos,
  githubProfileUrl,
}: {
  username: string
  repos: GitHubRepoSummary[]
  githubProfileUrl: string
}) {
  const [sort, setSort] = useState<RepoSort>("updated")

  const sortedRepos = useMemo(() => {
    const next = [...repos]
    if (sort === "stars") {
      next.sort((a, b) => b.stargazersCount - a.stargazersCount)
    } else if (sort === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      next.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }
    return next
  }, [repos, sort])

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"

  return (
    <PageSection
      title="Repositories"
      description={`${sortedRepos.length} shown`}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} type="button" variant="outline" size="sm" />
            )}
          >
            <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-4" />
            {sortLabel}
            <HugeiconsIcon
              icon={ChevronDownIcon}
              strokeWidth={2}
              className="size-4"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => setSort(value as RepoSort)}
            >
              <DropdownMenuLabel>Sort repositories</DropdownMenuLabel>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {sortedRepos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No public repositories to show.
        </p>
      ) : (
        <ItemGroup>
          {sortedRepos.map((repo, index) => (
            <Fragment key={repo.fullName}>
              {index > 0 ? <ItemSeparator /> : null}
              <RepositoryListItem username={username} repo={repo} />
            </Fragment>
          ))}
        </ItemGroup>
      )}
      <div className="pt-2">
        <GitHubExternalLink href={`${githubProfileUrl}?tab=repositories`}>
          View all on GitHub
        </GitHubExternalLink>
      </div>
    </PageSection>
  )
}
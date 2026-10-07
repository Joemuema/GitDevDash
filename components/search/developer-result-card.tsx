"use client"

import Link from "next/link"

import { FavoriteButton } from "@/components/shared/favorite-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { routes } from "@/lib/routes"
import type { GitHubUserSummary } from "@/lib/types/github"

export function DeveloperResultCard({ user }: { user: GitHubUserSummary }) {
  const initials = user.login.slice(0, 2).toUpperCase()

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/75 p-4 sm:flex-row sm:items-start">
      <Avatar className="size-14 shrink-0">
        <AvatarImage src={user.avatarUrl} alt={""} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="leading-tight font-medium">
            {user.name ?? user.login}{" "}
            <span className="text-muted-foreground">@{user.login}</span>
          </h3>
          {user.bio ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {user.bio}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {[user.location, user.company].filter(Boolean).join(" · ")}
        </p>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="sr-only">Public repositories</dt>
            <dd>{user.publicRepos} repos</dd>
          </div>
          <div>
            <dt className="sr-only">Followers</dt>
            <dd>{user.followers} followers</dd>
          </div>
          <div>
            <dt className="sr-only">Following</dt>
            <dd>{user.following} following</dd>
          </div>
        </dl>
      </div>
      <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
        <FavoriteButton user={user} size="sm" showLabel={false} />
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                render={<Link href={routes.developer(user.login)} />}
                size="sm"
                aria-label={`View profile of ${user.login}`}
              >
                View profile
              </Button>
            )}
          />
          <TooltipContent>
            <p>View {user.login}&apos;s public profile, repos, and stats</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </article>
  )
}

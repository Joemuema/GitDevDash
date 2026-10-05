"use client"

import { FavoriteButton } from "@/components/shared/favorite-button"
import { GitHubExternalLink } from "@/components/shared/github-external-link"
import { DeveloperStatsBadges } from "@/components/profile/developer-stats-badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { GitHubUserSummary } from "@/lib/types/github"

export function ProfileHeader({ user }: { user: GitHubUserSummary }) {
  const initials = user.login.slice(0, 2).toUpperCase()

  return (
    <header className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row">
      <Avatar className="size-24 shrink-0">
        <AvatarImage src={user.avatarUrl} alt="" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name ?? user.login}
          </h1>
          <p className="text-muted-foreground">@{user.login}</p>
        </div>
        {user.bio ? <p className="max-w-2xl text-sm">{user.bio}</p> : null}
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {user.location ? <li>{user.location}</li> : null}
          {user.company ? <li>{user.company}</li> : null}
          {user.blog ? (
            <li>
              <GitHubExternalLink href={user.blog}>Website</GitHubExternalLink>
            </li>
          ) : null}
        </ul>
        <DeveloperStatsBadges user={user} />
        <div className="flex flex-wrap items-center gap-2">
          <FavoriteButton user={user} />
          <GitHubExternalLink href={user.htmlUrl}>
            View on GitHub
          </GitHubExternalLink>
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <Button {...props} type="button" variant="ghost" size="sm">
                  Share profile
                </Button>
              )}
            />
            <TooltipContent>
              <p>Copy shareable link to this profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}

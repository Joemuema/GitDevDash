import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { GitHubUserSummary } from "@/lib/types/github"

export function DeveloperStatsBadges({ user }: { user: GitHubUserSummary }) {
  const stats = [
    { label: "Repos", value: user.publicRepos, tooltip: `${user.publicRepos} public repositories` },
    { label: "Followers", value: user.followers, tooltip: `${user.followers} followers` },
    { label: "Following", value: user.following, tooltip: `${user.following} accounts followed` },
  ] as const

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat) => (
        <Tooltip key={stat.label}>
          <TooltipTrigger>
            <Badge variant="secondary">
              {stat.value.toLocaleString()} {stat.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{stat.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
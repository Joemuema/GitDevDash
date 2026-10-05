"use client"

import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Toggle, toggleVariants } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { VariantProps } from "class-variance-authority"
import { useFavoriteUser } from "@/hooks/use-favorites"
import type { GitHubUserSummary } from "@/lib/types/github"

type FavoriteButtonProps = {
  user: GitHubUserSummary
  size?: "default" | "sm"
  variant?: VariantProps<typeof toggleVariants>["variant"]
  showLabel?: boolean
}

export function FavoriteButton({
  user,
  size = "default",
  variant = "outline",
  showLabel = true,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteUser(user)
  const tooltipText = isFavorite
    ? `Remove ${user.login} from favorites`
    : `Save ${user.login} to favorites`

  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <Toggle
            {...props}
            type="button"
            variant={variant}
            size={size}
            pressed={isFavorite}
            aria-label={tooltipText}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite()
            }}
          >
            <HugeiconsIcon
              icon={StarIcon}
              strokeWidth={2}
              className={isFavorite ? "fill-yellow-400" : ""}
            />
            {showLabel && (
              <span className="ml-2">{isFavorite ? "Saved" : "Save"}</span>
            )}
          </Toggle>
        )}
      />
      <TooltipContent side="top">{tooltipText}</TooltipContent>
    </Tooltip>
  )
}

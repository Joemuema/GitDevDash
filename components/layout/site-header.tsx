"use client"

import Link from "next/link"

import { AccountMenu } from "@/components/auth/account-menu"
import { LoginPopup } from "@/components/auth/login-popup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, UserIcon } from "@hugeicons/core-free-icons"

export function SiteHeader() {
  const { count, isReady } = useFavorites()
  const { isAuthenticated } = useAuth()
  const savedCount = isReady ? count : 0

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
      <SidebarTrigger aria-label="Toggle navigation" />
      <Link
        href={routes.home}
        className="font-semibold tracking-tight md:hidden"
      >
        GitDevDash
      </Link>
      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="sm"
              render={<Link href={routes.favorites} />}
              aria-label={`Saved developers${savedCount > 0 ? `: ${savedCount}` : ""}`}
            />
          )}
        >
          <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
          {savedCount > 0 ? (
            <Badge variant="secondary" className="tabular-nums">
              {savedCount}
            </Badge>
          ) : (
            <span className="hidden sm:inline">Favorites</span>
          )}
        </TooltipTrigger>
        <TooltipContent>Saved developers</TooltipContent>
      </Tooltip>

      {isAuthenticated ? (
        <AccountMenu />
      ) : (
        <LoginPopup
          trigger={
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          }
        />
      )}
    </header>
  )
}
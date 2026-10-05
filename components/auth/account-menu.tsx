"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth/actions"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AccountSetting01Icon,
  FavouriteIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

/** Two-letter monogram used when the account has no avatar image. */
function initialsFor(name: string, email: string): string {
  const source = name.trim() || email.trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Header account menu, shown once a user is signed in.
 *
 * Signing out runs a Server Action that clears the session cookie, then calls
 * `router.refresh()` so the server layout re-renders and this menu is replaced by
 * the "Sign in" button.
 */
export function AccountMenu() {
  const { user } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!user) return null

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 pl-1"
            aria-label={`Account menu for ${user.name}`}
            disabled={isPending}
          />
        )}
      >
        <Avatar size="sm">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback>{initialsFor(user.name, user.email)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs font-normal">{user.email}</span>
            <span className="text-xs font-normal">
              {user.provider === "google" ? "Google account" : "Email account"}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={routes.settings} />}>
          <HugeiconsIcon icon={AccountSetting01Icon} strokeWidth={2} />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={routes.favorites} />}>
          <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
          Saved developers
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={handleSignOut}
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

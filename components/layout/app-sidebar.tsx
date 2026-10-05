"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useFavorites } from "@/hooks/use-favorites"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartHistogramIcon,
  FavouriteIcon,
  Home01Icon,
  Search01Icon,
  Settings01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

const browseNav = [
  {
    href: routes.home,
    label: "Home",
    icon: Home01Icon,
    match: (pathname: string) => pathname === "/",
  },
  {
    href: routes.search(),
    label: "Search",
    icon: Search01Icon,
    match: (pathname: string) =>
      pathname.startsWith("/search") || pathname.startsWith("/developers"),
  },
  {
    href: routes.favorites,
    label: "Favorites",
    icon: FavouriteIcon,
    match: (pathname: string) => pathname.startsWith(routes.favorites),
  },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { count, isReady } = useFavorites()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="GitDevDash"
              render={<Link href={routes.home} />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">GitDevDash</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Developer analytics
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {browseNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={item.match(pathname)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.href === routes.favorites && isReady && count > 0 ? (
                    <SidebarMenuBadge>{count}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith(routes.settings)}
                  tooltip="Settings"
                  render={<Link href={routes.settings} />}
                >
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="GitHub REST API docs"
                  render={
                    <a
                      href="https://docs.github.com/en/rest"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} />
                  <span>API docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
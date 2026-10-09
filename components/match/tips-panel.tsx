"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeveloperTip, DeveloperTipSeverity } from "@/lib/match/types"
import { routes } from "@/lib/routes"

const SEVERITY_META: Record<
  DeveloperTipSeverity,
  { label: string; tabValue: string; empty: string }
> = {
  "quick-win": {
    label: "Quick wins",
    tabValue: "quick-win",
    empty: "No quick wins — the basics (README, license) are covered.",
  },
  "portfolio-gap": {
    label: "Portfolio gaps",
    tabValue: "portfolio-gap",
    empty: "No portfolio gaps flagged.",
  },
  "for-this-jd": {
    label: "For this JD",
    tabValue: "for-this-jd",
    empty: "No JD-specific gaps — the profile already covers the role signals.",
  },
}

const SEVERITIES: DeveloperTipSeverity[] = [
  "quick-win",
  "portfolio-gap",
  "for-this-jd",
]

function repoName(fullName: string): string {
  const parts = fullName.split("/")
  return parts[1] ?? fullName
}

function TipItem({ login, tip }: { login: string; tip: DeveloperTip }) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>
          <Badge variant="secondary">{SEVERITY_META[tip.severity].label}</Badge>
          {tip.title}
        </ItemTitle>
        <ItemDescription>{tip.detail}</ItemDescription>
      </ItemContent>
      {tip.repoFullName ? (
        <ItemActions>
          <Button
            render={
              <Link
                href={routes.repository(login, repoName(tip.repoFullName))}
                aria-label={`View ${tip.repoFullName}`}
              />
            }
            variant="outline"
            size="sm"
          >
            View repo
          </Button>
        </ItemActions>
      ) : null}
    </Item>
  )
}

export function TipsPanel({
  login,
  tips,
}: {
  login: string
  tips: DeveloperTip[]
}) {
  if (tips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tailoring tips for @{login} — this profile already covers the basics.
      </p>
    )
  }
  const defaultTab =
    SEVERITIES.find((s) => tips.some((t) => t.severity === s)) ?? "quick-win"
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        {SEVERITIES.map((severity) => {
          const count = tips.filter((t) => t.severity === severity).length
          return (
            <TabsTrigger key={severity} value={severity}>
              {SEVERITY_META[severity].label}
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>
      {SEVERITIES.map((severity) => {
        const group = tips.filter((t) => t.severity === severity)
        return (
          <TabsContent key={severity} value={severity}>
            {group.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {SEVERITY_META[severity].empty}
              </p>
            ) : (
              <ItemGroup>
                {group.map((tip) => (
                  <TipItem key={tip.id} login={login} tip={tip} />
                ))}
              </ItemGroup>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

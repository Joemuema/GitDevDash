"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { useAuth } from "@/hooks/use-auth"
import { canUsePro, type PlanFeature } from "@/lib/billing/plans"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, LockIcon } from "@hugeicons/core-free-icons"

/**
 * Free-vs-Pro feature table. Each row shows the tier badge and the honest
 * blurb from `lib/billing/plans.ts`; Pro rows render locked for free
 * accounts. No checkout exists yet — the footer says so plainly instead of
 * linking to a dead button.
 */
export function PlanTable({
  title,
  description,
  features,
}: {
  title: string
  description: string
  features: PlanFeature[]
}) {
  const { user } = useAuth()
  const hasPro = canUsePro(user)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {features.map((feature) => {
          const locked = feature.tier === "pro" && !hasPro
          return (
            <Item key={feature.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>{feature.label}</ItemTitle>
                <ItemDescription>{feature.blurb}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge
                  variant={feature.tier === "pro" ? "default" : "secondary"}
                >
                  <HugeiconsIcon
                    icon={
                      feature.tier === "pro" && locked
                        ? LockIcon
                        : CheckmarkCircle02Icon
                    }
                    strokeWidth={2}
                  />
                  {feature.tier === "pro" ? "Pro" : "Free"}
                </Badge>
              </ItemActions>
            </Item>
          )
        })}
        <p className="text-xs text-muted-foreground">
          Billing isn&apos;t live yet — every account is on the free tier while
          Pro features are being built.
        </p>
      </CardContent>
    </Card>
  )
}

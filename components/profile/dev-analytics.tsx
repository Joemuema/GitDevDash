"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import type { DevActivity } from "@/lib/types/github"

type DevAnalyticsProps = {
  username: string
  activity: DevActivity
}

const chartConfig = {
  pushes: {
    label: "Pushes",
    color: "var(--chart-1)",
  },
  prs: {
    label: "Pull requests",
    color: "var(--chart-2)",
  },
  issues: {
    label: "Issues",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function DevAnalytics({ username, activity }: DevAnalyticsProps) {
  const { points, windowDays, commits, pushes, prs, issues } = activity
  const hasActivity = pushes + prs + issues > 0

  const summary = [
    commits != null ? `${commits.toLocaleString()} commits` : null,
    `${pushes.toLocaleString()} ${pushes === 1 ? "push" : "pushes"}`,
    `${prs.toLocaleString()} ${prs === 1 ? "pull request" : "pull requests"}`,
    `${issues.toLocaleString()} ${issues === 1 ? "issue" : "issues"}`,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity — {username}</CardTitle>
        <CardDescription>
          {hasActivity
            ? `Public activity over the last ${windowDays} ${
                windowDays === 1 ? "day" : "days"
              }: ${summary}.`
            : `No public activity recorded in the last ${windowDays} ${
                windowDays === 1 ? "day" : "days"
              }.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart data={points} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent className="w-[170px]" />}
              />
              <Bar
                dataKey="pushes"
                fill="var(--color-pushes)"
                radius={[3, 3, 0, 0]}
                maxBarSize={8}
              />
              <Bar
                dataKey="prs"
                fill="var(--color-prs)"
                radius={[3, 3, 0, 0]}
                maxBarSize={8}
              />
              <Bar
                dataKey="issues"
                fill="var(--color-issues)"
                radius={[3, 3, 0, 0]}
                maxBarSize={8}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            GitHub only exposes the most recent public events. Nothing was
            recorded for @{username} in the last {windowDays}{" "}
            {windowDays === 1 ? "day" : "days"}.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
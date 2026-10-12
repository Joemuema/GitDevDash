"use client"

import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ImpressionSummary } from "@/lib/grow/impressions"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-")
  return `${month}/${day}`
}

/**
 * Step 11 — "who viewed you": daily view counts from hirer visits, plus the
 * JD tags behind them. Counts only — the developers never see *which* hirer
 * looked. One view per hirer/dev/day, so refreshes can't inflate it.
 */
export function ViewsPanel({ summary }: { summary: ImpressionSummary }) {
  const data = summary.daily.map((bucket) => ({
    date: shortDate(bucket.date),
    views: bucket.views,
  }))

  return (
    <div className="space-y-3">
      {summary.last7Days === 0 && summary.topTags.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No hirer views yet. Share your profile and keep your repos fresh —
          views land here daily.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Viewed{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {summary.last7Days}
            </span>{" "}
            {summary.last7Days === 1 ? "time" : "times"} in the last 7 days.
          </p>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={data} margin={{ left: -16, right: 8, top: 4 }}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={8}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                radius={[3, 3, 0, 0]}
                maxBarSize={10}
              />
            </BarChart>
          </ChartContainer>
          {summary.topTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {summary.topTags.map((tag) => (
                <Badge key={tag.name} variant="secondary">
                  {tag.name} · {tag.count}
                </Badge>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

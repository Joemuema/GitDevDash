"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  count: {
    label: "JD mentions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/**
 * Step 11 — demand radar: anonymized counts of what hirers search for.
 * No hirer identity, no JD text — just "TypeScript appears in N searches".
 */
export function DemandRadar({
  languages,
  frameworks,
  totalJds,
}: {
  languages: Array<{ name: string; count: number }>
  frameworks: Array<{ name: string; count: number }>
  totalJds: number
}) {
  const data = [...languages, ...frameworks]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map((entry) => ({ name: entry.name, count: entry.count }))

  if (totalJds === 0 || data.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        No hiring searches recorded yet. As hirers run JD matches, the most
        requested languages and frameworks appear here.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <ChartContainer config={chartConfig} className="h-[260px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={4}
            maxBarSize={18}
          />
        </BarChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground">
        Across {totalJds} hiring {totalJds === 1 ? "search" : "searches"}.
      </p>
    </div>
  )
}

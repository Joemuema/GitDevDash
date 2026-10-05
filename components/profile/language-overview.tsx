"use client"

import { PageSection } from "@/components/layout/page-section"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { LanguageStat } from "@/lib/types/github"

const chartConfig = {
  percentage: {
    label: "Share (%)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function LanguageOverview({
  languages,
  repoCount,
}: {
  languages: LanguageStat[]
  repoCount: number
}) {
  const data = languages.slice(0, 8).map((lang) => ({
    name: lang.name,
    percentage: Number(lang.percentage.toFixed(1)),
  }))

  return (
    <PageSection
      title="Languages across public repositories"
      description={`Based on ${repoCount} public ${
        repoCount === 1 ? "repository" : "repositories"
      }.`}
    >
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No language data available yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
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
              dataKey="percentage"
              fill="var(--color-percentage)"
              radius={4}
              maxBarSize={18}
            />
          </BarChart>
        </ChartContainer>
      )}
    </PageSection>
  )
}
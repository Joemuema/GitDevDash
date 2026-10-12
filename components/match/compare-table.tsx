import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BatchCandidateResult } from "@/lib/match/match-batch"
import type { MatchDimensionKey } from "@/lib/match/types"
import { developerMatchRoute } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

const DIMENSION_LABELS: Record<MatchDimensionKey, string> = {
  language: "Language fit",
  stack: "Stack evidence",
  relevance: "Project relevance",
  quality: "Quality & maintenance",
  activity: "Activity",
}

const DIMENSION_ORDER = [
  "language",
  "stack",
  "relevance",
  "quality",
  "activity",
] as const

function scoreClass(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-destructive"
}

/**
 * Step 10 — side-by-side compare for the interview handoff.
 *
 * Server-rendered from the same batch results (no extra API calls):
 * candidates become columns, the five score dimensions + top repo + merit
 * endorsements become rows. Each candidate links into the single-dev toggle
 * view with the human-decision disclaimer kept on that page.
 */
export function CompareTable({
  results,
  jdEncoded,
  endorsementCounts,
}: {
  results: BatchCandidateResult[]
  jdEncoded: string
  endorsementCounts: Record<string, number>
}) {
  return (
    <div className="overflow-x-auto rounded-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-32">Signal</TableHead>
            {results.map(({ login }) => (
              <TableHead key={login} className="min-w-28 text-right">
                @{login}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Overall score</TableCell>
            {results.map(({ login, match }) => (
              <TableCell
                key={login}
                className={`text-right font-bold tabular-nums ${scoreClass(match.score)}`}
              >
                {match.score}
              </TableCell>
            ))}
          </TableRow>
          {DIMENSION_ORDER.map((key) => (
            <TableRow key={key}>
              <TableCell className="font-medium">
                {DIMENSION_LABELS[key]}
              </TableCell>
              {results.map(({ login, match }) => {
                const dim = match.dimensions.find((d) => d.key === key)
                return (
                  <TableCell
                    key={login}
                    className="text-right tabular-nums"
                    title={dim?.evidence.map((e) => e.label).join("; ") ?? ""}
                  >
                    {dim?.score ?? "—"}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Top repo</TableCell>
            {results.map(({ login, match }) => (
              <TableCell
                key={login}
                className="max-w-40 truncate text-right text-muted-foreground"
              >
                {match.topRepos[0]
                  ? match.topRepos[0].repoFullName.split("/")[1]
                  : "—"}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Endorsements</TableCell>
            {results.map(({ login }) => (
              <TableCell key={login} className="text-right tabular-nums">
                {endorsementCounts[login] ?? 0}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Details</TableCell>
            {results.map(({ login }) => (
              <TableCell key={login} className="text-right">
                <Button
                  render={
                    <Link
                      href={developerMatchRoute(login, jdEncoded)}
                      aria-label={`View single-developer match for ${login}`}
                    />
                  }
                  variant="outline"
                  size="sm"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  <span className="sr-only sm:not-sr-only sm:ml-1">
                    View match
                  </span>
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

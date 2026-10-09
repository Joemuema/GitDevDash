import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { BatchMatchResult } from "@/lib/match/match-batch"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

const DIMENSION_SHORT = {
  language: "Lang",
  stack: "Stack",
  relevance: "Relev",
  quality: "Qual",
  activity: "Activ",
} as const

function scoreClass(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-destructive"
}

export function MatchShortlist({
  batch,
  jdEncoded,
}: {
  batch: BatchMatchResult
  jdEncoded: string
}) {
  return (
    <div className="space-y-4">
      {batch.failedLogins.length > 0 ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Some candidates could not be scored</AlertTitle>
          <AlertDescription>
            {batch.failedLogins.join(", ")} — profile fetch failed (deleted
            account, private profile, or rate limit). Other results below are
            unaffected.
          </AlertDescription>
        </Alert>
      ) : null}
      {batch.trimmedLogins.length > 0 ? (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Shortlist capped</AlertTitle>
          <AlertDescription>
            Only the first candidates were scored to protect the GitHub API
            budget. Trimmed: {batch.trimmedLogins.join(", ")}.
          </AlertDescription>
        </Alert>
      ) : null}
      {batch.results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No candidates could be scored. Check the logins and try again.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead className="text-right">Score</TableHead>
              {(
                Object.keys(DIMENSION_SHORT) as (keyof typeof DIMENSION_SHORT)[]
              ).map((key) => (
                <TableHead key={key} className="text-right">
                  {DIMENSION_SHORT[key]}
                </TableHead>
              ))}
              <TableHead>Top repo</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.results.map(({ login, match }, rank) => (
              <TableRow key={login}>
                <TableCell className="font-medium">
                  <span className="mr-2 text-muted-foreground tabular-nums">
                    {rank + 1}.
                  </span>
                  @{login}
                </TableCell>
                <TableCell
                  className={`text-right font-bold tabular-nums ${scoreClass(match.score)}`}
                >
                  {match.score}
                </TableCell>
                {match.dimensions.map((dim) => (
                  <TableCell key={dim.key} className="text-right tabular-nums">
                    <Tooltip>
                      <TooltipTrigger
                        render={(props) => (
                          <span {...props} className="cursor-help">
                            {dim.score}
                          </span>
                        )}
                      />
                      <TooltipContent className="max-w-64">
                        <ul className="space-y-1">
                          {dim.evidence.map((e, i) => (
                            <li key={i} className="text-xs">
                              <span className="font-medium">{e.label}.</span>{" "}
                              {e.detail}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                ))}
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {match.topRepos[0]
                    ? match.topRepos[0].repoFullName.split("/")[1]
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={
                      <Link
                        href={routes.developerMatch(login, jdEncoded)}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-xs text-muted-foreground">
        Scores assist screening only — the final hiring decision stays with
        human interviewers after onsite interviews.
      </p>
    </div>
  )
}

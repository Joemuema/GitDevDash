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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  DeveloperMatch,
  MatchConfidence,
  MatchDimensionKey,
} from "@/lib/match/types"

const DIMENSION_LABELS: Record<MatchDimensionKey, string> = {
  language: "Language fit",
  stack: "Stack evidence",
  relevance: "Project relevance",
  quality: "Quality",
  activity: "Activity",
}

const CONFIDENCE_STYLES: Record<MatchConfidence, string> = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-destructive/40 bg-destructive/10 text-destructive",
}

function scoreTone(score: number): string {
  if (score >= 75) return "bg-emerald-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-destructive"
}

export function MatchCard({ match }: { match: DeveloperMatch }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Job match — @{match.login}</CardTitle>
            <CardDescription>
              Heuristic fit against the pasted job description.
            </CardDescription>
          </div>
          <span
            className={`text-3xl font-bold tabular-nums ${match.score >= 75 ? "text-emerald-600 dark:text-emerald-400" : match.score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`}
            aria-label={`Match score ${match.score} out of 100`}
          >
            {match.score}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={CONFIDENCE_STYLES[match.confidence]}
          >
            {match.confidence} confidence
          </Badge>
          <Badge variant="outline">{match.version}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2.5" role="list" aria-label="Score breakdown">
          {match.dimensions.map((dim) => (
            <div key={dim.key} role="listitem" className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <Tooltip>
                  <TooltipTrigger
                    render={(props) => (
                      <span
                        {...props}
                        className="cursor-help font-medium underline decoration-dotted underline-offset-4"
                      >
                        {DIMENSION_LABELS[dim.key]}
                      </span>
                    )}
                  />
                  <TooltipContent className="max-w-64">
                    <p className="font-medium">
                      {DIMENSION_LABELS[dim.key]} · {dim.score}/100 · weight{" "}
                      {dim.weight}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {dim.evidence.map((e, i) => (
                        <li key={i} className="text-xs">
                          <span className="font-medium">{e.label}.</span>{" "}
                          {e.detail}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground tabular-nums">
                  {dim.score}
                  <span className="text-xs"> /100 · ×{dim.weight}</span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={dim.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${DIMENSION_LABELS[dim.key]} score`}
              >
                <div
                  className={`h-full rounded-full ${scoreTone(dim.score)}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {match.confidenceReasons.length > 0 ? (
          <ul className="space-y-1 rounded-2xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
            {match.confidenceReasons.map((reason, i) => (
              <li key={i}>• {reason}</li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Scores assist screening only — the final hiring decision stays with
          human interviewers.
        </p>
      </CardContent>
    </Card>
  )
}

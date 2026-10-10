import type { BatchMatchResult } from "@/lib/match/match-batch"
import type { MatchDimensionKey } from "@/lib/match/types"

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Flattens a batch result into CSV rows for ATS handoff. Pure — no DOM, so
 * the download wiring stays in the component.
 */
export function batchResultToCsv(batch: BatchMatchResult): string {
  const header = [
    "rank",
    "login",
    "score",
    "language",
    "stack",
    "relevance",
    "quality",
    "activity",
    "top_repo",
    "confidence",
  ]
  const dimScore = (
    match: BatchMatchResult["results"][number]["match"],
    key: MatchDimensionKey
  ) => match.dimensions.find((d) => d.key === key)?.score ?? ""
  const lines = batch.results.map(({ login, match }, rank) =>
    [
      rank + 1,
      login,
      match.score,
      dimScore(match, "language"),
      dimScore(match, "stack"),
      dimScore(match, "relevance"),
      dimScore(match, "quality"),
      dimScore(match, "activity"),
      match.topRepos[0]?.repoFullName ?? "",
      match.confidence,
    ]
      .map(csvCell)
      .join(",")
  )
  return [header.join(","), ...lines].join("\n")
}

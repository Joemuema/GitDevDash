import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PeerCohort, PeerStat } from "@/lib/grow/peers"

/**
 * Step 12 — peer compare ("you vs median"): public signals only (followers,
 * public repos, top-repo stars, recent pushes). Cohort members are public
 * profiles, but the emphasis is the median row — never anyone's private data.
 */
export function PeerCompare({
  own,
  cohort,
  topLanguage,
}: {
  own: PeerStat
  cohort: PeerCohort
  topLanguage: string | null
}) {
  if (cohort.thin) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Not enough similar public profiles to compare against
        {topLanguage ? ` for ${topLanguage}` : ""} yet — the cohort needs at
        least 3 peers in your follower band.
      </p>
    )
  }

  const rows: Array<{
    label: string
    you: number
    median: number
  }> = [
    {
      label: "Followers",
      you: own.followers,
      median: cohort.medians.followers,
    },
    {
      label: "Public repos",
      you: own.publicRepos,
      median: cohort.medians.publicRepos,
    },
    {
      label: "Top repo stars",
      you: own.topRepoStars,
      median: cohort.medians.topRepoStars,
    },
    {
      label: "Recent pushes",
      you: own.pushes,
      median: cohort.medians.pushes,
    },
  ]

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal</TableHead>
            <TableHead className="text-right">You</TableHead>
            <TableHead className="text-right">Peer median</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell
                className={`text-right tabular-nums ${row.you >= row.median ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
              >
                {row.you.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {row.median.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        Cohort: {cohort.members.length} public{" "}
        {topLanguage ? `${topLanguage} ` : ""}developers near your follower
        count ({cohort.members.map((m) => `@${m.login}`).join(", ")}).
      </p>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"

/**
 * Step 11 — "your coverage vs demand": the developer's own language share
 * (when their GitHub login is linked via `?gh=`) set against the anonymized
 * demand counts. Missing demand skills surface as gaps, not scores.
 */
export function CoverageGaps({
  ownLanguages,
  demandLanguages,
  demandFrameworks,
  githubLogin,
}: {
  ownLanguages: Array<{ name: string; percentage: number }>
  demandLanguages: Array<{ name: string; count: number }>
  demandFrameworks: Array<{ name: string; count: number }>
  githubLogin: string | null
}) {
  if (!githubLogin) {
    return (
      <p className="text-sm text-muted-foreground">
        Link your GitHub profile with{" "}
        <code className="rounded bg-muted px-1 font-mono text-xs">
          /grow?gh=your-login
        </code>{" "}
        to compare your language mix against what hirers search for.
      </p>
    )
  }

  if (demandLanguages.length === 0 && demandFrameworks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Demand data appears once hirers run JD matches. Your language mix is
        ready below for when it lands.
      </p>
    )
  }

  const ownSet = new Set(ownLanguages.map((l) => l.name.toLowerCase()))
  const gaps = [
    ...demandLanguages.map((d) => ({ ...d, kind: "language" as const })),
    ...demandFrameworks.map((d) => ({ ...d, kind: "framework" as const })),
  ]
    .filter((d) => !ownSet.has(d.name.toLowerCase()))
    .slice(0, 6)

  const covered = [...demandLanguages, ...demandFrameworks].filter((d) =>
    ownSet.has(d.name.toLowerCase())
  ).length

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        @{githubLogin} covers {covered} of the{" "}
        {demandLanguages.length + demandFrameworks.length} most-requested
        skills.
      </p>
      {gaps.length === 0 ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Full coverage of current demand — your mix matches what hirers search
          for.
        </p>
      ) : (
        <ItemGroup>
          {gaps.map((gap) => (
            <Item key={`${gap.kind}:${gap.name}`} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>
                  Missing: {gap.name}{" "}
                  <Badge variant="secondary" className="ml-1">
                    {gap.kind}
                  </Badge>
                </ItemTitle>
                <ItemDescription>
                  Requested in {gap.count}{" "}
                  {gap.count === 1 ? "search" : "searches"} — a project using it
                  would close this gap.
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

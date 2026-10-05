import { Badge } from "@/components/ui/badge"

export function RepoQuickFacts({
  facts,
}: {
  facts: { label: string; value: string }[]
}) {
  if (facts.length === 0) return null

  return (
    <section aria-labelledby="repo-quick-facts" className="space-y-3">
      <h2 id="repo-quick-facts" className="text-lg font-medium">
        Quick facts
      </h2>
      <div className="flex flex-wrap gap-2">
        {facts.map((fact) => (
          <Badge
            key={fact.label}
            variant="outline"
            className="h-auto gap-2 rounded-2xl px-3 py-1.5"
          >
            <span className="font-normal text-muted-foreground">
              {fact.label}
            </span>
            <span className="font-medium">{fact.value}</span>
          </Badge>
        ))}
      </div>
    </section>
  )
}
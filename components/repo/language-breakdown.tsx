import { PageSection } from "@/components/layout/page-section"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LanguageStat } from "@/lib/types/github"

export function LanguageBreakdown({ languages }: { languages: LanguageStat[] }) {
  return (
    <PageSection title="Language breakdown" description="From the GitHub languages API.">
      {languages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No languages reported for this repository.
        </p>
      ) : (
        <Table>
          <TableCaption>
            Share of code by language, measured in bytes.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Share</TableHead>
              <TableHead className="w-1/2">Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.map((lang) => (
              <TableRow key={lang.name}>
                <TableCell className="font-medium">{lang.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {lang.percentage.toFixed(1)}%
                </TableCell>
                <TableCell>
                  <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, lang.percentage)}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageSection>
  )
}
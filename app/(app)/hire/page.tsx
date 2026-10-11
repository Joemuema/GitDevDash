import Link from "next/link"

import { PageContainer } from "@/components/layout/page-container"
import { PageSection } from "@/components/layout/page-section"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require-role"

/**
 * Hirer workspace home (Step 8 placeholder).
 *
 * Step 9 wires JD search + ranked results here; Step 10 adds endorsements,
 * named shortlists and compare. The batch pipeline (`batchMatchDevelopers`)
 * stays untouched until then.
 */
export default async function HirePage() {
  const user = await requireRole("hirer", "/hire")

  return (
    <PageContainer>
      <PageSection
        title={`Hire faster, ${user.name}`}
        description="Rank developers against a job description, then hand a shortlist to interviews. Final hiring decisions always stay with humans."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Rank against a JD</CardTitle>
              <CardDescription>
                Paste a job description and score a batch of developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/match" />}>Open matching</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interview shortlist</CardTitle>
              <CardDescription>
                Save candidates, compare side by side, export for handoff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Named shortlists land here in Step 10.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Merit signals</CardTitle>
              <CardDescription>
                Endorsements from other hirers, anonymized and weighted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Endorsement ranking lands here in Step 10.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </PageContainer>
  )
}

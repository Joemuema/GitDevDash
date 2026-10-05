import Link from "next/link"

import { AppShell } from "@/components/layout/app-shell"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export default function NotFound() {
  return (
    <AppShell>
      <PageContainer className="space-y-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          That developer or repository doesn&apos;t exist in GitDevDash.
        </p>
        <div className="flex justify-center gap-2">
          <Button render={<Link href={routes.home} />}>Search</Button>
          <Button render={<Link href={routes.favorites} />} variant="outline">
            Favorites
          </Button>
        </div>
      </PageContainer>
    </AppShell>
  )
}

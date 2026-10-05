import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <PageContainer className="space-y-6">
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </PageContainer>
  )
}
import { PageContainer } from "@/components/layout/page-container"
import { HomeGuidance } from "@/components/search/home-guidance"
import { SearchForm } from "@/components/search/search-form"
import { SearchHero } from "@/components/search/search-hero"

export default function HomePage() {
  return (
    <PageContainer className="space-y-10 py-10 md:py-16">
      <SearchHero />
      <SearchForm autoFocus />
      <HomeGuidance />
    </PageContainer>
  )
}

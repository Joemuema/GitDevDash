import { PageContainer } from "@/components/layout/page-container"
import { HomeFlicker } from "@/components/search/home-flicker"
import { HomeGuidance } from "@/components/search/home-guidance"
import { SearchForm } from "@/components/search/search-form"
import { SearchHero } from "@/components/search/search-hero"

export default function HomePage() {
  return (
    <PageContainer className="space-y-10 py-10 md:py-16">
      {/*
        The home page swaps the global circuit backdrop for the animated
        `FlickeringGrid`, contained in a rounded hero panel so the animation
        frames the pitch instead of running edge-to-edge behind the copy.
      */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-card/30 px-6 py-10 md:px-10 md:py-14">
        <HomeFlicker />
        <SearchHero />
        <div className="mt-8">
          <SearchForm autoFocus />
        </div>
      </section>
      <HomeGuidance />
    </PageContainer>
  )
}

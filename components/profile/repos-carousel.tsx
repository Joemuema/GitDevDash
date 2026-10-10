import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { RepositoryListItem } from "@/components/profile/repository-list-item"
import type { GitHubRepoSummary } from "@/lib/types/github"

export function ReposCarousel({
  username,
  repos,
}: {
  username: string
  repos: GitHubRepoSummary[]
}) {
  if (repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No repositories to display.
      </p>
    )
  }

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
        slidesToScroll: 1,
        breakpoints: {
          "(min-width: 640px)": { slidesToScroll: "auto" },
        },
      }}
      className="w-full"
      aria-label="Featured repositories"
    >
      <CarouselContent className="cursor-grab select-none active:cursor-grabbing">
        {repos.map((repo) => (
          <CarouselItem
            key={repo.fullName}
            className="basis-[280px] sm:basis-[300px] md:basis-[260px]"
          >
            <Card size="sm" className="h-full bg-card/90">
              <CardContent>
                <RepositoryListItem username={username} repo={repo} />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        aria-label="Scroll repositories left"
        className="left-2 bg-background/80 backdrop-blur"
      />
      <CarouselNext
        aria-label="Scroll repositories right"
        className="right-2 bg-background/80 backdrop-blur"
      />
    </Carousel>
  )
}
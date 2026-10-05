import { DevAnalytics } from "@/components/profile/dev-analytics"
import { DeveloperBreadcrumb } from "@/components/shared/developer-breadcrumb"
import { LanguageOverview } from "@/components/profile/language-overview"
import { PageSection } from "@/components/layout/page-section"
import { ProfileHeader } from "@/components/profile/profile-header"
import { RepositoryList } from "@/components/profile/repository-list"
import { ReposCarousel } from "@/components/profile/repos-carousel"
import { PageContainer } from "@/components/layout/page-container"
import { getUserActivity } from "@/lib/github/activity"
import { GitHubApiError } from "@/lib/github/errors"
import { getUser } from "@/lib/github/users"
import { getUserLanguageOverview } from "@/lib/github/languages"
import { listUserRepos, sortReposForFeatured } from "@/lib/github/repos"
import { routes } from "@/lib/routes"
import type {
  DevActivity,
  GitHubRepoSummary,
  LanguageStat,
} from "@/lib/types/github"
import { notFound } from "next/navigation"

const EMPTY_ACTIVITY: DevActivity = {
  points: [],
  windowDays: 14,
  commits: null,
  pushes: 0,
  prs: 0,
  issues: 0,
}

type DeveloperPageProps = {
  params: Promise<{ username: string }>
}

async function fetchDeveloperData(username: string) {
  try {
    const user = await getUser(username)

    let repos: GitHubRepoSummary[] = []
    let languages: LanguageStat[] = []
    let sampledRepoCount = user.publicRepos

    try {
      const [reposResult, langResult] = await Promise.all([
        listUserRepos(username, "updated"),
        getUserLanguageOverview(username),
      ])
      repos = reposResult
      languages = langResult.languages
      sampledRepoCount = langResult.sampledRepoCount
    } catch {
      // Repositories and language data are non-critical; show profile anyway
    }

    return { user, repos, languages, sampledRepoCount }
  } catch (e) {
    if (e instanceof GitHubApiError && e.status === 404) notFound()
    throw e
  }
}

async function fetchDeveloperActivity(
  username: string
): Promise<DevActivity> {
  try {
    return await getUserActivity(username)
  } catch {
    // Public events are non-critical; the chart degrades to an empty state.
    return EMPTY_ACTIVITY
  }
}

export default async function DeveloperPage({ params }: DeveloperPageProps) {
  const { username } = await params
  const [{ user, repos, languages, sampledRepoCount }, activity] =
    await Promise.all([
      fetchDeveloperData(username),
      fetchDeveloperActivity(username),
    ])

  return (
    <PageContainer className="space-y-8">
      <DeveloperBreadcrumb
        items={[
          { label: "Results", href: routes.search(username) },
          { label: `@${username}` },
        ]}
      />
      <ProfileHeader user={user} />
      {repos.length > 0 ? (
        <PageSection
          title="Featured repositories"
          description="Swipe through the most starred projects, newest first when stars tie."
        >
          <ReposCarousel
            username={username}
            repos={sortReposForFeatured(repos).slice(0, 8)}
          />
        </PageSection>
      ) : null}
      <DevAnalytics username={username} activity={activity} />
      <LanguageOverview languages={languages} repoCount={sampledRepoCount} />
      <RepositoryList
        username={username}
        repos={repos}
        githubProfileUrl={user.htmlUrl}
      />
    </PageContainer>
  )
}

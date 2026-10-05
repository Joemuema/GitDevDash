import Link from "next/link"

import { PageContainer } from "@/components/layout/page-container"
import { PageSection } from "@/components/layout/page-section"
import { FileExplorer } from "@/components/repo/file-explorer"
import { LanguageBreakdown } from "@/components/repo/language-breakdown"
import { RepoHeader } from "@/components/repo/repo-header"
import { RepoQuickFacts } from "@/components/repo/repo-quick-facts"
import { DeveloperBreadcrumb } from "@/components/shared/developer-breadcrumb"
import { FavoriteButton } from "@/components/shared/favorite-button"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { GitHubApiError } from "@/lib/github/errors"
import { getRepoLanguageStats } from "@/lib/github/languages"
import { getRepository } from "@/lib/github/repos"
import { getRepoTree, type RepoTreeResult } from "@/lib/github/tree"
import { getUser } from "@/lib/github/users"
import { routes } from "@/lib/routes"
import { formatDate } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, File01Icon } from "@hugeicons/core-free-icons"
import type { LanguageStat } from "@/lib/types/github"
import { notFound } from "next/navigation"

type RepoPageProps = {
  params: Promise<{ username: string; repo: string }>
}

async function loadRepoOrNotFound(username: string, repoSlug: string) {
  try {
    return await Promise.all([
      getRepository(username, repoSlug),
      getUser(username),
    ])
  } catch (e) {
    if (e instanceof GitHubApiError && (e.status === 404 || e.status === 403)) {
      // 404: repo doesn't exist | 403: rate limited (retry later or set
      // GITHUB_TOKEN for 5000 req/hr instead of 60 req/hr)
      notFound()
    }
    throw e
  }
}

async function loadRepoLanguages(
  username: string,
  repoSlug: string
): Promise<LanguageStat[]> {
  try {
    return await getRepoLanguageStats(username, repoSlug)
  } catch {
    // Language data is non-critical
    return []
  }
}

async function loadRepoTree(
  username: string,
  repoSlug: string,
  branch: string
): Promise<RepoTreeResult> {
  try {
    return await getRepoTree(username, repoSlug, branch)
  } catch {
    // Empty repositories and rate limits should not break the page.
    return { files: [], truncated: false, fileCount: 0 }
  }
}

async function fetchRepoPageData(username: string, repoSlug: string) {
  const [repo, user] = await loadRepoOrNotFound(username, repoSlug)
  const [languages, tree] = await Promise.all([
    loadRepoLanguages(username, repoSlug),
    loadRepoTree(username, repoSlug, repo.defaultBranch),
  ])

  return { repo, user, languages, tree }
}

export default async function RepositoryPage({ params }: RepoPageProps) {
  const { username, repo: repoSlug } = await params
  const { repo, user, languages, tree } = await fetchRepoPageData(
    username,
    repoSlug
  )

  return (
    <PageContainer className="space-y-8">
      <DeveloperBreadcrumb
        items={[
          { label: `@${username}`, href: routes.developer(username) },
          { label: repoSlug },
        ]}
      />
      <RepoHeader username={username} repo={repo} />
      <LanguageBreakdown languages={languages} />
      <RepoQuickFacts
        facts={[
          { label: "Default branch", value: repo.defaultBranch },
          { label: "License", value: repo.license ?? "Not specified" },
          { label: "Last push", value: formatDate(repo.pushedAt) },
        ]}
      />
      <PageSection
        title="Repository files"
        description={`${tree.fileCount.toLocaleString()} tracked ${
          tree.fileCount === 1 ? "file" : "files"
        } on the ${repo.defaultBranch} branch.`}
      >
        <FileExplorer files={tree.files} truncated={tree.truncated} />
      </PageSection>
      <PageSection
        title="Get the code"
        description="Download the repository archive directly from GitHub."
      >
        <AttachmentGroup>
          <Attachment size="sm">
            <AttachmentMedia>
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Source code (zip)</AttachmentTitle>
              <AttachmentDescription>
                {repo.fullName} @ {repo.defaultBranch}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentTrigger
              render={
                <a
                  href={`${repo.htmlUrl}/archive/refs/heads/${repo.defaultBranch}.zip`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${repo.fullName} as a zip archive`}
                />
              }
            />
          </Attachment>
          <Attachment size="sm">
            <AttachmentMedia>
              <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Source code (tar.gz)</AttachmentTitle>
              <AttachmentDescription>
                {repo.fullName} @ {repo.defaultBranch}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentTrigger
              render={
                <a
                  href={`${repo.htmlUrl}/archive/refs/heads/${repo.defaultBranch}.tar.gz`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${repo.fullName} as a tarball`}
                />
              }
            />
          </Attachment>
        </AttachmentGroup>
      </PageSection>
      <div className="border-t border-border/60 pt-6">
        <ButtonGroup>
          <Button
            render={<Link href={routes.developer(username)} />}
            variant="outline"
            size="sm"
          >
            Back to profile
          </Button>
          <FavoriteButton user={user} size="sm" />
        </ButtonGroup>
      </div>
    </PageContainer>
  )
}

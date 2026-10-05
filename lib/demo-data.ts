import type { GitHubRepoSummary, GitHubUserSummary, LanguageStat } from "@/lib/types/github"

/** Placeholder data until GitHub API integration. */
export const demoUser: GitHubUserSummary = {
  login: "octocat",
  name: "The Octocat",
  avatarUrl: "https://github.com/octocat.png",
  bio: "GitHub's mascot",
  location: "San Francisco",
  company: "@github",
  blog: "https://github.blog",
  publicRepos: 8,
  followers: 10000,
  following: 9,
  htmlUrl: "https://github.com/octocat",
  createdAt: "2011-01-25T18:44:36Z",
}

export const demoUsers: GitHubUserSummary[] = [demoUser]

export const demoRepos: GitHubRepoSummary[] = [
  {
    name: "Hello-World",
    fullName: "octocat/Hello-World",
    description: "My first repository on GitHub!",
    htmlUrl: "https://github.com/octocat/Hello-World",
    stargazersCount: 1000,
    forksCount: 500,
    language: "Ruby",
    updatedAt: "2024-01-01",
    fork: false,
  },
]

export const demoLanguages: LanguageStat[] = [
  { name: "TypeScript", percentage: 62.4 },
  { name: "CSS", percentage: 22.1 },
  { name: "JavaScript", percentage: 15.5 },
]

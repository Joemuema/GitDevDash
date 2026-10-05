# `app/(app)/developers/[username]/repos/[repo]/` — Repository detail page

Route: `/developers/[username]/repos/[repo]`.

## Files

- `page.tsx` — Async server component. Fetches the repo (`getRepository`),
  its language stats and its file tree (`getRepoTree`, recursive git-trees
  API capped at 2000 entries) in parallel. Renders `RepoHeader` (badges for
  visibility/fork/language), `RepoQuickFacts`, `LanguageBreakdown` (table),
  `FileExplorer` (sortable TanStack Table with column visibility), and
  archive download `Attachment`s (zip/tarball) grouped with a repo action
  `ButtonGroup`.

## Connections

- Data comes from `lib/github/repos.ts` (metadata) and `lib/github/tree.ts`
  (file tree); dates via `formatDate` in `lib/utils.ts`.
- Sibling profile page lives at `../../` (`[username]/page.tsx`).

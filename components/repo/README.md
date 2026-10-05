# `components/repo/` — Repository detail sections

Sections composing `/developers/[username]/repos/[repo]`: header, facts,
languages and the file explorer.

## Files

- `repo-header.tsx` — Name, description, centered Stars/Forks/Updated
  figures, plus `Badge`s for visibility, fork status and primary language.
- `repo-quick-facts.tsx` — Default branch, license, open issues and topics
  as `Badge` values.
- `language-breakdown.tsx` — Per-language bytes/percent as the `Table`
  primitive with a total row.
- `file-explorer.tsx` — Sortable file tree as a TanStack Table v9
  (`tableFeatures` + `useTable`): name (folder-first, expandable), size,
  type and path columns, column-visibility `DropdownMenu`, `ScrollArea`
  viewport. Data is the nested tree built by `lib/github/tree.ts` from the
  recursive git-trees API (capped at 2000 entries, truncation notice).

## Connections

- Page: `app/(app)/developers/[username]/repos/[repo]/page.tsx`. Archive
  downloads use `Attachment` + `ButtonGroup` from `components/ui/`.

# `app/(app)/developers/[username]/repos/` — Repository route segment

Grouping segment for repository pages. It holds no `page.tsx` of its own;
the actual route lives one level down.

## Subfolders

- `[repo]/` → `/developers/[username]/repos/[repo]` — repository detail page
  (repo metadata, language breakdown, file explorer, archive downloads).

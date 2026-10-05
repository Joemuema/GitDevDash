# `app/(app)/developers/` — Developer route segment

Grouping segment for developer pages. It holds no `page.tsx` of its own;
the actual routes live one level down.

## Subfolders

- `[username]/` → `/developers/[username]` — developer profile page
  (`getUser` + repos + language overview + activity analytics + featured
  repos carousel). Contains `repos/[repo]/` for repository detail.

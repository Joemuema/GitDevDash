# `components/search/` — Search experience components

Everything from the home hero to the results list: form, context bar,
filter chips, cards, sort and pagination.

## Files

- `search-hero.tsx` / `home-guidance.tsx` — Home (`/`) hero and usage tips.
- `home-flicker.tsx` — Home-only animated `FlickeringGrid` backdrop panel
  (Magic UI). Theme-aware, since the canvas colour can't be `currentColor`.
- `search-form.tsx` — Query `InputGroup` + `Collapsible` advanced filters
  (language, location, min repos) + `Popover` + `Calendar` joined-after
  date. Submits via `searchUrl` (`lib/search/params.ts`).
- `search-context-bar.tsx` / `search-sort-select.tsx` — Result count and
  sort `DropdownMenu` (relevance, followers, repos, joined) that patches
  the URL while preserving filters.
- `active-filters.tsx` — Active params as removable `Badge` chips with
  `Tooltip`s + "Clear all".
- `search-results-list.tsx` / `developer-result-card.tsx` — Result list of
  `bg-card/75` cards: avatar, name/login, bio, location, stat badges
  (repos/followers/following), favorite `Toggle`, "View profile" link with
  `Tooltip`. The 75% opacity lets the circuit backdrop show through faintly.
- `search-pagination.tsx` — Prev/next page links preserving all params.

## Connections

- URL logic: `lib/search/params.ts`. Data: `lib/github/users.ts`
  (`searchUsers`). Cards reused by favorites and `components/shared/`.

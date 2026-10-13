/**

- Billing UI: tier badge and plan tables.
-
- Client components that branch on `useAuth().user.isPro` via `canUsePro()`:
- - `pro-badge.tsx` — "Free" badge for every account today; crown "Pro"
- badge once billing flips the flag. Shown in Settings → Account.
- - `plan-table.tsx` — free-vs-Pro feature table for a role track, with
- locked rows for free accounts and an honest "billing isn't live yet"
- footer instead of a dead checkout button.
-
- Wired into `/hire` (hirer plan) and `/grow` (developer plan) dashboards.
  */

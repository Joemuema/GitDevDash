# `components/match/` — Job-match presentation

Server-rendered data, client-rendered interactivity.

## Files

- `jd-input.tsx` — Single-developer form (`Textarea` + submit/clear) pushing
  `?jd=<base64url>` on the developer page.
- `match-intake.tsx` — Batch intake form: JD textarea + comma-separated
  candidate logins, pushing `?jd=…&devs=…` on `/match`.
- `match-shortlist.tsx` — Ranked results `Table` (score + 5 dimension cells
  with `Tooltip` evidence + top repo + "View match" link into the Step 3
  single view), `failedLogins`/`trimmedLogins` alerts, human-decision
  disclaimer.
- `match-card.tsx` — Single-developer card: big score, confidence `Badge`,
  per-dimension anatomy bars with `Tooltip` evidence, confidence reasons, and
  the human-decision disclaimer.

## How it connects

```
JdInput --?jd=--> developer page --deepScanDeveloper--> MatchCard(match)
MatchIntake --?jd=&devs=--> /match --batchMatchDevelopers--> MatchShortlist
  --View match--> developer page ?jd= (single-dev toggle)
```

Steps 3 + 4 of the hiring-match plan.

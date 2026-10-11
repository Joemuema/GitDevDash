# `components/onboarding/` — First-visit onboarding + interface picker

A one-time questionnaire shown to new visitors, gated on a localStorage
flag, plus the role picker that routes signed-in users to `/hire` or `/grow`.

## Files

- `onboarding-flow.tsx` — 3-step `Questionnaire` (repositories, insights,
  notifications) with progress, icons and a completion state. The insights
  step uses `multiple` so its choices render as checkboxes; the others are
  single-select radios.
- `onboarding-gate.tsx` — Hydration-safe gate: reads the
  `gdd:onboarding-done` flag via `useSyncExternalStore` and opens a `Sheet`
  hosting `OnboardingFlow` on first visit. Rendered closed on the server so
  SSR never touches the questionnaire context. Mounted in `AppShell`.
- `role-picker.tsx` — Single-question `Questionnaire` (`Item name="role"`,
  `Choice value="hirer"|"developer"`) wired to the `setRole` server action
  via `useActionState`. On success it refreshes the router and reports the
  chosen role to the caller.
- `role-gate.tsx` — Modal gate for signed-in users with `role === null`.
  Anonymous visitors and users with a role never see it. Mounted in
  `AppShell` next to `OnboardingGate`.

## Connections

- Primitives: `components/ui/questionnaire.tsx`, `components/ui/sheet.tsx`,
  `components/ui/button.tsx`. Restart control lives on the settings page.
- Auth: `lib/auth/actions.ts` (`setRole`), `lib/auth/roles.ts` (`roleHome`),
  `components/auth/role-gate.tsx` (client fallback for gated UI).

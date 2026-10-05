# `components/onboarding/` — First-visit onboarding flow

A one-time questionnaire shown to new visitors, gated on a localStorage
flag.

## Files

- `onboarding-flow.tsx` — 3-step `Questionnaire` (repositories, insights,
  notifications) with progress, icons and a completion state. The insights
  step uses `multiple` so its choices render as checkboxes; the others are
  single-select radios.
- `onboarding-gate.tsx` — Hydration-safe gate: reads the
  `gdd:onboarding-done` flag via `useSyncExternalStore` and opens a `Sheet`
  hosting `OnboardingFlow` on first visit. Rendered closed on the server so
  SSR never touches the questionnaire context. Mounted in `AppShell`.

## Connections

- Primitives: `components/ui/questionnaire.tsx`, `components/ui/sheet.tsx`,
  `components/ui/button.tsx`. Restart control lives on the settings page.

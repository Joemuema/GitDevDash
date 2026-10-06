# `components/layout/` — App shell, navigation and page furniture

The persistent frame around every `(app)` page: sidebar navigation, header,
footer and spacing containers.

## Files

- `app-shell.tsx` — `SidebarProvider` + `PageBackdrop` + `AppSidebar`
  + `SidebarInset` + `OnboardingGate`. The single layout primitive for
  `(app)/layout.tsx`. `SidebarInset` is given `bg-transparent` so the backdrop
  shows through (the primitive defaults to `bg-background`, which would occlude
  it — see `app/README.md` → *Backdrops*).
- `page-backdrop.tsx` — Fixed circuit-board backdrop behind every page except
  home, where the home page supplies its own `FlickeringGrid`. Client Component
  because the choice is made from `usePathname()`.
- `app-sidebar.tsx` — Sidebar nav: brand, Browse group (home/search with
  active state + favorites `SidebarMenuBadge`), Workspace group,
  `SidebarRail`, icon-collapse tooltips.
- `site-header.tsx` — Top bar: `SidebarTrigger`, search `InputGroup`,
  favorites `Badge` + `Tooltip`, `LoginPopup` ("Sign in") or `AccountMenu`
  when signed in.
- `site-footer.tsx` — Footer with product and GitHub links.
- `page-container.tsx` / `page-section.tsx` — Width-constrained wrapper and
  vertical section spacing used by all pages for consistent rhythm.

## Connections

- Sidebar primitives from `components/ui/sidebar.tsx`; auth from
  `components/auth/`; onboarding from `components/onboarding/`.

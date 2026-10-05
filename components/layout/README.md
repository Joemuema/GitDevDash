# `components/layout/` — App shell, navigation and page furniture

The persistent frame around every `(app)` page: sidebar navigation, header,
footer and spacing containers.

## Files

- `app-shell.tsx` — `SidebarProvider` + `AppSidebar` + `SidebarInset`
  + `OnboardingGate`. The single layout primitive for `(app)/layout.tsx`.
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

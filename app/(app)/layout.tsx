import { AppShell } from "@/components/layout/app-shell"

/**
 * Chrome for every app route.
 *
 * The signed-in user is resolved once in `app/layout.tsx`, which wraps the whole
 * tree in `AuthProvider`, so this layout only owns the app shell (sidebar,
 * header, footer, auth banner).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}


import { Suspense } from "react"

import { AuthNotice } from "@/components/auth/auth-notice"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { OnboardingGate } from "@/components/onboarding/onboarding-gate"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <SiteHeader />
        <main className="flex-1">
          {/*
            The OAuth callback reports its outcome through URL parameters, so the
            banner reading them needs a Suspense boundary (it uses
            `useSearchParams`).
          */}
          <Suspense fallback={null}>
            <AuthNotice />
          </Suspense>
          {children}
        </main>
        <SiteFooter />
      </SidebarInset>
      <OnboardingGate />
    </SidebarProvider>
  )
}
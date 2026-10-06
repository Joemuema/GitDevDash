import { Suspense } from "react"

import { AuthNotice } from "@/components/auth/auth-notice"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { PageBackdrop } from "@/components/layout/page-backdrop"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { OnboardingGate } from "@/components/onboarding/onboarding-gate"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/*
        Sits behind every page except the home page (`PageBackdrop` hides itself
        there). `SidebarInset` is transparent so the backdrop is not occluded —
        it defaults to `bg-background`, which would cover it completely.
      */}
      <PageBackdrop />
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-transparent">
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
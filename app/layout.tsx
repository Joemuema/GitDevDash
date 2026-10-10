import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FavoritesProvider } from "@/components/favorites/favorites-provider"
import { SavedJdsProvider } from "@/components/match/saved-jds-provider"
import { getCurrentUser } from "@/lib/auth/dal"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

/**
 * Resolves the session once, at the very top of the tree.
 *
 * React context can't cross from Server to Client Components, so the server-side
 * user is read here and handed to `AuthProvider` as a prop. Every Client
 * Component below — including the ones on `app/not-found.tsx`, which sits
 * outside the `(app)` group — reads it through `useAuth()`.
 *
 * Reading the session cookie opts the whole tree into dynamic rendering, which
 * is expected for a session-aware app: the header has to know who is signed in.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <FavoritesProvider>
              <SavedJdsProvider>
                <AuthProvider user={user}>{children}</AuthProvider>
              </SavedJdsProvider>
            </FavoritesProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

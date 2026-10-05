import Link from "next/link"

import { routes } from "@/lib/routes"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p>Data from the GitHub API. Not affiliated with GitHub.</p>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href={routes.favorites} className="hover:text-foreground">
            Favorites
          </Link>
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            API docs
          </a>
        </nav>
      </div>
    </footer>
  )
}

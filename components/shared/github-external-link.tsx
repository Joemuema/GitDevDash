import { cn } from "@/lib/utils"

export function GitHubExternalLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline", className)}
    >
      {children}
      <span className="sr-only"> (opens on GitHub)</span>
    </a>
  )
}

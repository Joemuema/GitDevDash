export function FavoritesHeader({ count }: { count: number }) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Saved developers</h1>
      <p className="text-sm text-muted-foreground">
        {count} saved · Stored on this device until you add accounts.
      </p>
    </header>
  )
}

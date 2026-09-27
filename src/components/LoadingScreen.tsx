export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  )
}

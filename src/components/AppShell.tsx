import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-atmosphere min-h-dvh">{children}</div>
}

import { useEffect, useState } from 'react'
import { Mail, Phone, Search } from 'lucide-react'
import { PageTransition } from '../../components/PageTransition'
import { LoadingScreen } from '../../components/LoadingScreen'
import type { UserModel } from '../../lib/types'
import { subscribeAlumniUsers } from '../../services/databaseService'

export function DepartmentAlumniPage() {
  const [alumni, setAlumni] = useState<UserModel[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    return subscribeAlumniUsers(setAlumni)
  }, [])

  const filtered =
    alumni?.filter((a) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return `${a.name} ${a.email} ${a.sapId} ${a.company}`.toLowerCase().includes(q)
    }) ?? []

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-bold">Alumni Contacts</h1>
      </header>
      <div className="p-4">
        <div className="relative mb-4">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alumni…"
            className="w-full rounded-2xl bg-[var(--bg-elevated)] py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/35"
          />
        </div>

        {!alumni ? (
          <LoadingScreen />
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">No alumni found.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((a) => (
              <li key={a.uid} className="card-surface p-4">
                <p className="font-bold">{a.name || 'Unknown'}</p>
                <p className="text-xs text-[var(--text-muted)]">{a.sapId || 'No SAP ID'}</p>
                {a.jobTitle || a.company ? (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {[a.jobTitle, a.company].filter(Boolean).join(' at ')}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-primary">
                  {a.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} /> {a.email}
                    </span>
                  )}
                  {a.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {a.phone}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageTransition>
  )
}

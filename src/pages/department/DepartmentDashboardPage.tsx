import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { PageTransition } from '../../components/PageTransition'
import { LoadingScreen } from '../../components/LoadingScreen'
import type { EventDoc, TranscriptRequest, UserModel } from '../../lib/types'
import {
  subscribeAlumniUsers,
  subscribeEvents,
  subscribePendingTranscriptRequests,
} from '../../services/databaseService'

export function DepartmentDashboardPage() {
  const [alumni, setAlumni] = useState<UserModel[] | null>(null)
  const [pending, setPending] = useState<TranscriptRequest[] | null>(null)
  const [events, setEvents] = useState<EventDoc[] | null>(null)

  useEffect(() => {
    const u1 = subscribeAlumniUsers(setAlumni)
    const u2 = subscribePendingTranscriptRequests(setPending)
    const u3 = subscribeEvents(setEvents)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  if (!alumni || !pending || !events) return <LoadingScreen />

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-bold">Dashboard</h1>
      </header>
      <div className="space-y-6 p-4">
        <h2 className="text-xl font-bold">Department Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Alumni" value={String(alumni.length)} />
          <StatCard label="Upcoming Events" value={String(Math.min(events.length, 3))} />
          <StatCard label="Pending Requests" value={String(pending.length)} />
        </div>

        <section>
          <h3 className="mb-3 text-lg font-bold">Recent Alumni Activities</h3>
          <ul className="space-y-2">
            {alumni.slice(0, 3).map((a) => (
              <li key={a.uid} className="card-surface flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                  {(a.name || 'A').slice(0, 1)}
                </div>
                <div>
                  <p className="font-semibold">{a.name || 'Unknown'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{a.sapId || 'N/A'}</p>
                </div>
              </li>
            ))}
            {alumni.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No alumni found</p>
            )}
          </ul>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold">Upcoming Department Events</h3>
          <ul className="space-y-2">
            {events.slice(0, 5).map((ev) => (
              <li key={ev.id} className="card-surface p-3">
                <p className="font-semibold">{ev.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {ev.date ? format(ev.date, 'MMM d, yyyy') : 'TBA'} · {ev.location}
                </p>
              </li>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No events yet</p>
            )}
          </ul>
        </section>
      </div>
    </PageTransition>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4 shadow-sm">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-3xl font-black text-primary">{value}</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ChevronRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { LoadingScreen } from '../../components/LoadingScreen'
import type { TranscriptRequest } from '../../lib/types'
import { subscribePendingTranscriptRequests } from '../../services/databaseService'

export function SsdRequestsPage() {
  const [requests, setRequests] = useState<TranscriptRequest[] | null>(null)

  useEffect(() => {
    return subscribePendingTranscriptRequests(setRequests)
  }, [])

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-6 py-5">
        <h1 className="text-center text-xl font-extrabold tracking-tight">SSD Admin</h1>
      </header>

      <div className="px-6 pt-6">
        <h2 className="text-2xl font-black tracking-tight">Review Requests</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage incoming transcript and degree applications
        </p>
      </div>

      {!requests ? (
        <LoadingScreen />
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
          <div className="rounded-full bg-primary/10 p-5 text-primary">
            <Inbox size={36} />
          </div>
          <p className="font-bold">All caught up</p>
          <p className="text-sm text-[var(--text-muted)]">No pending requests right now.</p>
        </div>
      ) : (
        <ul className="grid gap-3 p-4 md:grid-cols-2">
          {requests.map((req) => (
            <li key={req.id}>
              <Link
                to={`/ssd/requests/${req.id}`}
                state={{ request: req }}
                className="card-surface flex items-center gap-3 p-4 shadow-sm transition hover:border-primary/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{req.alumniName || 'Applicant'}</p>
                  <p className="text-sm text-[var(--text-muted)]">{req.documentType}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {req.sapId} · {req.createdAt ? format(req.createdAt, 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageTransition>
  )
}

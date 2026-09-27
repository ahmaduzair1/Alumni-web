import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'
import type { TranscriptRequest } from '../../lib/types'
import {
  createTranscriptRequest,
  subscribeAlumniTranscriptRequests,
} from '../../services/databaseService'

const DOC_TYPES = ['Transcript', 'Degree Certificate', 'Character Certificate', 'Other']

export function AlumniDocumentsPage() {
  const { user } = useAuth()
  const [documentType, setDocumentType] = useState('Transcript')
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [registrationNo, setRegistrationNo] = useState(user?.sapId ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<TranscriptRequest[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribeAlumniTranscriptRequests(user.uid, setHistory)
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!fullName.trim() || !registrationNo.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const sapId = user.sapId || registrationNo.trim()
      await createTranscriptRequest({
        alumniId: user.uid,
        alumniName: fullName.trim(),
        sapId,
        documentType,
        registrationNo: registrationNo.trim(),
      })
      setSuccess('Request submitted successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-4 backdrop-blur">
        <h1 className="text-center text-xl font-bold">Documents</h1>
      </header>

      <div className="space-y-8 p-4">
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 shadow-sm">
          <h2 className="text-lg font-bold">Request a Document</h2>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div>
            <label className="mb-2 block text-sm font-bold">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-2xl border-none bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text)] outline-none focus:ring-2 focus:ring-primary/40"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <TextField
            label="Full Name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            label="Registration No"
            name="registrationNo"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
          />

          <PrimaryButton type="submit" loading={submitting}>
            Submit Request
          </PrimaryButton>
        </form>

        <section>
          <h2 className="mb-3 text-lg font-bold">Request History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No requests yet.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {history.map((req) => (
                <li key={req.id} className="card-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{req.documentType}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Requested {req.createdAt ? format(req.createdAt, 'd MMM yyyy') : '—'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Registration no: {req.registrationNo || '—'}
                      </p>
                    </div>
                    <StatusChip status={req.status} />
                  </div>
                  <ApprovalDetails reason={req.reason} status={req.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageTransition>
  )
}

function ApprovalDetails({ reason, status }: { reason?: string; status: string }) {
  const lines = (reason ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const labeled = lines
    .map((line) => {
      const splitAt = line.indexOf(':')
      if (splitAt <= 0) return null
      return { label: line.slice(0, splitAt).trim(), value: line.slice(splitAt + 1).trim() }
    })
    .filter((row): row is { label: string; value: string } => Boolean(row?.value))

  if (labeled.length === 0) {
    if (status === 'Pending') return null
    return (
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        {status === 'Approved'
          ? 'Approved. The approver was not recorded for this request.'
          : reason || 'No extra details were recorded.'}
      </p>
    )
  }

  return (
    <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
      {labeled.map((row) => (
        <div key={row.label}>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{row.label}</dt>
          <dd className="text-sm font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function StatusChip({ status }: { status: string }) {
  const styles =
    status === 'Approved'
      ? 'bg-green-500/15 text-green-600'
      : status === 'Rejected'
        ? 'bg-red-500/15 text-red-500'
        : 'bg-amber-500/15 text-amber-600'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>{status}</span>
  )
}

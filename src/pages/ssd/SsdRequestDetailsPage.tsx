import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useAuth } from '../../contexts/AuthContext'
import type { TranscriptRequest } from '../../lib/types'
import { updateTranscriptStatus } from '../../services/databaseService'

export function SsdRequestDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const request = (location.state as { request?: TranscriptRequest } | null)?.request
  const [reason, setReason] = useState(request?.reason ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function update(status: 'Approved' | 'Rejected') {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      await updateTranscriptStatus(
        id,
        status,
        { name: user?.name || 'Staff', role: user?.role ?? 'ssd' },
        reason.trim() || undefined,
      )
      navigate('/ssd/requests', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!request) {
    return (
      <PageTransition>
        <div className="p-6 text-center">
          <p className="mb-4 text-[var(--text-muted)]">Request details unavailable.</p>
          <button type="button" className="text-primary font-bold" onClick={() => navigate('/ssd/requests')}>
            Back to requests
          </button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="px-4 pb-8 pt-4">
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 pr-10 text-center text-xl font-bold">Application Details</h1>
        </div>

        <h2 className="text-2xl font-bold">{request.documentType}</h2>
        <span className="mt-2 inline-block rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
          Pending Review
        </span>

        <div className="card-surface mt-6 space-y-3 p-5">
          <h3 className="font-bold">Applicant Information</h3>
          <Row label="Full Name" value={request.alumniName} />
          <Row label="Alumni/Student ID" value={request.sapId} />
          <Row label="Registration No" value={request.registrationNo} />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-bold">Notes / Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Optional note for approval or rejection"
            className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none focus:ring-2 focus:ring-primary/35"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => update('Rejected')}
            className="rounded-2xl bg-red-500 py-3.5 font-bold text-white disabled:opacity-60"
          >
            Reject
          </button>
          <PrimaryButton loading={loading} onClick={() => update('Approved')}>
            Approve
          </PrimaryButton>
        </div>
      </div>
    </PageTransition>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="font-semibold">{value || '—'}</p>
    </div>
  )
}

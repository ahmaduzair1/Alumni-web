import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { PageTransition } from '../../components/PageTransition'
import { AuthSplit } from '../../components/AuthSplit'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'
import { findUserByEmail } from '../../services/authService'
import { db } from '../../lib/firebase'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = identifier.trim()
    if (!value) {
      setError('Enter your registered email or roll number.')
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      let email = value
      if (!value.includes('@')) {
        const snap = await getDocs(
          query(collection(db, 'users'), where('sap id', '==', value), limit(1)),
        )
        if (snap.empty) throw new Error('No user found with this Roll Number.')
        email = String(snap.docs[0].data().email ?? '')
      } else {
        const existing = await findUserByEmail(value)
        if (existing?.email) email = existing.email
      }
      await resetPassword(email)
      setMessage('Password reset email sent. Open it and choose a new password, then log in.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplit tone="alumni" eyebrow="Alumni portal" headline="Reset your password">
    <PageTransition>
      <div className="flex flex-1 flex-col px-7 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 pr-10 text-center text-xl font-bold">Forgot Password</h1>
        </div>

        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Alumni Connect" className="mb-8 h-20 w-auto object-contain" />
          <h2 className="text-xl font-bold">Enter your registered email or roll number</h2>
          <p className="mt-3 text-[var(--text-muted)]">
            We will send a password reset link to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg bg-green-500/10 px-3 py-3 text-center text-sm text-green-600">
              {message}
            </div>
          )}
          <TextField
            label="Email or Roll Number"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="email@example.com or 201X-ARID-XXXX"
          />
          <PrimaryButton type="submit" loading={loading}>
            Send Reset Link
          </PrimaryButton>
        </form>
      </div>
    </PageTransition>
    </AuthSplit>
  )
}

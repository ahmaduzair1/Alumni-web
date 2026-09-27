import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthSplit } from '../../components/AuthSplit'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const code = params.get('oobCode') ?? ''
  const navigate = useNavigate()
  const { confirmReset } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code) {
      setError('Open the reset link from your email to choose a new password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await confirmReset(code, password)
      setMessage('Password updated. You can log in with the new password.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This reset link is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplit tone="alumni" eyebrow="Account" headline="Choose a new password">
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/role')}
          className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {code
            ? 'Enter a new password for your account.'
            : 'Use the link in the password reset email. After you set a new password there, come back and log in.'}
        </p>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-3 text-sm text-red-500">{error}</p>}
        {message && <p className="rounded-lg bg-green-500/10 px-3 py-3 text-sm text-green-600">{message}</p>}
        {code && !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="New password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <TextField
              label="Confirm password"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <PrimaryButton type="submit" loading={loading}>
              Save new password
            </PrimaryButton>
          </form>
        )}
        <Link to="/role" className="inline-block text-sm font-bold text-primary">
          Back to login
        </Link>
      </div>
    </AuthSplit>
  )
}

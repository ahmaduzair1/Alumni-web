import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { AuthSplit } from '../../components/AuthSplit'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../lib/types'
import { AuthNotice } from '../../services/authService'

const config: Record<
  string,
  { role: UserRole; title: string; loginPath: string; homePath: string; needsSap: boolean }
> = {
  alumni: {
    role: 'alumni',
    title: 'Alumni Register',
    loginPath: '/login/alumni',
    homePath: '/alumni/events',
    needsSap: true,
  },
  ssd: {
    role: 'ssd',
    title: 'SSD Register',
    loginPath: '/login/ssd',
    homePath: '/ssd/requests',
    needsSap: false,
  },
  dept: {
    role: 'dept',
    title: 'Department Register',
    loginPath: '/login/dept',
    homePath: '/department/dashboard',
    needsSap: false,
  },
}

export function RegisterPage() {
  const { roleKey = 'alumni' } = useParams()
  const cfg = config[roleKey] ?? config.alumni
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [sapId, setSapId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorLoginPath, setErrorLoginPath] = useState<string | null>(null)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (cfg.needsSap && !sapId.trim()) {
      setError('Please enter your Roll Number (SAP ID).')
      return
    }
    setLoading(true)
    setError(null)
    setErrorLoginPath(null)
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role: cfg.role,
        sapId: cfg.needsSap ? sapId.trim() : undefined,
      })
      setVerificationEmail(email.trim())
    } catch (err) {
      if (err instanceof AuthNotice) {
        setError(err.message)
        setErrorLoginPath(err.loginPath ?? cfg.loginPath)
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplit
      tone={cfg.role === 'alumni' ? 'alumni' : 'staff'}
      eyebrow={cfg.role === 'alumni' ? 'Alumni portal' : 'Staff portal'}
      headline={cfg.title}
    >
    {verificationEmail ? (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primary">Check your email</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          A verification email has been sent to <span className="font-semibold text-[var(--text)]">{verificationEmail}</span>.
          Open it and confirm your address before you continue.
        </p>
        <PrimaryButton onClick={() => navigate(cfg.homePath, { replace: true })}>
          Continue
        </PrimaryButton>
      </div>
    ) : (
    <PageTransition>
      <div className="flex flex-1 flex-col px-7 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(cfg.loginPath)}
            className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold pr-10">{cfg.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-3 text-center text-sm text-red-500">
              <p>{error}</p>
              {errorLoginPath && (
                <Link to={errorLoginPath} className="mt-2 inline-block font-bold underline">
                  Go to login
                </Link>
              )}
            </div>
          )}

          <TextField
            label="Full Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />

          {cfg.needsSap && (
            <TextField
              label="Roll Number (SAP ID)"
              name="sapId"
              value={sapId}
              onChange={(e) => setSapId(e.target.value)}
              placeholder="e.g. 201X-ARID-XXXX"
            />
          )}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <div className="mt-4">
            <PrimaryButton type="submit" loading={loading}>
              Create Account
            </PrimaryButton>
          </div>
        </form>
      </div>
    </PageTransition>
    )}
    </AuthSplit>
  )
}

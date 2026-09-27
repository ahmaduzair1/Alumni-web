import { useState } from 'react'
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { AuthSplit } from '../../components/AuthSplit'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'
import { roleLabel, roleLoginPath, type UserModel, type UserRole } from '../../lib/types'
import { AuthNotice, findUserByEmail } from '../../services/authService'

const portalConfig: Record<
  string,
  { title: string; subtitle: string; role: UserRole; registerPath: string; homePath: string }
> = {
  alumni: {
    title: 'Alumni Login',
    subtitle: 'Enter your credentials to access the alumni portal.',
    role: 'alumni',
    registerPath: '/register/alumni',
    homePath: '/alumni/events',
  },
  ssd: {
    title: 'SSD Admin Login',
    subtitle: 'Enter your credentials to access the SSD portal.',
    role: 'ssd',
    registerPath: '/register/ssd',
    homePath: '/ssd/requests',
  },
  dept: {
    title: 'Department Login',
    subtitle: 'Enter your credentials to access the department portal.',
    role: 'dept',
    registerPath: '/register/dept',
    homePath: '/department/dashboard',
  },
}

export function LoginPage() {
  const { roleKey = 'alumni' } = useParams()
  const config = portalConfig[roleKey] ?? portalConfig.alumni
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signOut } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorLoginPath, setErrorLoginPath] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Please enter your roll number/email and password.')
      return
    }
    setLoading(true)
    setError(null)
    setErrorLoginPath(null)
    try {
      if (identifier.includes('@')) {
        let existing: UserModel | null = null
        try {
          existing = await findUserByEmail(identifier)
        } catch {
          existing = null
        }
        if (existing && existing.role !== config.role) {
          const label = roleLabel(existing.role)
          setError(
            `This email is registered as ${label}. Please log in through the ${label} portal. It cannot be used for another role.`,
          )
          setErrorLoginPath(roleLoginPath(existing.role))
          return
        }
      }
      const user = await signIn(identifier.trim(), password)
      if (user.role !== config.role) {
        await signOut()
        const label = roleLabel(user.role)
        setError(
          `This email is registered as ${label}. Please log in through the ${label} portal. It cannot be used for another role.`,
        )
        setErrorLoginPath(roleLoginPath(user.role))
        return
      }
      navigate(config.homePath, { replace: true })
    } catch (err) {
      if (err instanceof AuthNotice) {
        setError(err.message)
        setErrorLoginPath(err.loginPath ?? null)
      } else {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleForgot() {
    navigate('/forgot-password')
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    setErrorLoginPath(null)
    try {
      await signInWithGoogle(config.role)
      navigate(config.homePath, { replace: true })
    } catch (err) {
      if (err instanceof AuthNotice) {
        setError(err.message)
        setErrorLoginPath(err.loginPath ?? null)
      } else {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const staff = config.role !== 'alumni'

  return (
    <AuthSplit
      tone={staff ? 'staff' : 'alumni'}
      eyebrow={staff ? 'Staff portal' : 'Alumni portal'}
      headline={config.title}
    >
    <PageTransition>
      <div className="flex flex-1 flex-col px-7 pb-6 pt-4">
        <button
          type="button"
          onClick={() => navigate('/role')}
          className="mb-2 self-start rounded-full p-2 hover:bg-[var(--bg-elevated)]"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>

        <form onSubmit={handleLogin} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="mb-6 flex flex-col items-center text-center">
              <img
                src="/logo.png"
                alt="Alumni Connect"
                className="mb-6 h-20 w-auto object-contain drop-shadow-[0_0_40px_rgba(0,128,128,0.2)]"
              />
              <h1 className="text-2xl font-bold text-primary">{config.title}</h1>
              <p className="mt-2 text-[var(--text-muted)]">{config.subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-3 text-center text-sm text-red-500">
                <p>{error}</p>
                {errorLoginPath && (
                  <Link to={errorLoginPath} className="mt-2 inline-block font-bold underline">
                    Go to the correct login
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-5">
              <TextField
                label="Roll Number/Email"
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="201X-ARID-XXXX or email@example.com"
                leftIcon={<User size={18} />}
                autoComplete="username"
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock size={18} />}
                autoComplete="current-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[var(--text-muted)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleForgot}
                className="text-sm font-bold text-gold"
              >
                Forgot Password?
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <PrimaryButton type="submit" loading={loading}>
                Continue with email
              </PrimaryButton>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleGoogle()}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-bold disabled:opacity-60"
              >
                <GoogleMark />
                Continue with Google
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link to={config.registerPath} className="font-bold text-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </PageTransition>
    </AuthSplit>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.2l6.3 5.3C37.4 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}

import { ArrowLeft, HelpCircle, Lock, Moon, Sun, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export function AlumniSettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  async function handleLogout() {
    await signOut()
    navigate('/login/alumni', { replace: true })
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
          <h1 className="flex-1 pr-10 text-center text-xl font-bold">Settings</h1>
        </div>

        <div className="card-surface overflow-hidden shadow-sm">
          <Link
            to="/alumni/edit-profile"
            className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 hover:bg-[var(--bg-elevated)]"
          >
            <User size={20} className="text-primary" />
            <span className="font-semibold">Edit Profile</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-4 text-left hover:bg-[var(--bg-elevated)]"
          >
            {isDark ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />}
            <span className="flex-1 font-semibold">Dark Mode</span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isDark ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 text-[var(--text-muted)]">
            <Lock size={20} />
            <span className="font-semibold">Privacy Controls</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-4 text-[var(--text-muted)]">
            <HelpCircle size={20} />
            <span className="font-semibold">Help & Support</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-2xl bg-red-500 py-4 font-bold text-white shadow-md shadow-red-500/25"
        >
          Log Out
        </button>
      </div>
    </PageTransition>
  )
}

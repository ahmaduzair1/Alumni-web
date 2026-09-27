import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Mail, Moon, Settings, Sun } from 'lucide-react'
import { PageTransition } from '../../components/PageTransition'
import { ProfilePhotoControl } from '../../components/ProfilePhotoControl'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export function DepartmentSettingsPage() {
  const { signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login/dept', { replace: true })
  }

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-bold">Settings</h1>
      </header>
      <div className="space-y-4 p-4">
        <div className="card-surface flex flex-col items-center px-6 py-8">
          <ProfilePhotoControl />
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="card-surface flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          {isDark ? <Sun size={20} className="text-[#008080]" /> : <Moon size={20} className="text-[#008080]" />}
          <span className="flex-1 font-semibold">Dark Mode</span>
          <span className={`relative h-6 w-11 rounded-full ${isDark ? 'bg-[#2F81F7]' : 'bg-[#008080]'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </span>
        </button>
        <div className="card-surface overflow-hidden">
          <Row icon={<Settings size={20} />} title="Department Configuration" />
          <Row icon={<Mail size={20} />} title="Email Settings" />
          <Row icon={<HelpCircle size={20} />} title="Help & Support" last />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl bg-red-500 py-4 font-bold text-white"
        >
          Log Out
        </button>
      </div>
    </PageTransition>
  )
}

function Row({
  icon,
  title,
  last,
}: {
  icon: ReactNode
  title: string
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-4 ${last ? '' : 'border-b border-[var(--border)]'}`}
    >
      <span className="text-primary">{icon}</span>
      <span className="font-semibold">{title}</span>
    </div>
  )
}

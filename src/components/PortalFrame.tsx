import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, type LucideIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export interface PortalNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function PortalFrame({
  variant,
  title,
  items,
  signOutTo,
  children,
}: {
  variant: 'alumni' | 'staff'
  title: string
  items: PortalNavItem[]
  signOutTo: string
  children: ReactNode
}) {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const staff = variant === 'staff'

  async function handleSignOut() {
    await signOut()
    navigate(signOutTo, { replace: true })
  }

  return (
    <div className={`flex h-dvh ${staff ? 'staff-portal' : 'alumni-portal'}`}>
      <aside
        className={`flex w-64 shrink-0 flex-col border-r ${
          staff
            ? 'border-white/10 bg-[#0D1117] text-white'
            : 'border-[var(--border)] bg-[var(--card)] text-[var(--text)]'
        }`}
      >
        <div className={`px-5 pb-4 pt-6 ${staff ? 'border-b border-white/10' : ''}`}>
          <img src="/logo.png" alt="" className="mb-3 h-12 w-auto object-contain" />
          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${staff ? 'text-[#00BFB2]' : 'text-[#008080]'}`}>
            {title}
          </p>
          <p className={`mt-1 truncate text-sm font-semibold ${staff ? 'text-white' : ''}`}>
            {user?.name || 'Signed in'}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  staff
                    ? `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide ${
                        isActive ? 'bg-[#008080] text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
                      }`
                    : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        isActive
                          ? 'bg-[#008080]/10 text-[#008080]'
                          : 'text-[var(--text-muted)] hover:bg-[#008080]/10 hover:text-[var(--text)]'
                      }`
                }
              >
                <Icon size={20} strokeWidth={2} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className={`space-y-1 px-3 py-4 ${staff ? 'border-t border-white/10' : 'border-t border-[var(--border)]'}`}>
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              staff ? 'text-white/70 hover:bg-white/5' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="portal-main min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

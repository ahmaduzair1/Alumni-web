import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, GraduationCap, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthSplit } from '../../components/AuthSplit'
import { useTheme } from '../../contexts/ThemeContext'
import type { UserRole } from '../../lib/types'

const roles: {
  role: UserRole
  title: string
  loginPath: string
  icon: typeof GraduationCap
  primary?: boolean
}[] = [
  {
    role: 'alumni',
    title: 'Alumni',
    loginPath: '/login/alumni',
    icon: GraduationCap,
    primary: true,
  },
  {
    role: 'ssd',
    title: 'SSD',
    loginPath: '/login/ssd',
    icon: Shield,
  },
  {
    role: 'dept',
    title: 'Department',
    loginPath: '/login/dept',
    icon: Building2,
  },
]

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <AuthSplit tone="alumni" eyebrow="Choose a portal" headline="Welcome to Alumni Connect Network">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-6 rounded-full p-2 text-[var(--text)] hover:bg-[var(--bg-elevated)]"
        aria-label="Back"
      >
        <ArrowLeft size={22} />
      </button>
      <h2 className="text-2xl font-extrabold tracking-tight">Select your role</h2>
      <p className="mb-8 mt-2 text-[var(--text-muted)]">
        Alumni uses its own portal. SSD and Department share the staff portal.
      </p>
      <div className="flex flex-col gap-4">
        {roles.map((item, index) => {
          const Icon = item.icon
          const staff = !item.primary
          return (
            <motion.button
              key={item.role}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.loginPath)}
              className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left ${
                item.primary
                  ? 'border-[#008080] bg-[#008080] text-white shadow-lg shadow-[#008080]/30'
                  : isDark
                    ? 'border-white/10 bg-[#161B22] text-white'
                    : 'border-gray-200 bg-white text-[var(--text)] shadow-sm'
              }`}
            >
              <span
                className={`rounded-xl p-2.5 ${
                  item.primary ? 'bg-white/20' : 'bg-[#008080]/10 text-[#008080]'
                }`}
              >
                <Icon size={22} />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold">{item.title}</span>
                <span className={`text-xs ${item.primary ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {staff ? 'Staff portal' : 'Alumni portal'}
                </span>
              </span>
              <ArrowRight size={16} className={item.primary ? 'text-white/70' : 'text-[var(--text-muted)]'} />
            </motion.button>
          )
        })}
      </div>
    </AuthSplit>
  )
}

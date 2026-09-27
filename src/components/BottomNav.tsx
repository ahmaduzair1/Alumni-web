import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="shrink-0 border-t border-[var(--border)] bg-[var(--nav-bg)] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-400 dark:text-white/30'
                  }`
                }
              >
                <Icon size={22} strokeWidth={2} />
                <span className="uppercase tracking-wide">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

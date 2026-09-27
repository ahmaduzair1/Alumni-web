import { useState } from 'react'
import { PageTransition } from '../../components/PageTransition'

const TABS = ['Announcements', 'Email', 'SMS'] as const

export function DepartmentCommunicationPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Announcements')

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-bold">Communication</h1>
      </header>
      <div className="p-4">
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${
                tab === t ? 'bg-primary text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="card-surface p-5">
          <h2 className="font-bold">{tab}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Mock {tab.toLowerCase()} workspace — compose and schedule outreach tools will connect
            here. This tab mirrors the Flutter communication screen layout.
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

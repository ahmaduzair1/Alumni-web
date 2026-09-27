import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '../../components/PageTransition'
import { PostBody } from '../../components/PostBody'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useAuth } from '../../contexts/AuthContext'
import type { ExperienceDoc } from '../../lib/types'
import { applyToPost, subscribeExperiences, subscribeMyApplications } from '../../services/databaseService'

const CHIPS = ['All', 'Career', 'Mentorship', 'Campus'] as const

export function AlumniExperiencesPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ExperienceDoc[] | null>(null)
  const [applied, setApplied] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('All')

  useEffect(() => subscribeExperiences(setItems), [])
  useEffect(() => {
    if (!user) return
    return subscribeMyApplications(user.uid, setApplied)
  }, [user])

  const filtered = useMemo(() => {
    if (!items) return []
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (item.classInfo === 'Update') return false
      const hay = `${item.title} ${item.content} ${item.author} ${item.classInfo}`.toLowerCase()
      if (q && !hay.includes(q)) return false
      if (chip === 'Career') return item.classInfo === 'Career' || hay.includes('career')
      if (chip === 'Mentorship') return hay.includes('mentor')
      if (chip === 'Campus') return hay.includes('campus') || hay.includes('class')
      return true
    })
  }, [items, query, chip])

  return (
    <PageTransition>
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-4 backdrop-blur">
        <h1 className="text-center text-xl font-extrabold tracking-tight">Experiences</h1>
        <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
          Shared with every signed-in alumni
        </p>
      </header>

      <div className="relative flex flex-1 flex-col pb-20">
        <div className="space-y-3 px-4 pt-2">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiences…"
              className="w-full rounded-2xl bg-[var(--bg-elevated)] py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/35"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  chip === c
                    ? 'bg-primary text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                {c}
              </button>
            ))}
            <Link
              to="/alumni/career"
              className="shrink-0 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-bold text-gold"
            >
              Career Hub
            </Link>
          </div>
        </div>

        {!items ? (
          <LoadingScreen />
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-[var(--text-muted)]">
            No experiences yet. Share the first one.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 px-4 md:grid-cols-2">
            {filtered.map((item) => (
              <li key={item.id} className="card-surface p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      item.author.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{item.author}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {[
                        item.classInfo,
                        item.createdAt
                          ? formatDistanceToNow(item.createdAt, { addSuffix: true })
                          : 'Just now',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <h3 className="mb-1 font-bold">{item.title}</h3>
                <PostBody content={item.content} />
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mb-3 max-h-56 w-full rounded-xl object-cover"
                  />
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Heart size={14} /> {item.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} /> {item.comments}
                  </span>
                  {user && user.uid !== item.authorId && (
                    <ApplyButton
                      applied={applied.includes(item.id)}
                      onApply={() => applyToPost({ alumniId: user.uid, experienceId: item.id, title: item.title })}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/alumni/experiences/add"
          className="pointer-events-none absolute bottom-6 right-4 z-20"
        >
          <motion.span
            whileTap={{ scale: 0.94 }}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/40"
          >
            <Plus size={28} />
          </motion.span>
        </Link>
      </div>
    </PageTransition>
  )
}

function ApplyButton({ applied, onApply }: { applied: boolean; onApply: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (applied || busy) return
    setBusy(true)
    setError(null)
    try {
      await onApply()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={applied || busy}
        onClick={() => void handleClick()}
        className="rounded-full bg-[#008080] px-3 py-1 text-xs font-bold text-white disabled:opacity-60"
      >
        {applied ? 'Applied' : busy ? 'Applying…' : 'Apply'}
      </button>
      {error && <span className="text-red-500">{error}</span>}
    </span>
  )
}

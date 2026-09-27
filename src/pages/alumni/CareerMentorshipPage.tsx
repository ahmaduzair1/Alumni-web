import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { PostBody } from '../../components/PostBody'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useAuth } from '../../contexts/AuthContext'
import type { ExperienceDoc } from '../../lib/types'
import { applyToPost, subscribeExperiences, subscribeMyApplications } from '../../services/databaseService'

export function CareerMentorshipPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ExperienceDoc[] | null>(null)
  const [applied, setApplied] = useState<string[]>([])

  useEffect(() => subscribeExperiences(setItems), [])
  useEffect(() => {
    if (!user) return
    return subscribeMyApplications(user.uid, setApplied)
  }, [user])

  const careers = (items ?? []).filter((item) => item.classInfo === 'Career')

  return (
    <PageTransition>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Career</h1>
        <Link to="/alumni/experiences/add?type=career" className="rounded-full bg-[#008080] px-4 py-2 text-sm font-bold text-white">
          Share a career
        </Link>
      </header>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Alumni share what to do, what not to do, and how you can apply.
      </p>
      {!items ? (
        <LoadingScreen />
      ) : careers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No career posts yet.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {careers.map((item) => (
            <li key={item.id} className="card-surface p-4">
              <p className="font-bold">{item.title}</p>
              <p className="mb-2 text-xs text-[var(--text-muted)]">{item.author}</p>
              <PostBody content={item.content} />
              {user && user.uid !== item.authorId && (
                <button
                  type="button"
                  disabled={applied.includes(item.id)}
                  onClick={() => void applyToPost({ alumniId: user.uid, experienceId: item.id, title: item.title })}
                  className="mt-4 rounded-full bg-[#008080] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {applied.includes(item.id) ? 'Applied' : 'Apply'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageTransition>
  )
}

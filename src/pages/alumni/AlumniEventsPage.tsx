import { useEffect, useState } from 'react'
import { Building2, CalendarDays, GraduationCap, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { PageTransition } from '../../components/PageTransition'
import { PostBody, composePost } from '../../components/PostBody'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useAuth } from '../../contexts/AuthContext'
import type { EventDoc, ExperienceDoc } from '../../lib/types'
import {
  createExperience,
  registerForEvent,
  subscribeEventRegistration,
  subscribeEvents,
  subscribeExperiences,
} from '../../services/databaseService'

function EventCard({ event, uid, name, email }: {
  event: EventDoc
  uid: string
  name: string
  email: string
}) {
  const [registered, setRegistered] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    return subscribeEventRegistration(event.id, uid, setRegistered)
  }, [event.id, uid])

  async function handleJoin() {
    if (registered || joining) return
    setJoining(true)
    try {
      await registerForEvent({ eventId: event.id, uid, name, email })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setJoining(false)
    }
  }

  const dateLabel = event.date ? format(event.date, 'MMM dd').toUpperCase() : 'TBA'
  const Icon = event.organizer === 'SSD' ? GraduationCap : Building2

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface overflow-hidden p-5 shadow-sm"
    >
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={22} />
          <span className="mt-1 text-[10px] font-bold">{dateLabel}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="font-bold text-[var(--text)]">{event.title}</h3>
            <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
              {event.organizer || 'Event'}
            </span>
          </div>
          {event.description && <PostBody content={event.description} />}
          {event.location && (
            <p className="mb-3 flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin size={12} /> {event.location}
            </p>
          )}
          {registered ? (
            <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">
              GOING
            </span>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              disabled={joining}
              onClick={handleJoin}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/30 disabled:opacity-60"
            >
              {joining ? 'Joining…' : 'JOIN'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function AlumniEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventDoc[] | null>(null)
  const [updates, setUpdates] = useState<ExperienceDoc[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [doing, setDoing] = useState('')
  const [notDoing, setNotDoing] = useState('')
  const [posting, setPosting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => subscribeEvents(setEvents), [])
  useEffect(() => subscribeExperiences(setUpdates), [])

  async function shareUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !doing.trim()) {
      setError('Add a title and what is being done.')
      return
    }
    setPosting(true)
    setError(null)
    setNotice(null)
    try {
      await createExperience({
        authorId: user.uid,
        author: user.name || 'Alumni',
        classInfo: 'Update',
        title: title.trim(),
        content: composePost({ doing, notDoing }),
        avatarUrl: user.photoUrl && user.photoUrl.length <= 4000 ? user.photoUrl : undefined,
      })
      setTitle('')
      setDoing('')
      setNotDoing('')
      setNotice('Your update is visible to other students.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not share this update')
    } finally {
      setPosting(false)
    }
  }

  const community = (updates ?? []).filter((item) => item.classInfo === 'Update')

  return (
    <PageTransition>
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-4 backdrop-blur">
        <h1 className="text-center text-xl font-extrabold tracking-tight">Events</h1>
      </header>

      <form onSubmit={shareUpdate} className="card-surface m-4 space-y-3 p-5">
        <h2 className="font-bold">Share what is happening</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Tell other students what is being done, and what they should not do.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {notice && <p className="text-sm text-green-600">{notice}</p>}
        <TextField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="block text-sm font-bold">
          What is being done
          <textarea value={doing} onChange={(e) => setDoing(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
        </label>
        <label className="block text-sm font-bold">
          What not to do
          <textarea value={notDoing} onChange={(e) => setNotDoing(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
        </label>
        <PrimaryButton type="submit" loading={posting} className="max-w-xs">
          Share update
        </PrimaryButton>
      </form>

      {!events || !updates ? (
        <LoadingScreen />
      ) : events.length === 0 && community.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <CalendarDays className="text-gray-300 dark:text-white/20" size={64} />
          <p className="text-[var(--text-muted)]">No events published yet.</p>
        </div>
      ) : (
        <div className="space-y-8 p-4">
          <section>
            <h2 className="mb-3 text-lg font-bold">Published events</h2>
            {events.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">SSD and coordinators have not published an event yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    uid={user!.uid}
                    name={user!.name}
                    email={user!.email}
                  />
                ))}
              </div>
            )}
          </section>
          {community.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">From students and alumni</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {community.map((item) => (
                  <article key={item.id} className="card-surface p-4">
                    <p className="font-bold">{item.title}</p>
                    <p className="mb-2 text-xs text-[var(--text-muted)]">{item.author}</p>
                    <PostBody content={item.content} />
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageTransition>
  )
}

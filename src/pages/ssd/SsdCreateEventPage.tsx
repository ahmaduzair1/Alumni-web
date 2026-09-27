import { useState } from 'react'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { createEvent } from '../../services/databaseService'
import { composePost } from '../../components/PostBody'

export function SsdCreateEventPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [doing, setDoing] = useState('')
  const [notDoing, setNotDoing] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const [y, m, d] = date.split('-').map(Number)
      const [hh, mm] = (time || '00:00').split(':').map(Number)
      const eventDate = new Date(y, m - 1, d, hh || 0, mm || 0)
      await createEvent({
        title: title.trim(),
        description: composePost({
          intro: description.trim(),
          doing,
          notDoing,
        }),
        location: location.trim(),
        date: eventDate,
        organizer: 'SSD',
      })
      setMessage('Event published successfully!')
      setTitle('')
      setDescription('')
      setLocation('')
      setDate('')
      setTime('')
      setDoing('')
      setNotDoing('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-extrabold">Create Event</h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <TextField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-2 block text-sm font-bold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none focus:ring-2 focus:ring-primary/35"
          />
        </div>
        <TextField label="Location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <TextField label="Date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField label="Time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <div>
          <label className="mb-2 block text-sm font-bold">What is being done</label>
          <textarea value={doing} onChange={(e) => setDoing(e.target.value)} rows={3} className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none focus:ring-2 focus:ring-primary/35" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">What not to do</label>
          <textarea value={notDoing} onChange={(e) => setNotDoing(e.target.value)} rows={3} className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none focus:ring-2 focus:ring-primary/35" />
        </div>
        <PrimaryButton type="submit" loading={loading}>
          Publish Event
        </PrimaryButton>
      </form>
    </PageTransition>
  )
}

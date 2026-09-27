import { useState } from 'react'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'

export function SsdAlertsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('All Alumni')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PageTransition>
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-center text-xl font-extrabold">Compose Notification</h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <p className="text-sm text-[var(--text-muted)]">
          UI-only compose screen — notifications are not sent from the web client yet.
        </p>
        {sent && (
          <div className="rounded-xl bg-green-500/10 px-3 py-3 text-sm text-green-600">
            Notification drafted for “{audience}”.
          </div>
        )}
        <TextField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-2 block text-sm font-bold">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none focus:ring-2 focus:ring-primary/35"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none"
          >
            <option>All Alumni</option>
            <option>Class of 2024</option>
            <option>Class of 2025</option>
            <option>Department Coordinators</option>
          </select>
        </div>
        <PrimaryButton type="submit">Send Notification</PrimaryButton>
      </form>
    </PageTransition>
  )
}

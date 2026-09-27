import { useState } from 'react'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { TextField } from '../../components/TextField'
import { composePost } from '../../components/PostBody'
import { useAuth } from '../../contexts/AuthContext'
import { createExperience, uploadExperienceImage } from '../../services/databaseService'

export function AddExperiencePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [kind, setKind] = useState(params.get('type') === 'career' ? 'Career' : 'Experience')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [doing, setDoing] = useState('')
  const [notDoing, setNotDoing] = useState('')
  const [apply, setApply] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null
    setFile(next)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(next ? URL.createObjectURL(next) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || (!story.trim() && !doing.trim())) {
      setError('Add a title and describe the experience or what to do.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      let imageUrl: string | undefined
      if (file) imageUrl = await uploadExperienceImage(user.uid, file)
      await createExperience({
        authorId: user.uid,
        author: user.name || 'Alumni',
        classInfo: kind,
        title: title.trim(),
        content: composePost({
          intro: story,
          doing,
          notDoing,
          apply: kind === 'Career' ? apply : undefined,
        }),
        imageUrl,
        avatarUrl: user.photoUrl && user.photoUrl.length <= 4000 ? user.photoUrl : undefined,
      })
      navigate(kind === 'Career' ? '/alumni/career' : '/alumni/experiences', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish experience')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="px-4 pb-8 pt-4">
        <div className="mb-6 flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-[var(--bg-elevated)]" aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 pr-10 text-center text-xl font-bold">Share with students</h1>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <label className="mb-2 block text-sm font-bold">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 outline-none"
            >
              <option value="Experience">Experience</option>
              <option value="Career">Career</option>
            </select>
          </div>
          <TextField label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Share a headline" />
          <label className="block text-sm font-bold">
            Your story
            <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
          </label>
          <label className="block text-sm font-bold">
            What to do
            <textarea value={doing} onChange={(e) => setDoing(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
          </label>
          <label className="block text-sm font-bold">
            What not to do
            <textarea value={notDoing} onChange={(e) => setNotDoing(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
          </label>
          {kind === 'Career' && (
            <label className="block text-sm font-bold">
              How other students can apply
              <textarea value={apply} onChange={(e) => setApply(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 font-normal outline-none" />
            </label>
          )}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-8 text-sm text-primary">
            <ImagePlus size={28} />
            <span className="font-semibold">{file ? file.name : 'Add a photo (optional)'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
          {preview && <img src={preview} alt="" className="max-h-48 w-full rounded-xl object-cover" />}
          <PrimaryButton type="submit" loading={loading} className="max-w-xs">
            Publish
          </PrimaryButton>
        </form>
      </div>
    </PageTransition>
  )
}

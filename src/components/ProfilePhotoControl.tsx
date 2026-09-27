import { useRef, useState } from 'react'
import { Camera, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { uploadProfileImage } from '../services/databaseService'

export function ProfilePhotoControl({
  size = 112,
  previewUrl,
  onFileSelected,
}: {
  size?: number
  previewUrl?: string | null
  /** When set, the photo is kept locally until the parent saves. */
  onFileSelected?: (file: File, previewUrl: string) => void
}) {
  const { user, updateProfile } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shown = previewUrl || user?.photoUrl

  async function handleChange(file: File | undefined) {
    if (!file || !user) return
    setError(null)
    if (onFileSelected) {
      onFileSelected(file, URL.createObjectURL(file))
      return
    }
    setBusy(true)
    try {
      const photoUrl = await uploadProfileImage(user.uid, file)
      await updateProfile({ photoUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative"
        aria-label="Upload profile picture"
        disabled={busy}
      >
        <span className="block rounded-full bg-gradient-to-br from-[#008080] to-[#00BFB2] p-1 shadow-[0_10px_28px_rgba(0,128,128,0.28)]">
          <span
            className="flex items-center justify-center overflow-hidden rounded-full bg-[var(--bg)] text-[#008080]"
            style={{ width: size, height: size }}
          >
            {shown ? (
              <img src={shown} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound size={Math.round(size * 0.42)} />
            )}
          </span>
        </span>
        <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#008080] text-white shadow-md">
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Camera size={16} />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          void handleChange(file)
        }}
      />
      <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
        {busy ? 'Compressing and saving photo…' : 'Tap the camera to upload your picture'}
      </p>
      {error && <p className="mt-2 max-w-xs text-center text-sm text-red-500">{error}</p>}
    </div>
  )
}

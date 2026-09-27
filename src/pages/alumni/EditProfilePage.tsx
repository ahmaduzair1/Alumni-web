import { useState, type ReactNode } from 'react'
import { ArrowLeft, Briefcase, GraduationCap, Mail, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ProfilePhotoControl } from '../../components/ProfilePhotoControl'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../contexts/AuthContext'
import { uploadProfileImage } from '../../services/databaseService'

export function EditProfilePage() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? '')
  const [classYear, setClassYear] = useState(user?.classYear ?? '')
  const [degree, setDegree] = useState(user?.degree ?? '')
  const [institution, setInstitution] = useState(user?.institution ?? '')
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? '')
  const [company, setCompany] = useState(user?.company ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      let photoUrl = user.photoUrl
      if (file) {
        photoUrl = await uploadProfileImage(user.uid, file)
      }
      await updateProfile({
        name: name.trim(),
        classYear: classYear.trim(),
        degree: degree.trim(),
        institution: institution.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoUrl,
      })
      navigate('/alumni/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="px-4 pb-8 pt-4">
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 pr-10 text-center text-xl font-bold">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <ProfilePhotoControl
            previewUrl={preview}
            onFileSelected={(next, url) => {
              setFile(next)
              setPreview(url)
            }}
          />
          <section className="grid gap-4 md:grid-cols-2">
            <SectionTitle icon={<User size={18} />} title="Basic Information" wide />
            <TextField label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Class Year" name="classYear" value={classYear} onChange={(e) => setClassYear(e.target.value)} />
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <SectionTitle icon={<GraduationCap size={18} />} title="Education" wide />
            <TextField label="Degree Name" name="degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
            <TextField label="Institution" name="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <SectionTitle icon={<Briefcase size={18} />} title="Work Experience" wide />
            <TextField label="Job Title" name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <TextField label="Company" name="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <SectionTitle icon={<Mail size={18} />} title="Contact Details" wide />
            <TextField label="Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Phone Number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </section>
          <PrimaryButton type="submit" loading={loading} className="max-w-sm">
            Save Changes
          </PrimaryButton>
        </form>
      </div>
    </PageTransition>
  )
}

function SectionTitle({ icon, title, wide }: { icon: ReactNode; title: string; wide?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="rounded-lg bg-[#008080]/10 p-2 text-[#008080]">{icon}</span>
      <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>
    </div>
  )
}

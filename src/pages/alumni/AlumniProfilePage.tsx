import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, GraduationCap, Mail, Phone, Settings } from 'lucide-react'
import { PageTransition } from '../../components/PageTransition'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ProfilePhotoControl } from '../../components/ProfilePhotoControl'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useAuth } from '../../contexts/AuthContext'

export function AlumniProfilePage() {
  const { user, loading } = useAuth()

  if (loading || !user) return <LoadingScreen />

  return (
    <PageTransition>
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Profile</h1>
        <Link
          to="/alumni/settings"
          className="rounded-full p-2 hover:bg-[var(--bg-elevated)]"
          aria-label="Settings"
        >
          <Settings size={22} />
        </Link>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="card-surface flex flex-col items-center px-6 py-8 text-center">
          <ProfilePhotoControl size={128} />
          <h2 className="mt-4 text-2xl font-extrabold">{user.name || 'Alumni'}</h2>
          {user.classYear && (
            <span className="mt-2 rounded-full bg-[#008080]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#008080]">
              Class of {user.classYear}
            </span>
          )}
        </div>
        <div className="space-y-4">

        <InfoCard
          icon={<GraduationCap size={20} />}
          title="Education"
          lines={[
            [user.degree, user.institution].filter(Boolean).join(' · ') || 'Add your education',
          ]}
        />
        <InfoCard
          icon={<Briefcase size={20} />}
          title="Work Experience"
          lines={[
            [user.company, user.jobTitle].filter(Boolean).join(' · ') || 'Add work details',
          ]}
        />
        <InfoCard
          icon={<Mail size={20} />}
          title="Contact Info"
          lines={[
            user.email || 'No email',
            user.phone ? undefined : undefined,
          ].filter(Boolean) as string[]}
          extra={
            user.phone ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Phone size={16} /> {user.phone}
              </p>
            ) : null
          }
        />

        <Link to="/alumni/edit-profile" className="block max-w-xs">
          <PrimaryButton>Edit Profile</PrimaryButton>
        </Link>
        </div>
      </div>
    </PageTransition>
  )
}

function InfoCard({
  icon,
  title,
  lines,
  extra,
}: {
  icon: ReactNode
  title: string
  lines: string[]
  extra?: ReactNode
}) {
  return (
    <div className="card-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-bold text-[var(--text)]">{title}</h3>
      </div>
      {lines.map((line) => (
        <p key={line} className="text-sm text-[var(--text-muted)]">
          {line}
        </p>
      ))}
      {extra}
    </div>
  )
}

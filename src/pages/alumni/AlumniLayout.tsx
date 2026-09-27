import { Outlet } from 'react-router-dom'
import { Briefcase, Calendar, FileText, User } from 'lucide-react'
import { PortalFrame } from '../../components/PortalFrame'

const alumniNav = [
  { to: '/alumni/events', label: 'Events', icon: Calendar, end: true },
  { to: '/alumni/documents', label: 'Documents', icon: FileText },
  { to: '/alumni/experiences', label: 'Experiences', icon: Briefcase },
  { to: '/alumni/profile', label: 'Profile', icon: User },
]

export function AlumniLayout() {
  return (
    <PortalFrame variant="alumni" title="Alumni" items={alumniNav} signOutTo="/login/alumni">
      <Outlet />
    </PortalFrame>
  )
}

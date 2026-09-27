import { Outlet } from 'react-router-dom'
import { Bell, CalendarDays, FileText, Settings } from 'lucide-react'
import { PortalFrame } from '../../components/PortalFrame'

const ssdNav = [
  { to: '/ssd/requests', label: 'Requests', icon: FileText, end: true },
  { to: '/ssd/events', label: 'Events', icon: CalendarDays },
  { to: '/ssd/alerts', label: 'Alerts', icon: Bell },
  { to: '/ssd/settings', label: 'Settings', icon: Settings },
]

export function SsdLayout() {
  return (
    <PortalFrame variant="staff" title="Staff portal" items={ssdNav} signOutTo="/login/ssd">
      <Outlet />
    </PortalFrame>
  )
}

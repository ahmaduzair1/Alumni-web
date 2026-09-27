import { Outlet } from 'react-router-dom'
import { Calendar, LayoutDashboard, MessageCircle, Settings, Users } from 'lucide-react'
import { PortalFrame } from '../../components/PortalFrame'

const deptNav = [
  { to: '/department/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/department/alumni', label: 'Alumni', icon: Users },
  { to: '/department/events', label: 'Events', icon: Calendar },
  { to: '/department/communication', label: 'Communication', icon: MessageCircle },
  { to: '/department/settings', label: 'Settings', icon: Settings },
]

export function DepartmentLayout() {
  return (
    <PortalFrame variant="staff" title="Staff portal" items={deptNav} signOutTo="/login/dept">
      <Outlet />
    </PortalFrame>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { FolderOpen, LayoutDashboard, ListTodo, LogOut, User, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/common/NotificationBell'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/team', label: 'Team Members', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-surface-50 lg:flex">
      {/* UI polish: sidebar uses a softer surface, clearer brand block, and consistent navigation spacing. */}
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 bg-white/95 border-r border-surface-200/80 flex lg:flex-col shadow-card lg:shadow-none backdrop-blur">
        <div className="hidden lg:flex items-center gap-3 px-6 h-20 border-b border-surface-100">
          <div>
            <span className="font-display font-700 text-surface-900 text-lg leading-none">TaskFlow</span>
            <p className="text-xs text-surface-400 mt-1">Team task manager</p>
          </div>
        </div>
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-2 lg:p-5 gap-1.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block mt-auto p-5 border-t border-surface-100">
          <div className="rounded-xl bg-surface-50 border border-surface-100 p-3 mb-3">
            <div className="text-sm font-semibold text-surface-900 truncate">{user?.fullName || 'Workspace user'}</div>
            <div className="text-xs text-surface-400 mt-1 truncate">{user?.email}</div>
          </div>
          <button onClick={logout} className="nav-link w-full">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="lg:pl-72 flex-1 min-w-0">
        {/* UI polish: topbar now has more breathing room and stronger account hierarchy on all screen sizes. */}
        <header className="h-[4.5rem] bg-white/85 border-b border-surface-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
          <div>
            <p className="text-base font-semibold text-surface-900">{user?.fullName || 'Workspace'}</p>
            <p className="text-xs text-surface-400 mt-0.5 capitalize">{user?.role || 'member'}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={logout} className="btn-secondary lg:hidden">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

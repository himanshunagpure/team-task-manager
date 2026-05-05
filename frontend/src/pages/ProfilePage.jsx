import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/common/Badges'
import { Shield, Mail, Clock, User } from 'lucide-react'

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()

  const fields = [
    { icon: User, label: 'Full Name', value: user?.fullName || '—' },
    { icon: Mail, label: 'Email Address', value: user?.email || '—' },
    { icon: Shield, label: 'Role', value: user?.role || 'member' },
    { icon: Clock, label: 'Last Login', value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'This session' },
  ]

  return (
    <div className="space-y-7 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-surface-500 text-sm mt-0.5">Your account details and settings</p>
      </div>

      {/* UI polish: profile details now have more balanced spacing and stronger identity hierarchy. */}
      <div className="card p-6 sm:p-7">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-surface-100">
          <div className="relative">
            <Avatar name={user?.fullName || user?.email} size="lg" />
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <Shield size={10} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-display font-700 text-surface-900 leading-tight">{user?.fullName || 'User'}</h2>
            <p className="text-surface-400 text-sm">{user?.email}</p>
            <span className={`badge mt-2 ${isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-600'}`}>
              {user?.role || 'member'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3 border-b border-surface-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-surface-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-surface-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-surface-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account note */}
      <div className="card p-4 bg-brand-50 border-brand-100">
        <p className="text-sm text-brand-700">
          <strong className="font-semibold">Account settings from that side</strong> 
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/dashboard.api'
import { SkeletonTable } from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import { Avatar } from '../components/common/Badges'
import toast from 'react-hot-toast'
import { Users, Search } from 'lucide-react'

export default function TeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dashboardApi.getTeamMembers()
      .then(({ data }) => setMembers(data.members || data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m =>
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="text-surface-500 text-sm mt-0.5">{members.length} members in your workspace</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={search ? 'No members found' : 'No team members'}
            description={search ? 'Try a different search term.' : 'Your workspace has no members yet.'}
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3 hidden md:table-cell">Tasks</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3 hidden lg:table-cell">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(member => (
                <tr key={member._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.fullName || member.email} />
                      <div>
                        <p className="text-sm font-medium text-surface-900">{member.fullName || 'Unknown'}</p>
                        <p className="text-xs text-surface-400 sm:hidden">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-surface-500">{member.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${member.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-600'}`}>
                      {member.role || 'member'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-surface-600">{member.taskCount ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-surface-400">
                      {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const priorityClasses = {
  low: 'bg-surface-100 text-surface-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

export function PriorityBadge({ priority = 'medium' }) {
  return <span className={`badge ${priorityClasses[priority] || priorityClasses.medium}`}>{priority}</span>
}

export function StatusBadge({ status = 'todo' }) {
  const cls = status === 'done' ? 'bg-emerald-100 text-emerald-700' : status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-surface-100 text-surface-600'
  return <span className={`badge ${cls}`}>{statusLabels[status] || status}</span>
}

export function Avatar({ name = 'User', size = 'md' }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-16 h-16 text-xl' }
  const initials = String(name).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className={`${sizes[size] || sizes.md} rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center flex-shrink-0`}>{initials || 'U'}</div>
}

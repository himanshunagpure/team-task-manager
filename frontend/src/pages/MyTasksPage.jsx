import { useState, useEffect } from 'react'
import { taskApi } from '../api/task.api'
import { SkeletonTable } from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import { PriorityBadge } from '../components/common/Badges'
import toast from 'react-hot-toast'
import { CheckSquare, Calendar } from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    taskApi.getMyTasks()
      .then(({ data }) => setTasks(data.tasks || data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await taskApi.updateStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => t._id === taskId ? (data.task || data) : t))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = tasks.filter(t => {
    if (filter === 'todo') return t.status === 'todo'
    if (filter === 'inprogress') return t.status === 'in-progress'
    if (filter === 'done') return t.status === 'done'
    if (filter === 'overdue') return t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done'
    return true
  })

  const tabs = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { key: 'inprogress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { key: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
    { key: 'overdue', label: 'Overdue', count: tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done').length },
  ]

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="text-surface-500 text-sm mt-0.5">All tasks assigned to you across projects</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs ${filter === tab.key ? 'text-brand-600' : 'text-surface-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="You're all caught up! No tasks match this filter."
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Task</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3 hidden sm:table-cell">Project</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3 hidden md:table-cell">Due Date</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(task => {
                const overdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done'
                return (
                  <tr key={task._id} className={`hover:bg-surface-50 transition-colors ${overdue ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-surface-800 line-clamp-1">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-surface-400 line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-surface-500">
                        {typeof task.project === 'object' ? (task.project.projectName || task.project.name) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {task.dueDate ? (
                        <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : 'text-surface-500'}`}>
                          <Calendar size={11} />
                          {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-xs text-surface-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        className="text-xs border border-surface-200 rounded px-2 py-1 text-surface-600 bg-white cursor-pointer outline-none"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

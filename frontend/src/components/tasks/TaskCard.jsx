import { Trash2 } from 'lucide-react'
import { taskApi } from '../../api/task.api'
import { PriorityBadge, StatusBadge, Avatar } from '../common/Badges'
import toast from 'react-hot-toast'

export default function TaskCard({ task, onUpdated, onDeleted }) {
  const handleStatus = async (status) => {
    try {
      const { data } = await taskApi.updateStatus(task._id, status)
      onUpdated(data)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskApi.delete(task._id)
      onDeleted(task._id)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-900">{task.title}</p>
        {task.description && <p className="text-sm text-surface-500 line-clamp-1 mt-0.5">{task.description}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {task.assignee?.fullName && (
            <span className="text-xs text-surface-500 inline-flex items-center gap-1">
              <Avatar name={task.assignee.fullName} size="sm" /> {task.assignee.fullName}
            </span>
          )}
        </div>
      </div>
      <select value={task.status} onChange={(event) => handleStatus(event.target.value)} className="input sm:w-36">
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <button onClick={handleDelete} className="btn-ghost text-red-500" aria-label="Delete task">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

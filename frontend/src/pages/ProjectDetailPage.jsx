import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi } from '../api/project.api'
import { taskApi } from '../api/task.api'
import { useAuth } from '../context/AuthContext'
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskForm from '../components/tasks/CreateTaskForm'
import AddMemberForm from '../components/projects/AddMemberForm'
import { Avatar } from '../components/common/Badges'
import toast from 'react-hot-toast'
import {
  Plus, Users, Kanban, ArrowLeft, CheckSquare,
  UserPlus, UserMinus, Filter
} from 'lucide-react'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(true)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [filters, setFilters] = useState({ status: '', priority: '' })

  useEffect(() => {
    projectApi.getById(id)
      .then(({ data }) => setProject(data.project || data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))

    taskApi.getByProject(id)
      .then(({ data }) => setTasks(data.tasks || data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setTaskLoading(false))
  }, [id])

  const handleTaskCreated = (task) => {
    setTasks(prev => [task, ...prev])
    setCreateTaskOpen(false)
    toast.success('Task created!')
  }

  const handleTaskUpdated = (updated) => {
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))
  }

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId))
    toast.success('Task deleted')
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return
    try {
      const result = await projectApi.removeMember(id, memberId)
      setProject(result.data)
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false
    if (filters.priority && t.priority !== filters.priority) return false
    return true
  })

  const isProjectAdmin = project?.members?.some(member => member._id === user?._id && member.role === 'admin')

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <SkeletonCard />
      <SkeletonTable />
    </div>
  )

  if (!project) return (
    <div className="card p-12 text-center text-surface-500">Project not found.</div>
  )

  return (
    <div className="space-y-7 animate-fade-in">
      {/* UI polish: project detail header now has clearer spacing between navigation, title, and actions. */}
      <div>
        <Link to="/projects" className="btn-ghost px-0 text-surface-500 mb-3 inline-flex">
          <ArrowLeft size={15} /> Back to Projects
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="text-surface-500 text-sm mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/projects/${id}/kanban`} className="btn-secondary">
              <Kanban size={15} /> Kanban
            </Link>
            {isProjectAdmin && (
              <button onClick={() => setCreateTaskOpen(true)} className="btn-primary">
                <Plus size={15} /> Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="card p-3.5 flex items-center gap-3 flex-wrap">
            <Filter size={14} className="text-surface-400" />
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="text-sm border-0 bg-transparent text-surface-600 cursor-pointer outline-none"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div className="w-px h-4 bg-surface-200" />
            <select
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="text-sm border-0 bg-transparent text-surface-600 cursor-pointer outline-none"
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span className="ml-auto text-xs text-surface-400">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
          </div>

          {taskLoading ? (
            <SkeletonTable rows={4} />
          ) : filteredTasks.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={CheckSquare}
                title="No tasks found"
                description={isProjectAdmin ? 'Add your first task to get this project moving.' : 'No tasks match your filters.'}
                action={isProjectAdmin && (
                  <button onClick={() => setCreateTaskOpen(true)} className="btn-primary">
                    <Plus size={15} /> Add Task
                  </button>
                )}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdated={handleTaskUpdated}
                  onDeleted={() => handleTaskDeleted(task._id)}
                  projectMembers={project.members}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Members */}
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-surface-800 text-sm flex items-center gap-2">
                <Users size={14} /> Members ({project.members?.length || 0})
              </h3>
              {isProjectAdmin && (
                <button onClick={() => setAddMemberOpen(true)} className="btn-ghost p-1.5">
                  <UserPlus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {project.members?.map(member => {
                const m = typeof member === 'object' ? member : { _id: member }
                return (
                  <div key={m._id} className="flex items-center gap-2.5">
                    <Avatar name={m.fullName || m.email || 'U'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-surface-800 truncate">{m.fullName || m.email || 'Unknown'}</p>
                      <p className="text-xs text-surface-400 truncate">{m.role || 'member'}</p>
                    </div>
                    {isProjectAdmin && m._id !== user?._id && (
                      <button
                        onClick={() => handleRemoveMember(m._id)}
                        className="btn-ghost p-1 text-surface-300 hover:text-red-500"
                      >
                        <UserMinus size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="card p-4 sm:p-5 space-y-3">
            <h3 className="font-semibold text-surface-800 text-sm">Project Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Status</span>
                <span className={`badge ${project.archived ? 'bg-surface-100 text-surface-500' : 'bg-emerald-100 text-emerald-700'}`}>
                  {project.archived ? 'Archived' : 'Active'}
                </span>
              </div>
              {project.deadline && (
                <div className="flex justify-between">
                  <span className="text-surface-400">Deadline</span>
                  <span className="font-medium text-surface-700">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-400">Tasks</span>
                <span className="font-medium text-surface-700">{tasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} title="Create Task">
        <CreateTaskForm projectId={id} members={project.members} onSuccess={handleTaskCreated} onCancel={() => setCreateTaskOpen(false)} />
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <AddMemberForm projectId={id} onSuccess={(m) => {
          setProject(prev => ({ ...prev, members: [...(prev.members || []), m] }))
          setAddMemberOpen(false)
          toast.success('Member added!')
        }} onCancel={() => setAddMemberOpen(false)} />
      </Modal>
    </div>
  )
}

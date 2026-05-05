import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  DndContext, DragOverlay, closestCorners,
  useSensor, useSensors, PointerSensor
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { taskApi } from '../api/task.api'
import { projectApi } from '../api/project.api'
import { PriorityBadge, Avatar } from '../components/common/Badges'
import { SkeletonCard } from '../components/common/Skeleton'
import toast from 'react-hot-toast'
import { ArrowLeft, GripVertical, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-surface-200', dot: 'bg-surface-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100', dot: 'bg-blue-500' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100', dot: 'bg-emerald-500' },
]

function SortableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="card p-4 cursor-grab active:cursor-grabbing group">
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 text-surface-300 hover:text-surface-500 transition-colors">
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-800 line-clamp-2 mb-2">{task.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-xs text-surface-400 flex items-center gap-1">
                <Calendar size={10} />
                {format(parseISO(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
          {task.assignee && typeof task.assignee === 'object' && (
            <div className="flex items-center gap-1.5 mt-2">
              <Avatar name={task.assignee.fullName} size="sm" />
              <span className="text-xs text-surface-400">{task.assignee.fullName?.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    Promise.all([projectApi.getById(id), taskApi.getByProject(id)])
      .then(([{ data: p }, { data: t }]) => {
        setProject(p.project || p)
        setTasks(t.tasks || t || [])
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t._id === active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const taskId = active.id
    const overId = over.id

    // Check if dropped on a column header
    const targetColumn = COLUMNS.find(c => c.id === overId)
    const targetTask = tasks.find(t => t._id === overId)
    const newStatus = targetColumn?.id || targetTask?.status

    if (!newStatus) return

    const task = tasks.find(t => t._id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))

    try {
      await taskApi.updateStatus(taskId, newStatus)
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`)
    } catch (err) {
      // Rollback
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: task.status } : t))
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* UI polish: kanban header uses flexible spacing so actions never crowd the title. */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to={`/projects/${id}`} className="btn-ghost px-0 text-surface-500 mb-2 inline-flex">
            <ArrowLeft size={15} /> Back to Project
          </Link>
          <h1 className="page-title">{project?.name || 'Kanban Board'}</h1>
        </div>
        <span className="badge bg-brand-100 text-brand-700">{tasks.length} tasks</span>
      </div>

      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(c => <SkeletonCard key={c.id} />)}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {COLUMNS.map(col => {
              const colTasks = getTasksByStatus(col.id)
              return (
                <div
                  key={col.id}
                  id={col.id}
                  className={`rounded-xl p-3.5 ${col.color} min-h-[300px]`}
                >
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-surface-700">{col.label}</span>
                    <span className="ml-auto text-xs text-surface-500 font-medium bg-white/60 px-1.5 py-0.5 rounded-md">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Droppable area */}
                  <SortableContext
                    id={col.id}
                    items={colTasks.map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 kanban-col">
                      {colTasks.map(task => (
                        <SortableTask key={task._id} task={task} />
                      ))}
                    </div>
                  </SortableContext>

                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-surface-400 text-xs">
                      Drop tasks here
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeTask && (
              <div className="card p-3.5 shadow-modal rotate-1 scale-105">
                <p className="text-sm font-medium text-surface-800">{activeTask.title}</p>
                <div className="mt-2"><PriorityBadge priority={activeTask.priority} /></div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

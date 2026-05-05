import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/project.api'
import { useAuth } from '../context/AuthContext'
import { SkeletonCard } from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import CreateProjectForm from '../components/projects/CreateProjectForm'
import AddMemberForm from '../components/projects/AddMemberForm'
import toast from 'react-hot-toast'
import { FolderOpen, Plus, Users, Calendar, ChevronRight, Kanban } from 'lucide-react'
import { format } from 'date-fns'

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteProject, setInviteProject] = useState(null)

  const fetchProjects = () => {
    setLoading(true)
    projectApi.getAll()
      .then(({ data }) => setProjects(data.projects || data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(fetchProjects, [])

  const handleCreated = (project) => {
    setProjects(prev => [project, ...prev])
    setCreateOpen(false)
    toast.success('Project created!')
  }

  const handleInviteOpen = (project) => {
    setInviteProject(project)
    setInviteOpen(true)
  }

  const handleInviteSuccess = (email) => {
    setInviteOpen(false)
    setInviteProject(null)
    toast.success(`Invitation sent to ${email}`)
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-surface-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project and start organizing your team's work."
            action={(
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={15} /> Create Project
              </button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUserId={user?._id}
              onInvite={() => handleInviteOpen(project)}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Project">
        <CreateProjectForm onSuccess={handleCreated} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title={inviteProject ? `Invite to ${inviteProject.name}` : 'Invite Member'}>
        {inviteProject && (
          <AddMemberForm
            projectId={inviteProject._id}
            onSuccess={({ email }) => handleInviteSuccess(email)}
            onCancel={() => setInviteOpen(false)}
          />
        )}
      </Modal>
    </div>
  )
}

function ProjectCard({ project, currentUserId, onInvite }) {
  const memberCount = project.members?.length || 0
  const progress = project.progress || 0
  const role = project.members?.find(member => member._id === currentUserId)?.role || 'member'

  const colors = ['bg-brand-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500']
  const color = colors[project.name?.charCodeAt(0) % colors.length] || colors[0]

  return (
    <div className="card-hover group overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* UI polish: project cards use roomier spacing and clearer metadata for better scanning. */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg shadow-card`}>
            {project.name?.[0]?.toUpperCase()}
          </div>
          <span className={`badge ${project.archived ? 'bg-surface-100 text-surface-400' : 'bg-emerald-100 text-emerald-700'}`}>
            {project.archived ? 'Archived' : role}
          </span>
        </div>

        <h3 className="font-semibold text-surface-900 mb-1.5 group-hover:text-brand-600 transition-colors">{project.name}</h3>
        <p className="text-sm text-surface-500 line-clamp-2 mb-4">{project.description || 'No description provided.'}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-surface-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-surface-400">
          <span className="flex items-center gap-1"><Users size={12} /> {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {format(new Date(project.deadline), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-surface-100 flex items-center justify-between gap-3">
        <Link
          to={`/projects/${project._id}/kanban`}
          className="text-xs text-surface-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <Kanban size={12} /> Kanban
        </Link>
        {role === 'admin' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onInvite(project)
            }}
            className="text-xs text-brand-600 hover:text-brand-500 flex items-center gap-1 transition-colors"
          >
            Invite
          </button>
        )}
        <Link
          to={`/projects/${project._id}`}
          className="text-xs font-medium text-brand-600 flex items-center gap-1 hover:gap-2 transition-all"
        >
          View details <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}

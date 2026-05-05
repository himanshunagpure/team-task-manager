import apiClient, { unwrap } from './apiClient'

export const normalizeMember = (member) => {
  const user = member?.user || member
  return {
    ...(typeof user === 'object' ? user : { _id: user }),
    role: member?.role || user?.role || 'member',
    joinedAt: member?.joinedAt,
  }
}

export const normalizeProject = (project) => ({
  ...project,
  name: project?.projectName || project?.name || 'Untitled project',
  projectName: project?.projectName || project?.name || 'Untitled project',
  archived: project?.status === 'archived' || Boolean(project?.archived),
  members: (project?.members || []).map(normalizeMember),
})

export const projectApi = {
  async getAll() {
    const response = await apiClient.get('/projects/my-projects')
    const data = unwrap(response)
    const projects = Array.isArray(data) ? data : data?.projects || []
    return { data: projects.map(normalizeProject) }
  },
  async create(payload) {
    const body = { projectName: payload.name || payload.projectName, description: payload.description }
    const response = await apiClient.post('/projects/create', body)
    return { data: normalizeProject(unwrap(response)) }
  },
  async getById(id) {
    const { data: projects } = await this.getAll()
    const project = projects.find((item) => item._id === id)
    if (!project) throw new Error('Project not found')
    return { data: project }
  },
  async invite(projectId, payload) {
    const response = await apiClient.post(`/projects/${projectId}/invite`, payload)
    return { data: unwrap(response) }
  },
  async addMember(projectId, payload) {
    return this.invite(projectId, payload)
  },
  async removeMember(projectId, memberId) {
    const response = await apiClient.delete(`/projects/${projectId}/members/${memberId}`)
    return { data: normalizeProject(unwrap(response)) }
  },
}

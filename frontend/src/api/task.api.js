import apiClient, { unwrap } from './apiClient'

export const normalizeTask = (task) => ({
  ...task,
  assignee: task?.assignedTo,
  projectName: task?.project?.projectName || task?.project?.name,
})

export const taskApi = {
  async getMyTasks() {
    const response = await apiClient.get('/tasks/my-tasks')
    const data = unwrap(response)
    const tasks = Array.isArray(data) ? data : data?.tasks || []
    return { data: tasks.map(normalizeTask) }
  },
  async getByProject(projectId) {
    const { data } = await this.getMyTasks()
    return { data: data.filter((task) => (task.project?._id || task.project) === projectId) }
  },
  async create(projectId, payload) {
    const response = await apiClient.post(`/tasks/project/${projectId}`, payload)
    return { data: normalizeTask(unwrap(response)) }
  },
  async update(taskId, payload) {
    const response = await apiClient.put(`/tasks/${taskId}`, payload)
    return { data: normalizeTask(unwrap(response)) }
  },
  async updateStatus(taskId, status) {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, { status })
    return { data: normalizeTask(unwrap(response)) }
  },
  async delete(taskId) {
    const response = await apiClient.delete(`/tasks/${taskId}`)
    return { data: unwrap(response) }
  },
}

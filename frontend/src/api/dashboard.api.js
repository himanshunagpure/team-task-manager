import apiClient, { unwrap } from './apiClient'
import { projectApi } from './project.api'

const statusCount = (items, status) => items.find((item) => item._id === status)?.count || 0

export const dashboardApi = {
  async getStats() {
    const response = await apiClient.get('/dashboard/stats')
    const data = unwrap(response)
    const tasksByStatus = data.tasksByStatus || []
    const tasksPerUser = (data.tasksPerUser || []).map((item) => ({
      name: String(item._id).slice(-6),
      tasks: item.count,
    }))

    return {
      data: {
        total: data.totalTasks || 0,
        completed: statusCount(tasksByStatus, 'done'),
        inProgress: statusCount(tasksByStatus, 'in-progress'),
        overdue: data.overdueTasks || 0,
        tasksPerUser,
      },
    }
  },
  async getTeamMembers() {
    const { data: projects } = await projectApi.getAll()
    const members = new Map()
    projects.forEach((project) => {
      project.members?.forEach((member) => {
        if (member?._id) members.set(member._id, member)
      })
    })
    return { data: Array.from(members.values()) }
  },
}

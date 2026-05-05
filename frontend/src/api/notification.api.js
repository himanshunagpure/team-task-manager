import apiClient, { unwrap } from './apiClient'

export const notificationApi = {
  async getNotifications() {
    const response = await apiClient.get('/notifications')
    return unwrap(response)
  },

  async markAsRead(notificationId) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`)
    return unwrap(response)
  },

  async respondToInvitation(notificationId, action) {
    const response = await apiClient.post(`/notifications/${notificationId}/respond`, { action })
    return unwrap(response)
  },
}

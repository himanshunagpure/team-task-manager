import apiClient, { unwrap } from './apiClient'

export const invitationApi = {
  async getInvite(token) {
    const response = await apiClient.get(`/invites/${token}`)
    return unwrap(response)
  },
  async accept(token) {
    const response = await apiClient.post(`/invites/accept`, { token })
    return unwrap(response)
  },
}

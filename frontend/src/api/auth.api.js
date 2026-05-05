import apiClient, { unwrap } from './apiClient'

export const authApi = {
  async signup(payload) {
    const response = await apiClient.post('/auth/register', payload)
    return unwrap(response)
  },
  async verify(payload) {
    const tempToken = localStorage.getItem('tempToken')
    const response = await apiClient.post('/auth/verify', payload, {
      headers: tempToken ? { Authorization: `Bearer ${tempToken}` } : {},
    })
    return unwrap(response)
  },
  async login(payload) {
    const response = await apiClient.post('/auth/login', payload)
    return unwrap(response)
  },
  async me() {
    const response = await apiClient.get('/auth/me')
    return unwrap(response)
  },
}

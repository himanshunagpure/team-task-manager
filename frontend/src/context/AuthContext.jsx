import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth.api'

const AuthContext = createContext(null)

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false)
      return
    }

    authApi.me()
      .then((currentUser) => {
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persistSession = ({ token, user: nextUser }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user && localStorage.getItem('token')),
    isAdmin: user?.role === 'admin' || user?.role === 'owner' || user?.role === 'superadmin',
    async login(payload) {
      const data = await authApi.login(payload)
      persistSession(data)
      return data
    },
    async signup(payload) {
      const data = await authApi.signup(payload)
      // Store token temporarily for verification
      localStorage.setItem('tempToken', data.token)
      return data
    },
    async verify(payload) {
      const data = await authApi.verify(payload)
      // After verification, persist the session
      const token = localStorage.getItem('tempToken')
      if (token) {
        localStorage.setItem('token', token)
        localStorage.removeItem('tempToken')
        // Fetch user data
        const userData = await authApi.me()
        persistSession({ token, user: userData })
      }
      return data
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      window.location.assign('/login')
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

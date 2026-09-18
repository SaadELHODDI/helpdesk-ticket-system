import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    setUser(null)
    setLoading(false)
    return null
  }

  try {
    const response = await api.get('/auth/me/')
    setUser(response.data)
    return response.data
  } catch (error) {
    console.error('Could not load current user:', error)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    return null
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isITStaff: Boolean(user?.is_it_staff),
        loadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.'
    )
  }

  return context
}
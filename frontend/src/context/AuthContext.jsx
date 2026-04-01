import { createContext, useContext, useMemo, useState } from 'react'
import { api, getAccessToken, setAccessToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const value = useMemo(
    () => ({
      user,
      loading,
      token: getAccessToken(),
      async login(payload) {
        setLoading(true)
        try {
          const response = await api.login(payload)
          setAccessToken(response.accessToken)
          setUser(response.user)
          return response
        } finally {
          setLoading(false)
        }
      },
      async register(payload) {
        setLoading(true)
        try {
          const response = await api.register(payload)
          setAccessToken(response.accessToken)
          setUser(response.user)
          return response
        } finally {
          setLoading(false)
        }
      },
      async loadMe() {
        if (!getAccessToken()) return null
        try {
          const response = await api.me()
          setUser(response.user)
          return response.user
        } catch {
          return null
        }
      },
      async logout() {
        await api.logout()
        setAccessToken(null)
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

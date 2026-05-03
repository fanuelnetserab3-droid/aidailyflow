import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ loggedIn: true })
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const res = await axios.post('/api/auth/login', params)
    const t = res.data.access_token
    localStorage.setItem('token', t)
    if (res.data.user_id !== undefined) {
      localStorage.setItem('user_id', String(res.data.user_id))
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser({ loggedIn: true })
    setLoginSuccess(true)
    setTimeout(() => setLoginSuccess(false), 2000) // Reset after animation
  }

  const register = async (email, password) => {
    const res = await axios.post('/api/auth/register', { email, password })
    const t = res.data.access_token
    localStorage.setItem('token', t)
    if (res.data.user_id !== undefined) {
      localStorage.setItem('user_id', String(res.data.user_id))
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser({ loggedIn: true })
    setLoginSuccess(true)
    setTimeout(() => setLoginSuccess(false), 2000)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

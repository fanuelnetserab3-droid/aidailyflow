import React from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'
import Idag from './pages/Idag'
import Flow from './pages/Flow'
import Tankar from './pages/Tankar'
import Listor from './pages/Listor'
import Vanor from './pages/Vanor'
import Profil from './pages/Profil'
import Onboarding from './pages/Onboarding'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0A0A0F' }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#14B8A6',
            animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function PrivateRouteWrapper({ children }) {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true)

  React.useEffect(() => {
    if (user && !loading) {
      const userId = localStorage.getItem('user_id')
      const hasCompleted = localStorage.getItem('onboarding_complete') === 'true'

      if (hasCompleted) {
        setShowOnboarding(false)
        setCheckingOnboarding(false)
      } else {
        // Check if profile has name (indicating they completed onboarding before this feature)
        axios.get(`/api/profile/${userId}`).then(res => {
          const profile = res.data
          if (profile?.name) {
            // Already has a name, so completed onboarding in the past
            localStorage.setItem('onboarding_complete', 'true')
            setShowOnboarding(false)
          } else {
            // No name, show onboarding
            setShowOnboarding(true)
          }
        }).catch(() => {
          // Profile fetch failed, show onboarding
          setShowOnboarding(true)
        }).finally(() => {
          setCheckingOnboarding(false)
        })
      }
    }
  }, [user, loading])

  if (loading || checkingOnboarding) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />

  if (showOnboarding) {
    return <Onboarding onClose={() => setShowOnboarding(false)} />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/idag" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route element={<PrivateRouteWrapper><Layout /></PrivateRouteWrapper>}>
            <Route path="/idag" element={<Idag />} />
            <Route path="/flow" element={<Flow />} />
            <Route path="/tankar" element={<Tankar />} />
            <Route path="/listor" element={<Listor />} />
            <Route path="/vanor" element={<Vanor />} />
            <Route path="/profil" element={<Profil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import axios from 'axios'

const NAV = [
  { to: '/idag', label: 'Schema', icon: CalIcon },
  { to: '/flow', label: 'Flow', icon: FlowIcon },
  { to: '/tankar', label: 'Tankar', icon: ChatIcon },
  { to: '/listor', label: 'Listor', icon: ListIcon },
  { to: '/vanor', label: 'Vanor', icon: FireIcon },
  { to: '/profil', label: 'Profil', icon: ProfilIcon },
]

function CalIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
}
function FlowIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
}
function ChatIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
}
function ListIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
}
function FireIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></svg>
}
function ProfilIcon({ active }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}


export default function Layout() {
  const { logout, loginSuccess } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [prevIndex, setPrevIndex] = useState(0)
  const [subStatus, setSubStatus] = useState(null)

  useEffect(() => {
    axios.get('/api/subscription/status').then(res => setSubStatus(res.data)).catch(() => {})
  }, [])

  const navOrder = ['/idag', '/flow', '/tankar', '/listor', '/vanor', '/profil']
  const currentIndex = navOrder.indexOf(location.pathname) !== -1 ? navOrder.indexOf(location.pathname) : 0
  const direction = currentIndex > prevIndex ? 1 : -1

  useEffect(() => {
    setPrevIndex(currentIndex)
  }, [currentIndex])

  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      filter: 'blur(4px)',
    }),
    in: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    out: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      filter: 'blur(4px)',
    }),
  }

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.35,
  }

  const handleLogout = async () => {
    try { await logout() } catch {}
    navigate('/')
  }

  return (
    <>
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            >
              <div style={{ fontSize: 48, color: '#14B8A6', fontWeight: 900 }}>Välkommen</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial banner */}
      {subStatus && !subStatus.is_subscribed && !subStatus.trial_expired && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px))',
            left: 0, right: 0,
            zIndex: 150,
            background: 'linear-gradient(90deg, rgba(0,212,170,0.15), rgba(167,139,250,0.15))',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,212,170,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '7px 16px',
          }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.3 }}>
            {subStatus.days_left != null ? `${subStatus.days_left} dagar kvar av din gratis trial` : 'Gratis trial aktiv'}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                const res = await axios.post('/api/subscription/create-checkout')
                window.location.href = res.data.url
              } catch {}
            }}
            style={{ background: 'linear-gradient(90deg,#00d4aa,#a78bfa)', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 800, color: '#0f172a', cursor: 'pointer', letterSpacing: 0.3 }}>
            ⚡ Uppgradera
          </motion.button>
        </motion.div>
      )}

      <video autoPlay loop muted playsInline
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', opacity: 1, filter: 'brightness(0.38) saturate(1.2)' }}>
        <source src="/waves.mp4" type="video/mp4" />
      </video>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
        style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', right: 12, zIndex: 200, background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logga ut
      </motion.button>

      <div style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', right: 110, zIndex: 200 }}>
        <NotificationBell />
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.main
            key={location.pathname}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
            style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 36px)' }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>

        <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(0,212,170,0.15)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 100 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.88 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0 13px', gap: 4, color: isActive ? '#00d4aa' : '#334155', transition: 'color 0.15s', position: 'relative' }}>
                  {isActive && (
                    <motion.div layoutId="nav-pill"
                      style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 99, background: 'linear-gradient(90deg,#00d4aa,#a78bfa)', boxShadow: '0 0 10px rgba(0,212,170,0.6)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon active={isActive} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em' }}>{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
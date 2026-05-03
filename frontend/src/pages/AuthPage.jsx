import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: (i * 41 + 7) % 100, y: (i * 53 + 11) % 100,
    s: ((i * 13) % 3) * 0.6 + 0.4, d: ((i * 7) % 30) / 10,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {stars.map((s, i) => (
        <motion.div key={i}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: 999, background: "#fff" }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 2.4 + s.d, repeat: Infinity, delay: s.d }}
        />
      ))}
    </div>
  );
}

function CornerBrackets() {
  const s = { position: "absolute", width: 14, height: 14, borderColor: "rgba(0,212,170,0.4)" };
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: "1px solid", borderLeft: "1px solid" }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: "1px solid", borderRight: "1px solid" }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: "1px solid", borderLeft: "1px solid" }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: "1px solid", borderRight: "1px solid" }} />
    </>
  );
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) await login(email, password)
      else await register(email, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Något gick fel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 10%, #0d1a2e 0%, #080810 50%, #050508 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
      fontFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
      color: '#f1f5f9',
    }}>
      <Stars />

      {/* Orbs */}
      <div style={{ position: "absolute", top: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.12, backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.5) 0.6px, transparent 1px)", backgroundSize: "24px 24px", zIndex: 1 }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}
      >
        <div style={{ position: 'relative', background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 20, padding: '32px 28px 28px', boxShadow: '0 0 60px rgba(0,212,170,0.06), 0 24px 48px rgba(0,0,0,0.5)' }}>
          <CornerBrackets />

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: 2.2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 24 }}>
            <span>AiDailyFlow // v2.0</span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: '#00d4aa' }}>● LIVE</motion.span>
          </div>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, letterSpacing: '0.06em' }}
              transition={{ duration: 1.2, delay: 0.2 }}
              style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #ffffff 0%, #00d4aa 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              AiDaily<br />Flow
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginTop: 8 }}>
              Din personliga AI-coach
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,170,0.4), rgba(167,139,250,0.4), transparent)', marginBottom: 24 }} />

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 3, marginBottom: 20, gap: 4 }}>
            {['Logga in', 'Registrera'].map((label, i) => (
              <button key={label} onClick={() => { setIsLogin(i === 0); setError('') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9,
                  background: (i === 0) === isLogin ? 'rgba(0,212,170,0.15)' : 'transparent',
                  border: (i === 0) === isLogin ? '1px solid rgba(0,212,170,0.3)' : '1px solid transparent',
                  color: (i === 0) === isLogin ? '#00d4aa' : 'rgba(255,255,255,0.35)',
                  fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
                  fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>E-post</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="din@email.se"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Lösenord</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Minst 6 tecken"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 12, color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,212,170,0.2)' }}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(0,212,170,0.4)', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '// LADDAR...' : isLogin ? '▶  Logga in' : '▶  Skapa konto'}
            </motion.button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 9, letterSpacing: 1.8, color: '#334155', textTransform: 'uppercase', textAlign: 'center' }}>
            Powered by Claude AI
          </div>
        </div>
      </motion.div>
    </div>
  )
}
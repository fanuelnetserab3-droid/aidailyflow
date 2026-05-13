import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const FEATURES = [
  'Personliga dagscheman med AI',
  'Obegränsad Flow-analys',
  'Vana-tracking & påminnelser',
  'Mål & milstolpar',
]

export default function Prenumerera() {
  const [plan, setPlan] = useState('yearly') // default till årsplan — bättre konvertering
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/subscription/create-checkout', { plan })
      window.location.href = res.data.url
    } catch (e) {
      setError('Något gick fel. Försök igen.')
      setLoading(false)
    }
  }

  return (
    <>
      <video autoPlay loop muted playsInline
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', filter: 'brightness(0.5) saturate(1.1)' }}>
        <source src="/waves.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(8,8,16,0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: 24,
            padding: '36px 28px',
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>

          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>
            Din gratis period har gått ut
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
            Uppgradera nu för att fortsätta planera din dag och nå dina mål.
          </p>

          {/* Plan-väljare */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {/* Årsplan */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPlan('yearly')}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: 16, cursor: 'pointer',
                background: plan === 'yearly' ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
                border: plan === 'yearly' ? '2px solid #00d4aa' : '2px solid rgba(255,255,255,0.08)',
                color: '#fff', textAlign: 'center', transition: 'all 0.2s', position: 'relative',
              }}
            >
              {/* Badge */}
              <div style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #00d4aa, #a78bfa)',
                borderRadius: 20, padding: '2px 10px',
                fontSize: 10, fontWeight: 700, color: '#000', letterSpacing: 1, whiteSpace: 'nowrap',
              }}>
                SPARA 33%
              </div>
              <div style={{ fontSize: 12, color: plan === 'yearly' ? '#00d4aa' : 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
                Per år
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>799 kr</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>= 66 kr/mån</div>
            </motion.button>

            {/* Månadsplan */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPlan('monthly')}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: 16, cursor: 'pointer',
                background: plan === 'monthly' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.04)',
                border: plan === 'monthly' ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.08)',
                color: '#fff', textAlign: 'center', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 12, color: plan === 'monthly' ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 4, marginTop: 16 }}>
                Per månad
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>99 kr</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Avsluta när som helst</div>
            </motion.button>
          </div>

          {/* Features */}
          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#00d4aa', fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{f}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,212,170,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'rgba(0,212,170,0.4)' : 'linear-gradient(135deg, #00d4aa, #a78bfa)',
              border: 'none',
              borderRadius: 14,
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.03em',
              marginBottom: 10,
            }}
          >
            {loading ? 'Laddar...' : plan === 'yearly' ? '▶  Starta med årsplan — 799 kr' : '▶  Starta månadsplan — 99 kr/mån'}
          </motion.button>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8 }}>
            Säker betalning via Stripe · SSL-krypterad · Avsluta när som helst
          </p>
        </motion.div>
      </div>
    </>
  )
}

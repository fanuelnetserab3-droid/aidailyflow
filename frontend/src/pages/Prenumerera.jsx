import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function Prenumerera() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/subscription/create-checkout')
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
        padding: '0 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(8,8,16,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: 24,
            padding: '40px 32px',
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>

          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>
            Din gratis period har gått ut
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
            Du har provat AiDailyFlow i 7 dagar. Uppgradera nu för att fortsätta planera din dag och nå dina mål.
          </p>

          <div style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 28,
          }}>
            <div style={{ color: '#00d4aa', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              AiDailyFlow Premium
            </div>
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
              99 kr<span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/mån</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Avsluta när som helst</div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            {[
              'Personliga dagscheman med AI',
              'Obegränsad Flow-analys',
              'Vana-tracking & påminnelser',
              'Mål & milstolpar',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#00d4aa', fontSize: 18 }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'rgba(0,212,170,0.4)' : 'linear-gradient(135deg, #00d4aa, #a78bfa)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Laddar...' : 'Uppgradera nu →'}
          </motion.button>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>
            Säker betalning via Stripe · SSL-krypterad
          </p>
        </motion.div>
      </div>
    </>
  )
}

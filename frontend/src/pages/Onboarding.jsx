import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const GOALS = [
  'Hitta jobb',
  'Bygga företag',
  'Lära mig skills',
  'Bättre hälsa',
  'Tjäna pengar',
  'Personlig utveckling'
]

const TIME_OPTIONS = [
  { label: '1-2h', value: '1-2' },
  { label: '3-4h', value: '3-4' },
  { label: '5-6h', value: '5-6' },
  { label: 'Helt fri', value: 'unlimited' }
]

function WelcomeStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', textAlign: 'center', gap: 32 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #00d4aa, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0,212,170,0.4)',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </motion.div>

      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 36,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fff 0%, #00d4aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
            letterSpacing: -0.5,
            fontFamily: 'Georgia, serif',
          }}
        >
          Välkommen till AiDailyFlow
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          Din personliga AI-livscoach
        </motion.p>
      </div>

      <div style={{ marginTop: 20 }} />
    </motion.div>
  )
}

function NameStep({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}
    >
      <div>
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'block',
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            fontFamily: 'Georgia, serif',
          }}
        >
          Vad heter du?
        </motion.label>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Vi vill gärna veta ditt namn
        </motion.p>
      </div>

      <motion.input
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ditt namn..."
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(0,212,170,0.3)',
          borderRadius: 12,
          padding: '14px 16px',
          fontSize: 16,
          color: '#f1f5f9',
          outline: 'none',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
          backdropFilter: 'blur(12px)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(0,212,170,0.6)'
          e.target.style.background = 'rgba(0,212,170,0.08)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(0,212,170,0.3)'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }}
      />
    </motion.div>
  )
}

function GoalStep({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}
    >
      <div>
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'block',
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            fontFamily: 'Georgia, serif',
          }}
        >
          Vad vill du uppnå?
        </motion.label>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Välj en eller flera mål
        </motion.p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {GOALS.map((goal, i) => {
          const isSelected = value.includes(goal)
          return (
            <motion.button
              key={goal}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              onClick={() => {
                if (isSelected) {
                  onChange(value.filter(g => g !== goal))
                } else {
                  onChange([...value, goal])
                }
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: isSelected ? '2px solid #00d4aa' : '1px solid rgba(255,255,255,0.2)',
                background: isSelected ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.05)',
                color: isSelected ? '#00d4aa' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected ? '0 0 12px rgba(0,212,170,0.3)' : 'none',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSelected && <span style={{ marginRight: 6 }}>✓ </span>}
              {goal}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

function TimeStep({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}
    >
      <div>
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'block',
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            fontFamily: 'Georgia, serif',
          }}
        >
          Hur mycket tid har du per dag?
        </motion.label>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Vi anpassar ditt program därefter
        </motion.p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TIME_OPTIONS.map((option, i) => {
          const isSelected = value === option.value
          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              onClick={() => onChange(option.value)}
              style={{
                padding: '16px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                border: isSelected ? '2px solid #00d4aa' : '1px solid rgba(255,255,255,0.2)',
                background: isSelected ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.05)',
                color: isSelected ? '#00d4aa' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected ? '0 0 12px rgba(0,212,170,0.3)' : 'none',
                textAlign: 'left',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && <span style={{ marginRight: 12 }}>✓ </span>}
              {option.label}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

function ReadyStep({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 28 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(251,191,36,0.4)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#fff',
          fontFamily: 'Georgia, serif',
          letterSpacing: -0.5,
        }}
      >
        Du är redo!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          background: 'rgba(0,212,170,0.08)',
          border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: 12,
          padding: '16px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Namn</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{data.name}</div>
        </div>

        <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Mål</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.goals.map(g => (
              <span key={g} style={{
                fontSize: 12,
                background: 'rgba(0,212,170,0.15)',
                border: '1px solid rgba(0,212,170,0.3)',
                borderRadius: 6,
                padding: '4px 10px',
                color: '#00d4aa',
              }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Tid per dag</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
            {TIME_OPTIONS.find(o => o.value === data.time)?.label}
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 8 }} />
    </motion.div>
  )
}

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [goals, setGoals] = useState([])
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const userId = localStorage.getItem('user_id')

  const canContinue = () => {
    if (step === 1) return true
    if (step === 2) return name.trim().length > 0
    if (step === 3) return goals.length > 0
    if (step === 4) return time !== ''
    return true
  }

  const handleNext = async () => {
    if (step === 5) {
      // Save and complete onboarding
      setLoading(true)
      try {
        const profileData = {
          name,
          goals,
          time_per_day: time,
        }
        await axios.put(`/api/profile/${userId}`, profileData)
        localStorage.setItem('onboarding_complete', 'true')
        onClose?.()
        navigate('/flow')
      } catch (err) {
        console.error('Onboarding save failed:', err)
      } finally {
        setLoading(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #0F172A, #1E293B)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 0% 0%, rgba(0, 212, 170, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(167, 139, 250, 0.1) 0%, transparent 40%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {step === 1 && <WelcomeStep key="1" />}
          {step === 2 && <NameStep key="2" value={name} onChange={setName} />}
          {step === 3 && <GoalStep key="3" value={goals} onChange={setGoals} />}
          {step === 4 && <TimeStep key="4" value={time} onChange={setTime} />}
          {step === 5 && <ReadyStep key="5" data={{ name, goals, time }} />}
        </AnimatePresence>
      </div>

      {/* Footer: Progress dots + buttons */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '24px',
        background: 'rgba(8,8,16,0.8)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0,212,170,0.15)',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: step >= i ? '#00d4aa' : 'rgba(255,255,255,0.15)',
                boxShadow: step >= i ? '0 0 8px rgba(0,212,170,0.6)' : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            onClick={handlePrev}
            disabled={step === 1}
            whileHover={{ scale: step > 1 ? 1.02 : 1 }}
            whileTap={{ scale: step > 1 ? 0.98 : 1 }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              fontWeight: 600,
              cursor: step > 1 ? 'pointer' : 'default',
              opacity: step === 1 ? 0.3 : 1,
              transition: 'all 0.2s',
            }}
          >
            Tillbaka
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={!canContinue() || loading}
            whileHover={{ scale: canContinue() ? 1.02 : 1 }}
            whileTap={{ scale: canContinue() ? 0.98 : 1 }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: canContinue() ? 'linear-gradient(135deg, #00d4aa, #a78bfa)' : 'rgba(255,255,255,0.1)',
              color: canContinue() ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontWeight: 700,
              cursor: canContinue() ? 'pointer' : 'default',
              boxShadow: canContinue() ? '0 0 16px rgba(0,212,170,0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Sparar...' : (step === 1 ? 'Kom igång' : step === 5 ? 'Starta min resa' : 'Fortsätt')}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

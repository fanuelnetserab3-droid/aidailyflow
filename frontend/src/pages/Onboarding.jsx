import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const GOALS = [
  { label: 'Hitta jobb', icon: '💼' },
  { label: 'Bygga företag', icon: '🚀' },
  { label: 'Lära mig skills', icon: '🧠' },
  { label: 'Bättre hälsa', icon: '💪' },
  { label: 'Tjäna pengar', icon: '💰' },
  { label: 'Personlig utveckling', icon: '🌱' },
]

const SKILL_SUGGESTIONS = [
  'AI & Prompting', 'No-Code / Bubble', 'Digital marknadsföring',
  'Copywriting', 'Video-redigering', 'Programmering', 'Design', 'SEO',
]

const TIME_OPTIONS = [
  { label: '1–2 timmar', value: '1-2', desc: 'Kompakt och fokuserat' },
  { label: '3–4 timmar', value: '3-4', desc: 'Balanserad dag' },
  { label: '5–6 timmar', value: '5-6', desc: 'Intensiv satsning' },
  { label: 'Helt fri dag', value: 'unlimited', desc: 'Maximalt fokus' },
]

const MOCK_TASKS = [
  { time: '07:00', title: 'Morgonrutin', cat: '#F59E0B' },
  { time: '08:00', title: 'Djupfokus – din skill', cat: '#a78bfa' },
  { time: '10:00', title: 'Träningspass', cat: '#22C55E' },
  { time: '13:00', title: 'Lärande & kurser', cat: '#a78bfa' },
  { time: '20:30', title: 'Reflektion', cat: '#60a5fa' },
]

// ─── Steg 1: Välkommen ───────────────────────────────────────────
function WelcomeStep() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 24px', textAlign: 'center', gap: 28 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        style={{ width: 88, height: 88, borderRadius: 24, background: 'linear-gradient(135deg, #00d4aa, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,212,170,0.4)', fontSize: 40 }}>
        ⚡
      </motion.div>
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ fontSize: 34, fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, #00d4aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12, letterSpacing: -0.5, fontFamily: 'Georgia, serif' }}>
          Välkommen till AiDailyFlow
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
          På 60 sekunder skapar vi ditt personliga AI-schema — anpassat till dina mål och din vardag.
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        style={{ display: 'flex', gap: 24 }}>
        {['🎯 Dina mål', '🧠 Dina skills', '📅 Ditt schema'].map((t, i) => (
          <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{t}</div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Steg 2: Namn ────────────────────────────────────────────────
function NameStep({ value, onChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>Steg 1 av 4</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Vad heter du?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Vi personaliserar schemat efter dig</p>
      </div>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Ditt förnamn..."
        autoFocus
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 14, padding: '16px 18px', fontSize: 18, color: '#f1f5f9', outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => { e.target.style.borderColor = '#00d4aa'; e.target.style.background = 'rgba(0,212,170,0.08)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(0,212,170,0.3)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
      />
    </motion.div>
  )
}

// ─── Steg 3: Mål ─────────────────────────────────────────────────
function GoalStep({ value, onChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>Steg 2 av 4</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Vad vill du uppnå?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Välj allt som stämmer</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {GOALS.map((goal, i) => {
          const sel = value.includes(goal.label)
          return (
            <motion.button key={goal.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              onClick={() => sel ? onChange(value.filter(g => g !== goal.label)) : onChange([...value, goal.label])}
              whileTap={{ scale: 0.96 }}
              style={{ padding: '14px 12px', borderRadius: 14, fontSize: 13, fontWeight: 600, border: sel ? '2px solid #00d4aa' : '1px solid rgba(255,255,255,0.12)', background: sel ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)', color: sel ? '#00d4aa' : 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', boxShadow: sel ? '0 0 16px rgba(0,212,170,0.2)' : 'none' }}>
              <span style={{ fontSize: 18 }}>{goal.icon}</span>
              <span style={{ textAlign: 'left', lineHeight: 1.3 }}>{goal.label}</span>
              {sel && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Steg 4: Skills ──────────────────────────────────────────────
function SkillsStep({ value, onChange }) {
  const [custom, setCustom] = useState('')

  const toggle = (s) => {
    if (value.includes(s)) onChange(value.filter(x => x !== s))
    else onChange([...value, s])
  }

  const addCustom = () => {
    const v = custom.trim()
    if (v && !value.includes(v)) { onChange([...value, v]); setCustom('') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>Steg 3 av 4</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Vad vill du lära dig?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>AI:n hittar kurser & resurser för just dessa</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SKILL_SUGGESTIONS.map((s, i) => {
          const sel = value.includes(s)
          return (
            <motion.button key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              onClick={() => toggle(s)} whileTap={{ scale: 0.95 }}
              style={{ padding: '9px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: sel ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)', background: sel ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: sel ? '#a78bfa' : 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.15s' }}>
              {sel ? '✓ ' : ''}{s}
            </motion.button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="Lägg till egen skill..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#f1f5f9', outline: 'none', fontFamily: 'inherit' }}
        />
        <motion.button onClick={addCustom} whileTap={{ scale: 0.95 }}
          style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontSize: 16, cursor: 'pointer' }}>
          +
        </motion.button>
      </div>
      {value.length > 0 && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Valda: {value.join(', ')}
        </div>
      )}
    </motion.div>
  )
}

// ─── Steg 5: Tid per dag ─────────────────────────────────────────
function TimeStep({ value, onChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px 24px', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 10 }}>Steg 4 av 4</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Hur mycket tid har du?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Vi anpassar schemat efter din dag</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TIME_OPTIONS.map((opt, i) => {
          const sel = value === opt.value
          return (
            <motion.button key={opt.value} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => onChange(opt.value)} whileTap={{ scale: 0.98 }}
              style={{ padding: '16px 18px', borderRadius: 14, border: sel ? '2px solid #00d4aa' : '1px solid rgba(255,255,255,0.12)', background: sel ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', boxShadow: sel ? '0 0 20px rgba(0,212,170,0.15)' : 'none' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: sel ? '#00d4aa' : '#f1f5f9' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              {sel && <span style={{ color: '#00d4aa', fontSize: 18 }}>✓</span>}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Steg 6: Klart — förhandsgranskning ──────────────────────────
function ReadyStep({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '32px 24px', gap: 20, overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          style={{ fontSize: 56, marginBottom: 12 }}>🎉</motion.div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif', marginBottom: 6 }}>
          {data.name}, du är redo!
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Så här kommer ditt schema se ut</p>
      </div>

      {/* Mock schedule preview */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(0,212,170,0.5)', textTransform: 'uppercase', marginBottom: 12 }}>Förhandsgranskning</div>
        {MOCK_TASKS.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.cat, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', width: 38, flexShrink: 0 }}>{t.time}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
              {i === 1 && data.skills?.length > 0 ? `Djupfokus – ${data.skills[0]}` : t.title}
            </div>
          </motion.div>
        ))}
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(0,212,170,0.06)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          + länkar till kurser & resurser för dina skills
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {data.goals?.slice(0, 3).map(g => (
          <span key={g} style={{ fontSize: 11, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: '4px 12px', color: '#00d4aa' }}>{g}</span>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Huvud-komponent ─────────────────────────────────────────────
export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [goals, setGoals] = useState([])
  const [skills, setSkills] = useState([])
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const TOTAL_STEPS = 6

  const canContinue = () => {
    if (step === 1) return true
    if (step === 2) return name.trim().length > 0
    if (step === 3) return goals.length > 0
    if (step === 4) return true // skills är valfritt
    if (step === 5) return time !== ''
    return true
  }

  const handleNext = async () => {
    if (step === TOTAL_STEPS) {
      setLoading(true)
      try {
        await axios.put(`/api/profile/${localStorage.getItem('user_id')}`, {
          name,
          goals,
          skills,
          time_per_day: time,
        })
        localStorage.setItem('onboarding_complete', 'true')
        onClose?.()
        navigate('/flow')
      } catch (err) {
        console.error('Onboarding save failed:', err)
      } finally {
        setLoading(false)
      }
    } else {
      setStep(s => s + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(s => s - 1)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 10%, #0d1a2e 0%, #080810 60%, #050508 100%)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Bakgrund */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(0,212,170,0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(167,139,250,0.08) 0%, transparent 40%)', pointerEvents: 'none' }} />

      {/* Innehåll */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {step === 1 && <WelcomeStep key="1" />}
          {step === 2 && <NameStep key="2" value={name} onChange={setName} />}
          {step === 3 && <GoalStep key="3" value={goals} onChange={setGoals} />}
          {step === 4 && <SkillsStep key="4" value={skills} onChange={setSkills} />}
          {step === 5 && <TimeStep key="5" value={time} onChange={setTime} />}
          {step === 6 && <ReadyStep key="6" data={{ name, goals, skills, time }} />}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 24px 32px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,212,170,0.1)' }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #00d4aa, #a78bfa)', borderRadius: 2 }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button onClick={handlePrev} disabled={step === 1} whileTap={{ scale: step > 1 ? 0.97 : 1 }}
            style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, cursor: step > 1 ? 'pointer' : 'default', opacity: step === 1 ? 0.3 : 1 }}>
            ← Tillbaka
          </motion.button>

          <motion.button onClick={handleNext} disabled={!canContinue() || loading}
            whileHover={{ scale: canContinue() ? 1.02 : 1, boxShadow: canContinue() ? '0 0 30px rgba(0,212,170,0.3)' : 'none' }}
            whileTap={{ scale: canContinue() ? 0.97 : 1 }}
            style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: canContinue() ? 'linear-gradient(135deg, #00d4aa, #a78bfa)' : 'rgba(255,255,255,0.08)', color: canContinue() ? '#000' : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 800, cursor: canContinue() ? 'pointer' : 'default', letterSpacing: 0.5 }}>
            {loading ? 'Sparar...' : step === 1 ? '▶  Kom igång' : step === TOTAL_STEPS ? '🚀  Skapa mitt schema' : 'Fortsätt →'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

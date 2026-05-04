import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const BACKGROUND = {
  background: 'var(--bg)',
  minHeight: '100%',
  position: 'relative',
  overflow: 'hidden',
}

const CARD = {
  background: 'var(--card)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid var(--border)',
  boxShadow: '0 24px 80px rgba(15,23,42,0.30)',
}

const FIELD_CONFIGS = [
  { id: 'alder', label: 'Ålder', type: 'text', placeholder: 'Skriv din ålder' },
  { id: 'kon', label: 'Kön', type: 'text', placeholder: 'Skriv ditt kön' },
  { id: 'situation', label: 'Situation', type: 'text', placeholder: 'Beskriv din nuvarande situation' },
  { id: 'boendeort', label: 'Boendeort', type: 'text', placeholder: 'Var bor du?' },
  { id: 'familj', label: 'Familj', type: 'text', placeholder: 'Berätta om din familj' },
  { id: 'traning', label: 'Träning', type: 'text', placeholder: 'Hur ser träningen ut?' },
  { id: 'aktiviteter', label: 'Aktiviteter', type: 'text', placeholder: 'Vad gör du på fritiden?' },
  { id: 'somn', label: 'Sömn', type: 'text', placeholder: 'Hur mycket sover du?' },
  { id: 'halsa', label: 'Hälsa', type: 'text', placeholder: 'Hur mår din hälsa?' },
  { id: 'mal', label: 'Mål', type: 'textarea', placeholder: 'Vad vill du uppnå?' },
  { id: 'motivation', label: 'Motivation', type: 'textarea', placeholder: 'Vad driver dig?' },
  { id: 'disciplin', label: 'Disciplin', type: 'text', placeholder: 'Hur disciplinerad känner du dig?' },
  { id: 'tid_per_dag', label: 'Tid per dag', type: 'text', placeholder: 'Hur mycket tid kan du avsätta varje dag?' },
  { id: 'budget', label: 'Budget', type: 'text', placeholder: 'Vilken budget har du?' },
  { id: 'larande', label: 'Lärande', type: 'textarea', placeholder: 'Vad vill du lära dig?' },
  { id: 'produktivitet', label: 'Produktivitet', type: 'text', placeholder: 'Hur produktiv känner du dig?' },
  { id: 'voice_enabled', label: 'Röst aktiverad', type: 'toggle', placeholder: '' },
  { id: 'voice_speed', label: 'Rösthastighet', type: 'slider', placeholder: '', min: 0.8, max: 1.2, step: 0.1 },
  { id: 'voice_type', label: 'Rösttyp', type: 'select', placeholder: 'Välj röst', options: ['auto', 'svenska', 'engelska', 'kvinnlig', 'manlig'] },
  { id: 'voice_recording', label: 'Spela in din röst', type: 'voice_recorder', placeholder: 'Spela in ett kort meddelande för att använda din röst' },
]

const FIELDS_BY_ID = Object.fromEntries(FIELD_CONFIGS.map(f => [f.id, f]))

const SECTIONS = [
  { title: 'Om dig', color: '#38bdf8', fields: ['alder', 'kon', 'situation', 'boendeort', 'familj'] },
  { title: 'Livsstil', color: '#4ade80', fields: ['traning', 'aktiviteter', 'somn', 'halsa'] },
  { title: 'Mål & Drivkraft', color: '#f472b6', fields: ['mal', 'motivation', 'disciplin'] },
  { title: 'Lärande', color: '#a78bfa', fields: ['larande', 'produktivitet'] },
  { title: 'Tid & Rytm', color: '#fb923c', fields: ['tid_per_dag', 'budget'] },
  { title: 'Röstinställningar', color: '#00d4aa', fields: ['voice_enabled', 'voice_speed', 'voice_type', 'voice_recording'] },
]

function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Kunde inte komma åt mikrofonen. Kontrollera behörigheter.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const saveRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'rgba(226,232,240,0.8)', marginBottom: 8 }}>
          Spela in ett kort meddelande så att AI:n kan lära sig din röst
        </div>
        <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.6)' }}>
          Säg något som: "Hej, jag är [ditt namn] och det här är min röst."
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        {!isRecording ? (
          <button onClick={startRecording}
            style={{ border: 'none', borderRadius: '50%', width: 60, height: 60, background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button onClick={stopRecording}
            style={{ border: 'none', borderRadius: '50%', width: 60, height: 60, background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'pulse 1s infinite' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        )}
      </div>

      {isRecording && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 700 }}>Spelar in...</div>
          <div style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12, marginTop: 4 }}>Klicka på stoppknappen när du är klar</div>
        </div>
      )}

      {audioBlob && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={playRecording} disabled={isPlaying}
              style={{ border: '1px solid rgba(148,163,184,0.16)', borderRadius: 12, padding: '8px 16px', background: 'rgba(15,23,42,0.92)', color: '#f8fafc', fontSize: 12, cursor: 'pointer' }}>
              {isPlaying ? 'Spelar...' : 'Spela upp'}
            </button>
          </div>
          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} style={{ display: 'none' }} />
        </div>
      )}

      {audioBlob && (
        <button onClick={saveRecording}
          style={{ width: '100%', border: 'none', borderRadius: 12, padding: '12px 0', background: '#14B8A6', color: '#0F172A', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Spara min röst
        </button>
      )}
    </div>
  )
}

function getInitials(name) {
  if (!name) return 'AD'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return 'AD'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function buildDisplayValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'number') return String(value)
  return value || 'Ej angivet'
}

export default function Profil() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('min')
  const [editingField, setEditingField] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const userId = useMemo(() => localStorage.getItem('user_id'), [])
  const profileName = profile.name || profile.namn || 'Din profil'
  const initials = getInitials(profileName)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const endpoint = (userId && !isNaN(userId))
          ? `/api/profile/${userId}`
          : '/api/profile'
        const res = await axios.get(endpoint)
        setProfile(res.data || {})
      } catch (err) {
        setError('Kunde inte hämta profilen. Försök igen.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  const filledCount = useMemo(() => {
    return FIELD_CONFIGS.filter(field => {
      const value = profile[field.id]
      if (Array.isArray(value)) return value.length > 0
      return String(value || '').trim().length > 0
    }).length
  }, [profile])

  const completionPct = Math.round((filledCount / FIELD_CONFIGS.length) * 100)
  const stats = {
    done_today: profile.done_today ?? 0,
    week_average: profile.week_average ?? 0,
    streak: profile.streak ?? 0,
  }

  const openEditor = (fieldId) => {
    const config = FIELDS_BY_ID[fieldId]
    if (!config) return
    setEditingField(config)
    if (fieldId === 'voice_enabled') {
      setEditingValue(localStorage.getItem('voiceEnabled') !== 'false' ? 'true' : 'false')
    } else if (fieldId === 'voice_speed') {
      setEditingValue(localStorage.getItem('voiceSpeed') || '1.0')
    } else if (fieldId === 'voice_type') {
      setEditingValue(localStorage.getItem('voiceType') || 'auto')
    } else {
      const rawValue = profile[fieldId]
      setEditingValue(Array.isArray(rawValue) ? rawValue.join(', ') : rawValue || '')
    }
  }

  const closeEditor = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const handleSave = async () => {
    if (!editingField) return
    setSaving(true)

    if (editingField.id === 'voice_enabled' || editingField.id === 'voice_speed' || editingField.id === 'voice_type') {
      // Save voice settings to localStorage
      localStorage.setItem(editingField.id, editingValue)
      setToast({ message: 'Röstinställning sparad.', type: 'success' })
      closeEditor()
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
      return
    }

    const updatedProfile = {
      ...profile,
      [editingField.id]: editingValue,
    }

    try {
      const endpoint = (userId && !isNaN(userId))
        ? `/api/profile/${userId}`
        : '/api/profile'
      await axios.put(endpoint, updatedProfile)
      setProfile(updatedProfile)
      setToast({ message: 'Profil sparad.', type: 'success' })
      closeEditor()
    } catch (err) {
      setToast({ message: 'Kunde inte spara profilen.', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    navigate('/auth')
  }

  return (
    <div style={BACKGROUND}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ y: [0, -24, 0] }} transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.24), transparent 55%)', top: 40, left: -40 }} />
        <motion.div animate={{ x: [0, 28, 0] }} transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 55%)', top: '30%', right: -70 }} />
        <motion.div animate={{ y: [0, 18, 0], x: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.16), transparent 55%)', bottom: -40, left: '20%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '20px 16px 120px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(203,213,225,0.6)', marginBottom: 8 }}>PROFIL</div>
            <h1 style={{ fontSize: 30, margin: 0, color: 'var(--text)', letterSpacing: '-0.03em' }}>Din personliga profil</h1>
            <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>Samla din information, följ utvecklingen och uppdatera din profil när livet förändras.</p>
          </div>
          <button onClick={handleLogout} style={{ border: '1px solid rgba(20,184,166,0.25)', background: 'var(--card)', color: 'var(--text-muted)', borderRadius: 14, padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>Logga ut</button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ ...CARD, borderRadius: 22, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'rgba(20,184,166,0.12)', color: 'var(--text)', fontSize: 22, fontWeight: 800, letterSpacing: '0.05em' }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{profileName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>AI-livsråd</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{profile.situation || 'Berätta om din nuvarande situation genom att redigera fältet "Situation".'}</p>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px', minWidth: 160, background: 'var(--card)', borderRadius: 16, padding: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Komplettering</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{completionPct}%</div>
              </div>
              <div style={{ flex: '1 1 160px', minWidth: 160, background: 'var(--card)', borderRadius: 16, padding: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Statistik</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{profile.streak ?? 0} dagars streak</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
            <div style={{ ...CARD, borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Gjort idag</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{stats.done_today}</div>
            </div>
            <div style={{ ...CARD, borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Vecko snitt</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{stats.week_average}</div>
            </div>
            <div style={{ ...CARD, borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Streak</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{stats.streak}</div>
            </div>
          </div>

          <div style={{ ...CARD, borderRadius: 24, padding: 18 }}>
            <div style={{ display: 'flex', gap: 6, borderRadius: 16, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <button onClick={() => setActiveTab('min')} style={{ flex: 1, padding: 14, border: 'none', background: activeTab === 'min' ? 'var(--accent-bg)' : 'transparent', color: activeTab === 'min' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Min Profil</button>
              <button onClick={() => setActiveTab('statistik')} style={{ flex: 1, padding: 14, border: 'none', background: activeTab === 'statistik' ? 'var(--accent-bg)' : 'transparent', color: activeTab === 'statistik' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Statistik</button>
              <button onClick={() => setActiveTab('installningar')} style={{ flex: 1, padding: 14, border: 'none', background: activeTab === 'installningar' ? 'var(--accent-bg)' : 'transparent', color: activeTab === 'installningar' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Inställningar</button>
            </div>
          </div>

          {activeTab === 'min' ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {SECTIONS.map(section => (
                <div key={section.title} style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: section.color }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{section.title}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {section.fields.map(fieldId => {
                      const config = FIELDS_BY_ID[fieldId]
                      return (
                        <button key={fieldId} onClick={() => openEditor(fieldId)}
                          style={{
                            width: '100%', textAlign: 'left', border: '1px solid var(--border)', borderRadius: 16,
                            background: 'var(--card)', padding: '14px 16px', cursor: 'pointer', color: 'var(--text)',
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{config.label}</div>
                              <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{fieldId === 'voice_enabled' ? (localStorage.getItem('voiceEnabled') !== 'false' ? 'Aktiverad' : 'Inaktiverad') : fieldId === 'voice_speed' ? `${localStorage.getItem('voiceSpeed') || '1.0'}x` : fieldId === 'voice_type' ? (localStorage.getItem('voiceType') || 'auto') : fieldId === 'voice_recording' ? (localStorage.getItem('userVoiceSample') ? 'Inspelad röst finns' : 'Ingen röst inspelad') : buildDisplayValue(profile[fieldId])}</div>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Redigera</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'statistik' ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.8, color: 'var(--text-muted)', marginBottom: 10 }}>Profilkomplettering</div>
                <div style={{ height: 12, borderRadius: 99, background: 'var(--card)', overflow: 'hidden', marginBottom: 12 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.6 }}
                    style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #14B8A6, #38bdf8)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12 }}>
                  <span>{filledCount} av {FIELD_CONFIGS.length} fält fyllda</span>
                  <span>{completionPct}%</span>
                </div>
              </div>

              <div style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { label: 'Fokusstyrka', value: profile.focus_power ?? 'Ej tillgängligt' },
                    { label: 'Ärlighet i svaren', value: profile.self_awareness ?? 'Ej tillgängligt' },
                    { label: 'Helhetsbild', value: profile.overall_readiness ?? 'Ej tillgängligt' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.8, color: 'var(--text-muted)', marginBottom: 10 }}>Nyckelindikatorer</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mål klarhet</span>
                    <span style={{ color: 'var(--text)', fontWeight: 700 }}>{profile.mal ? 'Satt' : 'Ej satt'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tid varje dag</span>
                    <span style={{ color: 'var(--text)', fontWeight: 700 }}>{profile.tid_per_dag || 'Ej angivet'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget</span>
                    <span style={{ color: 'var(--text)', fontWeight: 700 }}>{profile.budget || 'Ej angivet'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Tema</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                      {theme === 'dark' ? 'Mörkt tema' : 'Ljust tema'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Växla mellan ljust och mörkt läge
                    </div>
                  </div>
                  <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: 60,
                      height: 32,
                      borderRadius: 16,
                      border: '1px solid var(--border)',
                      background: theme === 'dark' ? 'var(--accent-bg)' : 'var(--accent-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <motion.div
                      animate={{ x: theme === 'dark' ? 28 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      {theme === 'dark' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              <div style={{ ...CARD, borderRadius: 22, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>App-information</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: 'rgba(226,232,240,0.75)', fontSize: 13 }}>Version</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>v2.0.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: 'rgba(226,232,240,0.75)', fontSize: 13 }}>Utvecklare</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>AiDailyFlow Team</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: 'rgba(226,232,240,0.75)', fontSize: 13 }}>AI-modell</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>Claude AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ ...CARD, borderRadius: 20, padding: 16, borderColor: 'rgba(248,113,113,0.3)' }}>
              <div style={{ color: '#fecaca', fontSize: 13 }}>{error}</div>
            </div>
          )}

          {loading && (
            <div style={{ ...CARD, borderRadius: 20, padding: 20, textAlign: 'center' }}>
              <div style={{ color: 'rgba(226,232,240,0.7)', fontSize: 13 }}>Hämtar din profil…</div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingField && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,7,15,0.65)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, ...CARD, padding: 24, maxHeight: '82vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{editingField.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.65)', marginTop: 4 }}>Uppdatera fältet och spara för att lagra ändringen.</div>
                </div>
                <button onClick={closeEditor} style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Stäng</button>
              </div>
              {editingField.type === 'textarea' ? (
                <textarea value={editingValue} onChange={e => setEditingValue(e.target.value)}
                  rows={6}
                  style={{ width: '100%', borderRadius: 18, border: '1px solid rgba(148,163,184,0.16)', background: 'rgba(15,23,42,0.92)', color: '#f8fafc', padding: 16, resize: 'vertical', fontSize: 14, lineHeight: 1.7 }}
                  placeholder={editingField.placeholder} />
              ) : editingField.type === 'toggle' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                  <button onClick={() => setEditingValue(editingValue === 'true' ? 'false' : 'true')}
                    style={{ width: 50, height: 28, borderRadius: 14, background: editingValue === 'true' ? '#14B8A6' : '#64748b', border: 'none', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: editingValue === 'true' ? 25 : 3, transition: 'left 0.2s' }} />
                  </button>
                  <span style={{ color: '#f8fafc', fontSize: 14 }}>{editingValue === 'true' ? 'Aktiverad' : 'Inaktiverad'}</span>
                </div>
              ) : editingField.type === 'slider' ? (
                <div style={{ padding: 16 }}>
                  <input type="range" min={editingField.min} max={editingField.max} step={editingField.step} value={editingValue} onChange={e => setEditingValue(e.target.value)}
                    style={{ width: '100%', accentColor: '#14B8A6' }} />
                  <div style={{ textAlign: 'center', marginTop: 8, color: '#f8fafc', fontSize: 14 }}>{editingValue}x hastighet</div>
                </div>
              ) : editingField.type === 'select' ? (
                <div style={{ padding: 16 }}>
                  <select value={editingValue} onChange={e => setEditingValue(e.target.value)}
                    style={{ width: '100%', borderRadius: 18, border: '1px solid rgba(148,163,184,0.16)', background: 'rgba(15,23,42,0.92)', color: '#f8fafc', padding: 16, fontSize: 14 }}>
                    {editingField.options.map(option => (
                      <option key={option} value={option} style={{ background: 'rgba(15,23,42,0.92)', color: '#f8fafc' }}>
                        {option === 'auto' ? 'Automatisk' : option === 'svenska' ? 'Svenska' : option === 'engelska' ? 'Engelska' : option === 'kvinnlig' ? 'Kvinnlig' : option === 'manlig' ? 'Manlig' : option}
                      </option>
                    ))}
                  </select>
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <button
                    onClick={() => {
                      const testText = 'Hej! Det här är ett test av rösten. Hur låter den?'
                      const speak = (voices) => {
                        const utterance = new SpeechSynthesisUtterance(testText)
                        utterance.lang = 'sv-SE'
                        utterance.rate = parseFloat(localStorage.getItem('voiceSpeed')) || 1.0
                        utterance.pitch = 1.0
                        utterance.volume = 1.0

                        // Prioritera online-röster (bättre kvalitet), sedan lokala
                        const rank = v => {
                          const n = v.name.toLowerCase()
                          if (n.includes('alva')) return 10       // Bästa svenska röst (iOS/macOS)
                          if (n.includes('hedvig')) return 9       // Microsoft svenska
                          if (n.includes('klara')) return 8
                          if (v.localService === false) return 5   // Online-röster = bättre
                          if (v.lang.startsWith('sv')) return 3
                          return 1
                        }

                        let pool = []
                        if (editingValue === 'auto' || editingValue === 'svenska') {
                          pool = voices.filter(v => v.lang.startsWith('sv'))
                          if (!pool.length) pool = voices.filter(v => v.lang.startsWith('en'))
                        } else if (editingValue === 'engelska') {
                          pool = voices.filter(v => v.lang.startsWith('en'))
                        } else if (editingValue === 'kvinnlig') {
                          pool = voices.filter(v => v.name.toLowerCase().match(/female|zira|alva|hedvig|klara|anna|karen|samantha/))
                          if (!pool.length) pool = voices.filter(v => v.lang.startsWith('sv'))
                        } else if (editingValue === 'manlig') {
                          pool = voices.filter(v => v.name.toLowerCase().match(/male|david|daniel|thomas/))
                          if (!pool.length) pool = voices.filter(v => v.lang.startsWith('sv'))
                        }

                        pool.sort((a, b) => rank(b) - rank(a))
                        if (pool[0]) utterance.voice = pool[0]

                        window.speechSynthesis.cancel()
                        window.speechSynthesis.speak(utterance)
                      }

                      const voices = window.speechSynthesis.getVoices()
                      if (voices.length > 0) {
                        speak(voices)
                      } else {
                        window.speechSynthesis.onvoiceschanged = () => speak(window.speechSynthesis.getVoices())
                      }
                    }}
                    style={{ border: 'none', borderRadius: 12, padding: '8px 16px', background: '#14B8A6', color: '#0F172A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Testa röst
                  </button>
                  </div>
                </div>
              ) : editingField.type === 'voice_recorder' ? (
                <VoiceRecorder onRecordingComplete={(audioBlob) => {
                  // Save the recorded voice to localStorage or send to server
                  const reader = new FileReader()
                  reader.onload = () => {
                    localStorage.setItem('userVoiceSample', reader.result)
                    setToast({ message: 'Din röst har spelats in och sparats!', type: 'success' })
                    closeEditor()
                  }
                  reader.readAsDataURL(audioBlob)
                }} />
              ) : (
                <input value={editingValue} onChange={e => setEditingValue(e.target.value)}
                  style={{ width: '100%', borderRadius: 18, border: '1px solid rgba(148,163,184,0.16)', background: 'rgba(15,23,42,0.92)', color: '#f8fafc', padding: 16, fontSize: 14 }}
                  placeholder={editingField.placeholder} />
              )}
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', marginTop: 18, border: 'none', borderRadius: 18, padding: '14px 0', background: '#14B8A6', color: '#0F172A', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', right: 20, bottom: 24, zIndex: 80, minWidth: 240, ...CARD, borderRadius: 18, padding: 16, borderColor: toast.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(20,184,166,0.18)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: toast.type === 'error' ? '#fecaca' : '#d8fcfb' }}>{toast.type === 'error' ? 'Fel' : 'Sparat'}</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(226,232,240,0.8)' }}>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


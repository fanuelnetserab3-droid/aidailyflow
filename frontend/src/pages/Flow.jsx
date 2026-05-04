import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const QUESTIONS = [
  { id: 'name', message: 'Välkommen!\n\nJag är Flow, din personliga AI-coach.\n\nVad heter du?', type: 'text', placeholder: 'Skriv ditt namn...' },
  { id: 'age', message: 'Kul att träffas, {name}! Hur gammal är du?', type: 'chips', options: ['16-18', '19-25', '26-35', '36-45', '45+'] },
  { id: 'situation', message: 'Vad är din nuvarande situation?', type: 'chips', options: ['Studerar', 'Jobbar heltid', 'Jobbar deltid', 'Söker jobb', 'Eget företag', 'Inget just nu'] },
  { id: 'goals', message: 'Vilka är dina mål? Välj gärna flera.', type: 'multi', options: ['Tjäna pengar', 'Hitta jobb', 'Bygga företag', 'Lära mig skills', 'Bättre hälsa', 'Personlig utveckling'] },
  { id: 'wake_time', message: 'Vilken tid vaknar du vanligtvis?', type: 'chips', options: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00'] },
  { id: 'sleep_hours', message: 'Hur många timmar sover du per natt?', type: 'chips', options: ['5 timmar', '6 timmar', '7 timmar', '8 timmar', '9+ timmar'] },
  { id: 'training', message: 'Tränar du eller vill börja träna?', type: 'chips', options: ['Ja, jag tränar', 'Vill börja träna', 'Tränar inte'] },
  { id: 'training_type', message: 'Vilken typ av träning?', type: 'multi', options: ['Styrketräning', 'Löpning', 'Yoga', 'Cykling', 'Simning', 'Blandat'], condition: (p) => p.training !== 'Tränar inte' },
  { id: 'training_duration', message: 'Hur länge per träningspass?', type: 'chips', options: ['30 min', '45 min', '1 timme', '1.5 timme', '2 timmar', '2.5+ timmar'], condition: (p) => p.training !== 'Tränar inte' },
  { id: 'gym_distance', message: 'Hur långt är det till gymmet?', type: 'chips', options: ['Hemma/Online', 'Under 10 min', '10-20 min', '20-30 min', '30-45 min', '45+ min'], condition: (p) => p.training !== 'Tränar inte' && Array.isArray(p.training_type) && p.training_type.includes('Styrketräning') },
  { id: 'job_hours', message: 'Hur många timmar per dag jobbar du?', type: 'chips', options: ['2-3h', '4-5h', '6-7h', '8h', '9-10h', '10h+'], condition: (p) => p.situation?.includes('Jobbar') },
  { id: 'job_commute', message: 'Hur lång pendlingstid till jobbet?', type: 'chips', options: ['Jobbar hemifrån', 'Under 15 min', '15-30 min', '30-45 min', '45-60 min', '1h+'], condition: (p) => p.situation?.includes('Jobbar') },
  { id: 'skills', message: 'Vilket yrke eller skill vill du bygga 2026? Välj 1-2.', type: 'multi', options: ['AI Content Manager', 'No-Code Utvecklare', 'Python/Programmering', 'Digital Marknadsföring', 'Grafisk Design', 'Eget företag', 'Annat'] },
  { id: 'learning_hours', message: 'Hur många timmar per dag för lärande?', type: 'chips', options: ['1h', '2h', '3h', '4h', '5h', '6h+'] },
  { id: 'budget', message: 'Budget per månad för kurser och verktyg?', type: 'chips', options: ['Inget', 'Under 200 kr', '200-500 kr', '500-1000 kr', '1000-3000 kr', '3000 kr+'] },
  { id: 'timeframe', message: 'Vilken tidsram siktar du på?', type: 'chips', options: ['Idag', 'Denna vecka', 'Denna månad', '3 månader', '6 månader', '1 år'] },
  { id: 'education', message: 'Vilken utbildningsnivå har du?', type: 'chips', options: ['Grundskola', 'Gymnasie', 'Yrkesutbildning', 'Högskola', 'Självlärd', 'Annat'] },
  { id: 'experience', message: 'Hur mycket erfarenhet har du inom ditt målområde?', type: 'chips', options: ['Ingen alls', 'Under 6 månader', '6-12 månader', '1-2 år', '2-5 år', '5+ år'] },
  { id: 'discipline', message: 'Hur beskriver du din disciplin?', type: 'chips', options: ['Kämpar men fortsätter', 'Ganska konsekvent', 'Mycket disciplinerad', 'Beror på dagen'] },
  { id: 'work_style', message: 'Hur föredrar du att arbeta?', type: 'chips', options: ['Behöver dagliga steg', 'Klarar veckoplan', 'Styr helt själv', 'Blandat'] },
]

function cleanName(raw) {
  if (!raw) return raw
  const lower = raw.toLowerCase().trim()
  const prefixes = ['hej jag heter ', 'jag heter ', 'mitt namn är ', 'hej, jag heter ']
  for (const p of prefixes) {
    if (lower.startsWith(p)) {
      const name = raw.slice(p.length).trim()
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1)
}

function parseChips(content) {
  const chips = []
  const regex = /\[([^\]]{2,50})\](?!\()/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const opt = match[1].trim()
    if (!opt.includes('http') && !opt.match(/^\d+$/) && !opt.startsWith('+')) chips.push(opt)
  }
  const text = content.replace(/\[([^\]]{2,50})\](?!\()/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
  return { text, chips }
}

function parseMessageContent(rawContent) {
  try {
    const jsonStart = rawContent.lastIndexOf('{"message"')
    const jsonEnd = rawContent.lastIndexOf('}') + 1
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(rawContent.slice(jsonStart, jsonEnd))
      if (parsed.schedule) return { text: parsed.message || '', chips: [], schedule: parsed.schedule, timeframe: parsed.timeframe || 'Idag' }
    }
  } catch {}
  const { text, chips } = parseChips(rawContent)
  return { text, chips, schedule: null, timeframe: 'Idag' }
}

function WelcomeAnimation({ onDone }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 2200)
    const t4 = setTimeout(() => onDone(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(5,5,10,0.9)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: phase >= 1 ? 1 : 0, opacity: phase >= 1 ? 1 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#00d4aa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 0 40px rgba(0,212,170,0.4)' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.9)', borderRadius: 8 }} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }} transition={{ duration: 0.5 }}
        style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: 'Georgia, serif' }}>AiDailyFlow</motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.5 }}
        style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Din personliga AI-coach</motion.div>
    </div>
  )
}

function InfoModal({ onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'rgba(17,17,24,0.95)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#00d4aa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.9)', borderRadius: 5 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>AiDailyFlow</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Din personliga AI-coach</div>
          </div>
        </div>
        {[
          { icon: '🤖', title: 'Flow — AI-coach', desc: 'Chatta med Flow för att skapa din personliga plan och få dagliga uppgifter.' },
          { icon: '📋', title: 'Schema', desc: 'Se dina uppgifter med countdown-timer och markera dem som klara.' },
          { icon: '🔥', title: 'Vanor', desc: 'Bygg dagliga vanor och håll koll på din streak.' },
          { icon: '💭', title: 'Tankar', desc: 'Skriv ner dina tankar och få AI-analys.' },
          { icon: '📝', title: 'Listor', desc: 'Skapa smarta checklistor för dina mål.' },
        ].map(item => (
          <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: '12px 0', background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 12, color: '#00d4aa', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Stäng</button>
      </motion.div>
    </motion.div>
  )
}

function ScheduleCard({ schedule, timeframe, onGoToSchedule }) {
  if (!schedule?.length) return null
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 12, borderRadius: 14, background: 'rgba(17,17,24,0.70)', border: '1px solid rgba(0,212,170,0.2)', backdropFilter: 'blur(16px)', overflow: 'hidden' }}>
      <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', boxShadow: '0 0 8px #00d4aa' }} />
        <span style={{ fontWeight: 700, fontSize: 11, color: '#00d4aa', letterSpacing: 2, textTransform: 'uppercase' }}>Ditt schema</span>
        {timeframe && <span style={{ fontSize: 11, color: '#334155', marginLeft: 'auto' }}>{timeframe}</span>}
      </div>
      {schedule.slice(0, 4).map((task, i) => (
        <div key={i} style={{ borderBottom: i < Math.min(schedule.length, 4) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 2, height: 28, borderRadius: 1, background: '#00d4aa', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{task.title}</div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 1 }}>{task.period || (task.start && task.end ? `${task.start}–${task.end}` : '')}</div>
          </div>
        </div>
      ))}
      {schedule.length > 4 && <div style={{ padding: '8px 14px', fontSize: 11, color: '#475569', textAlign: 'center' }}>+{schedule.length - 4} uppgifter till...</div>}
      <div style={{ padding: '10px 14px' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onGoToSchedule}
          style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(0,212,170,0.4)', borderRadius: 12, color: '#00d4aa', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Gå till schemat
        </motion.button>
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '14px 16px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4aa' }} />
      ))}
    </div>
  )
}

function ChipBar({ options, onSelect, multi = false }) {
  const [selected, setSelected] = useState([])
  const toggle = (opt) => {
    if (!multi) { onSelect([opt]); return }
    setSelected(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])
  }
  return (
    <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {options.map(opt => {
          const active = selected.includes(opt)
          return (
            <motion.button key={opt} onClick={() => toggle(opt)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ background: active ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)', color: active ? '#00d4aa' : '#94A3B8', border: `1px solid ${active ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      {multi && selected.length > 0 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => onSelect(selected)} whileTap={{ scale: 0.97 }}
          style={{ marginTop: 10, width: '100%', background: 'linear-gradient(135deg,#00d4aa,#a78bfa)', color: '#fff', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Bekräfta ({selected.length} valda)
        </motion.button>
      )}
      {!multi && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, textAlign: 'center' }}>Tryck för att välja</div>
      )}
    </div>
  )
}

function MessageBubble({ msg, onChipClick, onGoToSchedule, index }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3) }}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10, gap: 8 }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end', background: 'linear-gradient(135deg,#00d4aa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.8)', borderRadius: 3 }} />
        </div>
      )}
      <div style={{ maxWidth: '82%' }}>
        <div style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: isUser ? 'linear-gradient(135deg,#00d4aa,#a78bfa)' : 'rgba(17,17,24,0.70)', color: isUser ? '#fff' : '#E2E8F0', border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)', backdropFilter: isUser ? 'none' : 'blur(16px)', boxShadow: isUser ? 'none' : '0 4px 24px rgba(0,0,0,0.3)' }}>
          {msg.text || msg.content}
        </div>
        {!isUser && msg.chips?.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {msg.chips.map(chip => (
              <motion.button key={chip} onClick={() => onChipClick(chip)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 99, padding: '6px 13px', fontSize: 12, color: '#00d4aa', fontWeight: 500, cursor: 'pointer' }}>
                {chip}
              </motion.button>
            ))}
          </div>
        )}
        {!isUser && msg.schedule && <ScheduleCard schedule={msg.schedule} timeframe={msg.timeframe} onGoToSchedule={onGoToSchedule} />}
      </div>
    </motion.div>
  )
}

let _messages = []
let _chatHistory = []
let _profileDone = false
let _step = 0
let _profile = {}

export default function Flow() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(_messages)
  const [chatHistory, setChatHistory] = useState(_chatHistory)
  const [profile, setProfile] = useState(_profile)
  const [step, setStep] = useState(_step)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileDone, setProfileDone] = useState(_profileDone)
  const [historyLoaded, setHistoryLoaded] = useState(_messages.length > 0)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const bottomRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => { _messages = messages }, [messages])
  useEffect(() => { _chatHistory = chatHistory }, [chatHistory])
  useEffect(() => { _profileDone = profileDone }, [profileDone])
  useEffect(() => { _step = step }, [step])
  useEffect(() => { _profile = profile }, [profile])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    if (_messages.length === 0) {
      init()
    }
  }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const init = async () => {
    try {
      const [profRes, histRes] = await Promise.all([
        axios.get('/api/profile'),
        axios.get('/api/chat/history'),
      ])
      const p = profRes.data
      setProfile(p)
      if (histRes.data.length > 0) {
        const apiHistory = histRes.data.map(m => ({ role: m.role, content: m.content }))
        setChatHistory(apiHistory)
        const displayMsgs = histRes.data.map((m, i) => {
          if (m.role === 'user') return { role: 'user', text: m.content, chips: [] }
          return { role: 'assistant', index: i, ...parseMessageContent(m.content) }
        })
        setMessages(displayMsgs)
        setProfileDone(true)
      } else if (p.completed) {
        setProfileDone(true)
        pushMsg('assistant', `Hej${p.name ? ` ${p.name}` : ''}! Vad vill du fokusera på idag?`, ['Skapa schema', 'Motivera mig', 'Analysera min vecka'])
      } else {
        setShowWelcome(true)
      }
    } catch {
      setShowWelcome(true)
    } finally {
      setHistoryLoaded(true)
    }
  }

  const startQuestionnaire = () => {
    pushMsg('assistant', QUESTIONS[0].message)
    setStep(0)
  }

  const pushMsg = (role, text, chips = [], schedule = null, timeframe = 'Idag') => {
    setMessages(prev => [...prev, { role, text, chips, schedule, timeframe }])
  }

  const handleProfileAnswer = async (answers) => {
    const q = QUESTIONS[step]
    // För multi-select frågor (training_type, goals, skills) — bevara alltid array
    const isMultiField = ['training_type', 'goals', 'skills'].includes(q.id)
    const value = isMultiField
      ? (Array.isArray(answers) ? answers : [answers])
      : (Array.isArray(answers) && answers.length === 1 ? answers[0] : answers)
    const displayValue = Array.isArray(value) ? value.join(', ') : value
    pushMsg('user', displayValue)
    let finalName = profile.name
    let cleanedValue = value
    if (q.id === 'name') {
      cleanedValue = cleanName(Array.isArray(value) ? value[0] : value)
      finalName = cleanedValue
    }
    const updatedProfile = { ...profile, [q.id]: cleanedValue }
    setProfile(updatedProfile)

    await axios.post('/api/profile', { [q.id]: cleanedValue }).catch(() => {})

    let nextStep = step + 1
    while (nextStep < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextStep]
      if (!nextQ.condition || nextQ.condition(updatedProfile)) break
      nextStep++
    }

    if (nextStep < QUESTIONS.length) {
      setStep(nextStep)
      const msg = QUESTIONS[nextStep].message.replace('{name}', finalName || updatedProfile.name || cleanedValue)
      setTimeout(() => pushMsg('assistant', msg), 380)
    } else {
      const finalProfile = { ...updatedProfile, completed: true }
      await axios.post('/api/profile', { ...finalProfile, completed: true }).catch(() => {})
      setProfileDone(true)
      const name = finalName || updatedProfile.name || 'du'
      setTimeout(() => pushMsg('assistant',
        `Perfekt, ${name}!\n\nJag har allt jag behöver. Vad vill du börja med?`,
        ['Skapa mitt schema', 'Vad ska jag göra idag?', 'Ge mig motivation']
      ), 380)
      setChatHistory([])
    }
  }

  const sendChatMessage = async (text) => {
    if (!text.trim() || loading) return
    setInputText('')
    pushMsg('user', text)
    setLoading(true)
    const newHistory = [...chatHistory, { role: 'user', content: text }]
    setChatHistory(newHistory)
    try {
      const res = await axios.post('/api/chat', { messages: newHistory, profile })
      const rawReply = res.data.raw || res.data.reply
      const parsed = parseMessageContent(rawReply)
      if (res.data.schedule) {
        parsed.schedule = res.data.schedule
        parsed.timeframe = res.data.timeframe
        parsed.text = res.data.reply
      }
      setMessages(prev => [...prev, { role: 'assistant', ...parsed }])
      setChatHistory(prev => [...prev, { role: 'assistant', content: rawReply }])
    } catch {
      pushMsg('assistant', 'Något gick fel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    try { await axios.delete('/api/chat/history') } catch {}
    _messages = []; _chatHistory = []; _profileDone = false; _step = 0
    setMessages([]); setChatHistory([]); setProfileDone(false); setStep(0)
    setShowResetConfirm(false)
    setShowWelcome(true)
  }

  const handleGoToSchedule = () => {
    navigate('/idag', { state: { fromFlow: true } })
  }

  const currentQ = !profileDone ? QUESTIONS[step] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', position: 'relative' }}>

      <AnimatePresence>
        {showWelcome && <WelcomeAnimation onDone={() => { setShowWelcome(false); startQuestionnaire() }} />}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      </AnimatePresence>

      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowInfo(true)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ?
          </motion.button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Flow</h1>
            <p style={{ fontSize: 11, color: '#334155', marginTop: 1 }}>Din AI-coach</p>
          </div>
        </div>
        <motion.button onClick={() => setShowResetConfirm(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ fontSize: 12, color: '#475569', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>
          Börja om
        </motion.button>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ margin: '8px 14px 0', padding: '12px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: '#FCA5A5', marginBottom: 10, fontWeight: 500 }}>Är du säker? Detta raderar hela konversationen.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 0', fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>Avbryt</button>
              <button onClick={handleReset} style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 0', fontSize: 13, color: '#FCA5A5', fontWeight: 600, cursor: 'pointer' }}>Ja, radera</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i}
              onChipClick={(chip) => {
                if (chip === 'Gå till schemat') {
                  handleGoToSchedule()
                } else if (profileDone) {
                  sendChatMessage(chip)
                } else {
                  handleProfileAnswer([chip])
                }
              }}
              onGoToSchedule={handleGoToSchedule}
            />
          ))}
        </AnimatePresence>
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4aa,#a78bfa)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.8)', borderRadius: 3 }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!profileDone && currentQ?.type !== 'text' && (
          <ChipBar key={step} options={currentQ.options} onSelect={handleProfileAnswer} multi={currentQ.type === 'multi'} />
        )}
        {(profileDone || (!profileDone && currentQ?.type === 'text')) && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px 12px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
              <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder={profileDone ? 'Skriv ett meddelande...' : (currentQ?.placeholder || 'Skriv här...')}
                rows={1}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); profileDone ? sendChatMessage(inputText) : handleProfileAnswer([inputText]) } }}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '11px 14px', color: '#F8FAFC', fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
              />
            </div>
            <motion.button onClick={() => profileDone ? sendChatMessage(inputText) : handleProfileAnswer([inputText])}
              disabled={!inputText.trim() || loading} whileTap={{ scale: 0.94 }}
              style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: inputText.trim() && !loading ? 'linear-gradient(135deg,#00d4aa,#a78bfa)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={inputText.trim() ? '#fff' : '#334155'} strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" /></svg>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
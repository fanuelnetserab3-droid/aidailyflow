import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const DAY_LABELS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
const MONTH_NAMES = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December']

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentWeek() {
  const today = new Date()
  const todayIso = formatLocalDate(today)
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = formatLocalDate(d)
    return { label: DAY_LABELS[i], num: d.getDate(), iso, isToday: iso === todayIso }
  })
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const today = formatLocalDate(new Date())

  // getDay() returns 0=Sun, 1=Mon...6=Sat — convert to Mon-first (0=Mon, 6=Sun)
  const startDow = firstDay.getDay()
  const offset = startDow === 0 ? 6 : startDow - 1

  const days = []
  // Pad empty cells before the 1st
  for (let i = 0; i < offset; i++) {
    days.push({ num: null, iso: null, isToday: false, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    const iso = formatLocalDate(d)
    days.push({
      num: i,
      iso,
      isToday: iso === today,
      isCurrentMonth: true,
    })
  }
  return days
}

const CAT = { morgon: '#F59E0B', jobb: '#00d4aa', lärande: '#a78bfa', träning: '#22C55E', mat: '#F97316', reflektion: '#60a5fa', paus: '#6366F1' }
const catColor = (c) => {
  if (!c) return '#00d4aa'
  const k = Object.keys(CAT).find(k => c.toLowerCase().includes(k))
  return k ? CAT[k] : '#00d4aa'
}

const GLASS = {
  background: 'rgba(17,17,24,0.70)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
}

function decodeUnicode(str) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

function toMin(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function Countdown({ tasks }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const next = tasks.find(t => !t.done && toMin(t.start || t.period?.split('–')[0]?.trim()) > nowMin)
  if (!next) return null

  const nextMin = toMin(next.start || next.period?.split('–')[0]?.trim())
  const diff = Math.max(0, nextMin - nowMin)
  const hh = String(Math.floor(diff / 60)).padStart(2, '0')
  const mm = String(diff % 60).padStart(2, '0')
  const ss = String(59 - (tick % 60)).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...GLASS, borderRadius: 14, padding: '12px 16px', marginBottom: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid rgba(0,212,170,0.2)',
      }}
    >
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          T-MINUS TILL NÄSTA
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {decodeUnicode(next.title)}
        </div>
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700, color: '#00d4aa', letterSpacing: 2,
        fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
        textShadow: '0 0 20px rgba(0,212,170,0.5)',
      }}>
        {hh}:{mm}:{ss}
      </div>
    </motion.div>
  )
}

function CornerBrackets() {
  const s = { position: 'absolute', width: 10, height: 10, borderColor: 'rgba(0,212,170,0.3)' }
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderTop: '1px solid', borderLeft: '1px solid' }} />
      <div style={{ ...s, top: 0, right: 0, borderTop: '1px solid', borderRight: '1px solid' }} />
      <div style={{ ...s, bottom: 0, left: 0, borderBottom: '1px solid', borderLeft: '1px solid' }} />
      <div style={{ ...s, bottom: 0, right: 0, borderBottom: '1px solid', borderRight: '1px solid' }} />
    </>
  )
}

export default function Idag() {
  const today = new Date()
  const todayIso = formatLocalDate(today)
  const [date, setDate] = useState(todayIso)
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [tasks, setTasks] = useState([])
  const [timeframe, setTimeframe] = useState('Idag')
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [daysWithTasks, setDaysWithTasks] = useState(new Set())
  const week = getCurrentWeek()
  const location = useLocation()

  useEffect(() => {
    axios.get('/api/milestones').then(r => setMilestones(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => { loadSchedule(date) }, [date])

  useEffect(() => {
    loadMonthTasks(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const loadSchedule = async (d) => {
    setLoading(true)
    setExpanded(null)
    try {
      const res = await axios.get(`/api/schedule/${d}`)
      const raw = res.data.tasks || []
      const seen = new Set()
      const unique = raw.filter(t => {
        if (seen.has(t.title)) return false
        seen.add(t.title)
        return true
      })
      setTasks(unique.slice(0, 8))
      setTimeframe(res.data.timeframe || 'Schema')
    } catch { setTasks([]) }
    finally { setLoading(false) }
  }

  const loadMonthTasks = async (year, month) => {
    const days = getMonthDays(year, month)
    const daysSet = new Set()
    try {
      for (const day of days) {
        const res = await axios.get(`/api/schedule/${day.iso}`)
        if (res.data.tasks && res.data.tasks.length > 0) {
          daysSet.add(day.iso)
        }
      }
      setDaysWithTasks(daysSet)
    } catch {
      setDaysWithTasks(new Set())
    }
  }

  const toggleTask = async (i) => {
    const updated = tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t)
    setTasks(updated)
    await axios.put(`/api/schedule/${date}`, { tasks: updated })
  }

  const done = tasks.filter(t => t.done).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const isToday = date === todayIso
  const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
  const monthDays = getMonthDays(currentYear, currentMonth)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (dateStr) => {
    setDate(dateStr)
    setShowModal(true)
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100%', paddingBottom: 90 }}>
      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ padding: '18px 16px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', marginBottom: 6 }}>// DAGLIG BRIEFING</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 900, letterSpacing: -0.5, background: 'linear-gradient(135deg, #fff 0%, #00d4aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 2 }}>
              Schema
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: 0.5, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Klicka på en dag för att se dina uppgifter</p>
          </div>
        </div>
      </motion.div>

      <div style={{ padding: '16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <motion.button onClick={handlePrevMonth} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', fontSize: 18, cursor: 'pointer' }}>
            ←
          </motion.button>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <motion.button onClick={handleNextMonth} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', fontSize: 18, cursor: 'pointer' }}>
            →
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {DAY_LABELS.map(label => (
            <div key={label} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', padding: '8px 0' }}>
              {label}
            </div>
          ))}
          {monthDays.map((day, idx) => {
            if (!day.isCurrentMonth) {
              return <div key={idx} style={{ aspectRatio: '1' }} />
            }
            const hasTask = daysWithTasks.has(day.iso)
            const isSelected = date === day.iso
            return (
              <motion.button key={idx} onClick={() => handleDateClick(day.iso)} whileTap={{ scale: 0.9 }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  background: isSelected ? 'linear-gradient(135deg, #00d4aa, #a78bfa)' : day.isToday ? 'rgba(0,212,170,0.12)' : hasTask ? 'rgba(0,212,170,0.06)' : 'transparent',
                  border: day.isToday ? '1px solid rgba(0,212,170,0.3)' : isSelected ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  color: isSelected ? '#0A0A0F' : '#f1f5f9',
                  fontSize: 13,
                  fontWeight: isSelected || day.isToday ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {day.num}
                {hasTask && !isSelected && (
                  <div style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: '50%', background: '#00d4aa' }} />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'flex', alignItems: 'flex-end' }}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxHeight: '85vh', background: 'rgba(17,17,24,0.95)', borderRadius: '20px 20px 0 0', padding: '24px 16px', overflowY: 'auto', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
                    {new Date(date + 'T12:00:00').toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  {tasks.length > 0 && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {done}/{tasks.length} klara · {pct}% slutfört
                    </p>
                  )}
                </div>
                <motion.button onClick={() => setShowModal(false)} whileTap={{ scale: 0.9 }}
                  style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: 20, cursor: 'pointer' }}>
                  ✕
                </motion.button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 40 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.2, delay: i*0.2, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa' }} />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{ borderRadius: 14, padding: 24, textAlign: 'center', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)' }}>
                  <div style={{ fontSize: 12, letterSpacing: 1.5, color: 'rgba(0,212,170,0.5)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Inga uppgifter</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Ingen schema för denna dag</p>
                </motion.div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 2px' }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, color: 'rgba(0,212,170,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Uppgifter</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {tasks.map((task, i) => {
                      const c = catColor(task.category)
                      const isOpen = expanded === i
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                          style={{ ...GLASS, borderRadius: 12, marginBottom: 8, border: `1px solid ${task.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`, overflow: 'hidden', opacity: task.done ? 0.5 : 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: task.done ? '#475569' : c, boxShadow: !task.done ? `0 0 8px ${c}` : 'none' }} />
                            <button onClick={() => toggleTask(i)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: task.done ? 'rgba(0,212,170,0.2)' : 'transparent', border: `1.5px solid ${task.done ? '#00d4aa' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: task.done ? '0 0 10px rgba(0,212,170,0.3)' : 'none' }}>
                              {task.done && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></motion.svg>}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: task.done ? 'rgba(255,255,255,0.3)' : '#f1f5f9', textDecoration: task.done ? 'line-through' : 'none' }}>
                                {decodeUnicode(task.title)}
                              </div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                {task.period || (task.start && task.end ? `${task.start} — ${task.end}` : '')}
                              </div>
                            </div>
                            {(task.subtasks?.length > 0 || task.links?.length > 0) && (
                              <button onClick={() => setExpanded(isOpen ? null : i)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                {isOpen ? '▲' : '▼'}
                              </button>
                            )}
                          </div>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', padding: '0 14px 12px' }}>
                                {task.subtasks?.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase' }}>Delsteg</div>
                                    {task.subtasks.map((sub, si) => (
                                      <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00d4aa', marginTop: 5, flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, color: '#E2E8F0' }}>{decodeUnicode(sub)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {task.links?.length > 0 && (
                                  <div style={{ marginTop: task.subtasks?.length > 0 ? 10 : 8 }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase' }}>Resurser</div>
                                    {task.links.map((link, li) => (
                                      <a key={li} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 11, color: '#7DD3FC', textDecoration: 'none', marginBottom: 6, wordBreak: 'break-word' }}>
                                        {link.label || link.url}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 14px' }}>
        {milestones.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>// MÅNADSPLAN</p>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(0,212,170,0.3), transparent)' }} />
            </div>
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -1 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 300 }}
                style={{ ...GLASS, borderRadius: 14, marginBottom: 8, padding: '14px', position: 'relative' }}>
                <CornerBrackets />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#00d4aa', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 4, padding: '2px 8px', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                    {m.period || `Månad ${m.month}`}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>{decodeUnicode(m.title)}</span>
                </div>
                {m.goals?.map((g, gi) => (
                  <div key={gi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#a78bfa', marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{decodeUnicode(g)}</span>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "aidailyflow_habits";
const TODAY = new Date().toISOString().split("T")[0];

const DEFAULT_HABITS = [
  { id: 1, name: "Morgonrutin", emoji: "🌅", color: "#00d4aa", target: "08:00" },
  { id: 2, name: "Träning", emoji: "💪", color: "#a78bfa", target: "16:00" },
  { id: 3, name: "Lär dig något nytt", emoji: "📚", color: "#f59e0b", target: "12:00" },
  { id: 4, name: "Kvällsreflektion", emoji: "🌙", color: "#60a5fa", target: "21:00" },
];

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HABITS.map(h => ({ ...h, streak: 0, completedDates: [] }));
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HABITS.map(h => ({ ...h, streak: 0, completedDates: [] }));
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function getStreakColor(streak) {
  if (streak >= 30) return "#f59e0b";
  if (streak >= 14) return "#a78bfa";
  if (streak >= 7)  return "#00d4aa";
  return "#60a5fa";
}

function StreakFlame({ streak }) {
  if (streak === 0) return <span style={{ fontSize: 20, opacity: 0.3 }}>○</span>;
  const size = Math.min(28, 18 + streak * 0.3);
  const color = getStreakColor(streak);
  return (
    <motion.span
      key={streak}
      initial={{ scale: 1.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ fontSize: size, filter: `drop-shadow(0 0 6px ${color})` }}
    >
      🔥
    </motion.span>
  );
}

export default function Vanor() {
  const [habits, setHabits] = useState(loadHabits);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("⭐");
  const [showConfetti, setShowConfetti] = useState(null);

  const todayDone = habits.filter(h => h.completedDates?.includes(TODAY)).length;
  const allDone = todayDone === habits.length && habits.length > 0;

  useEffect(() => { saveHabits(habits); }, [habits]);

  function toggle(id) {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates?.includes(TODAY);
      const completedDates = done
        ? (h.completedDates || []).filter(d => d !== TODAY)
        : [...(h.completedDates || []), TODAY];

      let streak = 0;
      const sorted = [...completedDates].sort().reverse();
      let check = new Date(TODAY);
      for (const d of sorted) {
        const diff = Math.round((check - new Date(d)) / 86400000);
        if (diff === 0 || diff === 1) { streak++; check.setDate(check.getDate() - 1); }
        else break;
      }

      if (!done) setShowConfetti(id);
      return { ...h, completedDates, streak };
    }));
    setTimeout(() => setShowConfetti(null), 600);
  }

  function addHabit() {
    if (!newName.trim()) return;
    const newH = {
      id: Date.now(),
      name: newName.trim(),
      emoji: newEmoji,
      color: ["#00d4aa","#a78bfa","#f59e0b","#60a5fa","#f472b6"][Math.floor(Math.random()*5)],
      target: "09:00",
      streak: 0,
      completedDates: [],
    };
    setHabits(prev => [...prev, newH]);
    setNewName("");
    setNewEmoji("⭐");
    setAdding(false);
  }

  function deleteHabit(id) {
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  const card = {
    background: "rgba(17,17,24,0.70)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  };

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 500, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Vanor</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          {new Date().toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <motion.div
        style={{ ...card, padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <svg width={72} height={72} viewBox="0 0 72 72">
          <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <motion.circle
            cx={36} cy={36} r={30} fill="none"
            stroke={allDone ? "#f59e0b" : "#00d4aa"} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 30}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
            animate={{ strokeDashoffset: habits.length === 0 ? 2 * Math.PI * 30 : 2 * Math.PI * 30 * (1 - todayDone / habits.length) }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            transform="rotate(-90 36 36)"
            style={{ filter: allDone ? "drop-shadow(0 0 8px #f59e0b)" : "drop-shadow(0 0 8px #00d4aa)" }}
          />
          <text x={36} y={40} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={700}>
            {todayDone}/{habits.length}
          </text>
        </svg>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
            {allDone ? "🎉 Alla gjorda idag!" : `${habits.length - todayDone} kvar idag`}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Bästa streak: <span style={{ color: "#00d4aa", fontWeight: 600 }}>
              {Math.max(0, ...habits.map(h => h.streak || 0))} dagar
            </span>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {habits.map((habit, i) => {
            const done = habit.completedDates?.includes(TODAY);
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, y: -1 }}
                style={{
                  ...card, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer",
                  borderLeft: `3px solid ${done ? habit.color : "rgba(255,255,255,0.1)"}`,
                  opacity: done ? 0.7 : 1,
                  position: "relative", overflow: "hidden",
                }}
                onClick={() => toggle(habit.id)}
              >
                {showConfetti === habit.id && (
                  <motion.div
                    initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${habit.color}33, transparent)`, pointerEvents: "none" }}
                  />
                )}
                <motion.div whileTap={{ scale: 0.85 }} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `2px solid ${done ? habit.color : "rgba(255,255,255,0.2)"}`,
                  background: done ? `${habit.color}22` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: done ? `0 0 10px ${habit.color}66` : "none",
                }}>
                  {done && (
                    <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} width={14} height={14} viewBox="0 0 14 14">
                      <motion.path d="M2 7l4 4 6-6" fill="none" stroke={habit.color} strokeWidth={2} strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
                    </motion.svg>
                  )}
                </motion.div>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{habit.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
                    {habit.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{habit.target}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  <StreakFlame streak={habit.streak || 0} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: getStreakColor(habit.streak || 0) }}>{habit.streak || 0}d</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={e => { e.stopPropagation(); deleteHabit(habit.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: 16, padding: "4px 6px", flexShrink: 0 }}>
                  ×
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 16 }}>
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ ...card, padding: 16, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
                  style={{ width: 48, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 20, textAlign: "center", padding: 6 }} />
                <input autoFocus placeholder="Ny vana..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()}
                  style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, padding: "8px 12px", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addHabit} style={{ flex: 1, background: "#00d4aa", border: "none", borderRadius: 10, color: "#0a0a12", fontWeight: 700, fontSize: 14, padding: "10px 0", cursor: "pointer" }}>Lägg till</button>
                <button onClick={() => setAdding(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 14, padding: "10px 0", cursor: "pointer" }}>Avbryt</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!adding && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setAdding(true)}
            style={{ width: "100%", padding: "14px 0", background: "rgba(0,212,170,0.08)", border: "1px dashed rgba(0,212,170,0.3)", borderRadius: 16, color: "#00d4aa", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>+</span> Ny vana
          </motion.button>
        )}
      </div>
    </div>
  );
}
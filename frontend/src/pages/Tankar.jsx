import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "aidailyflow_tankar";
const MOODS = [
  { emoji: "😤", label: "Frustrad", value: 1, color: "#ef4444" },
  { emoji: "😐", label: "Neutral",  value: 2, color: "#94a3b8" },
  { emoji: "🙂", label: "Okej",     value: 3, color: "#60a5fa" },
  { emoji: "😊", label: "Bra",      value: 4, color: "#00d4aa" },
  { emoji: "🔥", label: "Peppad",   value: 5, color: "#f59e0b" },
];

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" });
}

const card = {
  background: "rgba(17,17,24,0.70)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

async function analyzeWithClaude(entries) {
  const last7 = entries.slice(0, 7);
  const text = last7.map(e => `${e.date} [${MOODS.find(m => m.value === e.mood)?.label}]: ${e.text}`).join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Du är en personlig coach. Analysera dessa dagboksinlägg på svenska och ge en kort, varm och konstruktiv sammanfattning (max 3 meningar). Lyft fram ett mönster och ett konkret nästa steg. Svara BARA med analysen, ingen rubrik.\n\n${text}`
      }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Kunde inte analysera just nu.";
}

export default function Tankar() {
  const [entries, setEntries] = useState(loadEntries);
  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState("write");
  const textRef = useRef(null);

  useEffect(() => { saveEntries(entries); }, [entries]);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }),
      text: text.trim(),
      mood,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    setText("");
    setMood(3);
    setSaving(false);
    if (updated.length >= 3) {
      setAnalyzing(true);
      try {
        const result = await analyzeWithClaude(updated);
        setAnalysis(result);
      } catch { setAnalysis(""); }
      setAnalyzing(false);
    }
  }

  async function runAnalysis() {
    if (entries.length < 2) return;
    setAnalyzing(true);
    try {
      const result = await analyzeWithClaude(entries);
      setAnalysis(result);
    } catch { setAnalysis("Kunde inte analysera just nu."); }
    setAnalyzing(false);
  }

  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
    : null;

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 500, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Tankar</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
            {new Date().toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {avgMood && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22 }}>{MOODS.find(m => m.value === Math.round(avgMood))?.emoji}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>snitt {avgMood}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["write", "history"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "10px 0",
            background: view === v ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${view === v ? "rgba(0,212,170,0.4)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12, cursor: "pointer",
            color: view === v ? "#00d4aa" : "rgba(255,255,255,0.5)",
            fontSize: 13, fontWeight: 600,
          }}>
            {v === "write" ? "✏️ Skriv" : `📖 Historik (${entries.length})`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "write" && (
          <motion.div key="write" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <motion.div style={{ ...card, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                Hur mår du?
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {MOODS.map(m => (
                  <motion.button key={m.value} whileTap={{ scale: 0.85 }} onClick={() => setMood(m.value)} style={{
                    background: mood === m.value ? `${m.color}22` : "transparent",
                    border: `2px solid ${mood === m.value ? m.color : "transparent"}`,
                    borderRadius: 12, padding: "8px 6px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    boxShadow: mood === m.value ? `0 0 12px ${m.color}44` : "none",
                  }}>
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <span style={{ fontSize: 10, color: mood === m.value ? m.color : "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                      {m.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div style={{ ...card, padding: 16, marginBottom: 12 }}>
              <textarea
                ref={textRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Vad tänker du på just nu? Det kan vara vad som helst..."
                rows={5}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  color: "#fff", fontSize: 15, lineHeight: 1.7, resize: "none",
                  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  caretColor: "#00d4aa",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{text.length} tecken</span>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={save}
                  disabled={saving || !text.trim()} style={{
                    background: text.trim() ? "#00d4aa" : "rgba(255,255,255,0.1)",
                    border: "none", borderRadius: 10, padding: "8px 20px",
                    color: text.trim() ? "#0a0a12" : "rgba(255,255,255,0.3)",
                    fontWeight: 700, fontSize: 14, cursor: text.trim() ? "pointer" : "default",
                  }}>
                  {saving ? "Sparar..." : "Spara"}
                </motion.button>
              </div>
            </motion.div>

            {entries.length >= 2 && (
              <motion.div style={{ ...card, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: analysis ? 12 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>AI-analys</div>
                  <button onClick={runAnalysis} disabled={analyzing} style={{
                    background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
                    borderRadius: 8, padding: "5px 12px", color: "#a78bfa",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                    {analyzing ? "Analyserar..." : "Analysera"}
                  </button>
                </div>
                {analyzing && (
                  <div style={{ display: "flex", gap: 6, padding: "8px 0" }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} />
                    ))}
                  </div>
                )}
                {analysis && !analyzing && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, fontStyle: "italic" }}>
                    "{analysis}"
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {view === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
                Inga inlägg ännu.<br />
                <span style={{ fontSize: 13, marginTop: 8, display: "block" }}>Börja skriva dina tankar!</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {entries.map((entry, i) => {
                  const m = MOODS.find(m => m.value === entry.mood);
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ ...card, padding: 16, borderLeft: `3px solid ${m?.color || "#00d4aa"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{m?.emoji}</span>
                          <span style={{ fontSize: 12, color: m?.color, fontWeight: 600 }}>{m?.label}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                          {formatDate(entry.date)} · {entry.time}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
                        {entry.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
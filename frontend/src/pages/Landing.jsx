import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: (i * 41 + 7) % 100, y: (i * 53 + 11) % 100,
    s: ((i * 13) % 3) * 0.6 + 0.4,
    d: ((i * 7) % 30) / 10,
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

function ScanLine() {
  return (
    <motion.div
      initial={{ y: -200 }} animate={{ y: "110vh" }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      style={{ position: "absolute", left: 0, right: 0, height: 120, pointerEvents: "none", background: "linear-gradient(180deg, transparent, rgba(0,212,170,0.03), transparent)", zIndex: 2 }}
    />
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

function TypeWriter({ text, delay = 0, speed = 28 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let timeout;
    const t = setTimeout(() => {
      let i = 0;
      const tick = () => {
        if (i <= text.length) { setDisplayed(text.slice(0, i)); i++; timeout = setTimeout(tick, speed); }
        else setDone(true);
      };
      tick();
    }, delay);
    return () => { clearTimeout(t); clearTimeout(timeout); };
  }, [text, delay, speed]);
  return <span>{displayed}{!done && <span style={{ animation: "blink 0.8s step-end infinite" }}>_</span>}</span>;
}

function getWeekNumber() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

export default function Landing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [bootLines, setBootLines] = useState([]);

  const BOOT = [
    { text: "// INITIATING AIDAILYFLOW v2.0 ...", delay: 200 },
    { text: "// LOADING USER PROFILE .......... OK", delay: 700 },
    { text: "// SYNCING SCHEDULE .............. OK", delay: 1100 },
    { text: "// CONNECTING AI AGENT ........... OK", delay: 1500 },
    { text: "// SYSTEM READY", delay: 1900, highlight: true },
  ];

  useEffect(() => {
    BOOT.forEach((line, i) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (i === BOOT.length - 1) {
          setTimeout(() => setPhase(1), 500);
          setTimeout(() => setPhase(2), 1600);
        }
      }, line.delay);
    });
  }, []);

  const dateStr = new Date().toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 10%, #0d1a2e 0%, #080810 50%, #050508 100%)",
      color: "#f1f5f9",
      fontFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "20px 24px",
    }}>
      <Stars />
      <ScanLine />

      {/* Orbs */}
      <div style={{ position: "absolute", top: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 1 }} />

      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.12, backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.5) 0.6px, transparent 1px)", backgroundSize: "24px 24px", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 460 }}>

        {/* Boot sequence */}
        <AnimatePresence>
          {phase < 1 && (
            <motion.div exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} style={{ marginBottom: 20 }}>
              {bootLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  style={{ fontSize: 11, letterSpacing: 1.2, marginBottom: 6, color: line.highlight ? "#00d4aa" : "rgba(148,163,184,0.55)", textShadow: line.highlight ? "0 0 12px rgba(0,212,170,0.5)" : "none" }}>
                  {line.text}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main card */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", background: "rgba(10,10,20,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 20, padding: "32px 28px 28px", boxShadow: "0 0 60px rgba(0,212,170,0.06), 0 24px 48px rgba(0,0,0,0.5)" }}
            >
              <CornerBrackets />

              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 2.2, color: "rgba(0,212,170,0.6)", textTransform: "uppercase", marginBottom: 28 }}>
                <span>AiDailyFlow // v2.0</span>
                <span>{dateStr}</span>
              </div>

              {/* Hero title */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <motion.div
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.06em" }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 62, fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg, #ffffff 0%, #00d4aa 50%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}
                >
                  AiDaily<br />Flow
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 10 }}>
                  Din personliga AI-coach
                </motion.div>
              </div>

              {/* Divider */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.4), rgba(167,139,250,0.4), transparent)", marginBottom: 24 }} />

              {/* Status grid */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { label: "STATUS", value: "ONLINE", color: "#00d4aa", pulse: true },
                  { label: "VECKA", value: `V.${getWeekNumber()}`, color: "#a78bfa" },
                  { label: "AGENT", value: "AKTIV", color: "#f59e0b" },
                  { label: "STREAK", value: "DAG 1", color: "#60a5fa" },
                ].map((item) => (
                  <div key={item.label} style={{ position: "relative", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${item.pulse ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
                    <div style={{ fontSize: 8.5, letterSpacing: 2, color: "#64748b", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: item.color, letterSpacing: 1, textShadow: item.pulse ? `0 0 14px ${item.color}` : "none" }}>{item.value}</div>
                    {item.pulse && <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ position: "absolute", top: 12, right: 12, width: 6, height: 6, borderRadius: 999, background: item.color, boxShadow: `0 0 8px ${item.color}` }} />}
                  </div>
                ))}
              </motion.div>

              {/* Coach quote */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                style={{ borderLeft: "2px solid rgba(0,212,170,0.4)", paddingLeft: 14, marginBottom: 28 }}>
                <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
                  {phase >= 2 && <TypeWriter text={`"Välkommen. Din plan är redo. Låt oss bygga något riktigt solitt — ett steg i taget."`} delay={300} />}
                </div>
                <div style={{ fontSize: 9.5, color: "#475569", marginTop: 8, letterSpacing: 1.6, textTransform: "uppercase" }}>— Flow, din AI-coach</div>
              </motion.div>

              {/* Pricing */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase", marginBottom: 4 }}>
                    ✦ 7 dagar gratis
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>
                    Sedan 99 kr/månad · Avsluta när som helst
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>99<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}> kr/mån</span></div>
                </div>
              </motion.div>

              {/* Buttons */}
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,212,170,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/auth")}
                      style={{ width: "100%", padding: "16px 0", background: "linear-gradient(135deg, rgba(0,212,170,0.2), rgba(167,139,250,0.2))", border: "1px solid rgba(0,212,170,0.4)", borderRadius: 14, cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "inherit", boxShadow: "0 0 20px rgba(0,212,170,0.1)", marginBottom: 8 }}>
                      ▶ &nbsp; Kom igång
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/idag")}
                      style={{ width: "100%", padding: "12px 0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "inherit" }}>
                      Fortsätt direkt →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 9, letterSpacing: 1.8, color: "#334155", textTransform: "uppercase" }}>
                <span>Powered by Claude AI</span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: "#00d4aa" }}>● LIVE</motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}
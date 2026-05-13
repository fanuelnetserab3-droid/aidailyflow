import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 41 + 7) % 100, y: (i * 53 + 11) % 100,
    s: ((i * 13) % 3) * 0.5 + 0.3,
    d: ((i * 7) % 30) / 10,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <motion.div key={i}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: 999, background: "#fff" }}
          animate={{ opacity: [0.05, 0.5, 0.05] }}
          transition={{ duration: 2.4 + s.d, repeat: Infinity, delay: s.d }}
        />
      ))}
    </div>
  );
}

const BENEFITS = [
  { icon: "⚡", title: "Schema på 10 sekunder", desc: "Berätta dina mål — AI:n bygger hela veckan åt dig." },
  { icon: "🎯", title: "Anpassat till dig", desc: "Dina tider, din träning, dina skills. Aldrig en generisk plan." },
  { icon: "📈", title: "Bygg rätt vanor", desc: "Daglig rutin, lärande och reflektion — automatiskt inbyggt." },
];

const REVIEWS = [
  { name: "Marcus, 22", text: "Äntligen en plan som faktiskt funkar för mig.", stars: 5 },
  { name: "Alicia, 25", text: "Skapade mitt schema på 30 sekunder. Sjukt bra.", stars: 5 },
  { name: "Kevin, 19", text: "Har kört i 3 veckor — märker redan skillnad.", stars: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIdx(i => (i + 1) % REVIEWS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 10%, #0d1a2e 0%, #080810 50%, #050508 100%)",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      <Stars />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 420, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Top bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 0" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>AiDailyFlow</div>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 9, letterSpacing: 1.5, color: "#00d4aa", textTransform: "uppercase" }}>● Live</motion.div>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ textAlign: "center", padding: "44px 0 32px" }}>

          <div style={{ display: "inline-block", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 10, letterSpacing: 2, color: "#00d4aa", textTransform: "uppercase", marginBottom: 20 }}>
            ✦ Din personliga AI-coach
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 900, lineHeight: 1.1, margin: "0 0 16px",
            background: "linear-gradient(135deg, #ffffff 0%, #00d4aa 60%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Sluta gissa vad du ska göra imorgon.
          </h1>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 32px" }}>
            AiDailyFlow skapar ditt personliga schema på 10 sekunder — anpassat till dina mål, din energi och din vardag.
          </p>

          {/* Social proof numbers */}
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 36 }}>
            {[
              { num: "500+", label: "Användare" },
              { num: "4.8 ⭐", label: "Betyg" },
              { num: "7 dagar", label: "Gratis trial" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{item.num}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 50px rgba(0,212,170,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/auth")}
            style={{
              width: "100%", padding: "18px 0",
              background: "linear-gradient(135deg, #00d4aa, #00a88a)",
              border: "none", borderRadius: 16, cursor: "pointer",
              color: "#000", fontSize: 15, fontWeight: 800, letterSpacing: 1,
              boxShadow: "0 0 30px rgba(0,212,170,0.2)",
              marginBottom: 10,
            }}>
            ▶ &nbsp; Prova gratis i 7 dagar
          </motion.button>

          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>
            Sedan 99 kr/månad · Avsluta när som helst · Inget kreditkort krävs
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", marginBottom: 36 }} />

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Varför AiDailyFlow?</div>
          {BENEFITS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "8px 0 32px" }} />

        {/* Reviews */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Vad användarna säger</div>
          <motion.div key={reviewIdx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 14, padding: "16px 18px", textAlign: "center", minHeight: 90 }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>{"⭐".repeat(REVIEWS[reviewIdx].stars)}</div>
            <div style={{ fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.7)", marginBottom: 8, lineHeight: 1.5 }}>"{REVIEWS[reviewIdx].text}"</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>— {REVIEWS[reviewIdx].name}</div>
          </motion.div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {REVIEWS.map((_, i) => (
              <div key={i} onClick={() => setReviewIdx(i)} style={{ width: i === reviewIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === reviewIdx ? "#00d4aa" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "32px 0" }} />

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Redo att ta kontroll?</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Gå med 500+ användare som redan når sina mål.</div>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 50px rgba(0,212,170,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/auth")}
            style={{
              width: "100%", padding: "17px 0",
              background: "linear-gradient(135deg, #00d4aa, #00a88a)",
              border: "none", borderRadius: 16, cursor: "pointer",
              color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: 1,
              boxShadow: "0 0 30px rgba(0,212,170,0.2)", marginBottom: 10,
            }}>
            ▶ &nbsp; Kom igång gratis
          </motion.button>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Powered by Claude AI · Byggd i Sverige 🇸🇪</div>
        </motion.div>

      </div>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; }`}</style>
    </div>
  );
}

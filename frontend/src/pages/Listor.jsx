import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "aidailyflow_listor";

const PRESET_LISTS = [
  {
    id: 1, name: "Handla", emoji: "🛒", color: "#00d4aa",
    items: [
      { id: 101, text: "Havregryn", done: false },
      { id: 102, text: "Ägg", done: false },
      { id: 103, text: "Bananer", done: false },
    ]
  },
  {
    id: 2, name: "Jobb & mål", emoji: "🎯", color: "#a78bfa",
    items: [
      { id: 201, text: "Uppdatera LinkedIn-profil", done: false },
      { id: 202, text: "Skicka ansökan till Outlier", done: false },
    ]
  },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : PRESET_LISTS;
  } catch { return PRESET_LISTS; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const card = {
  background: "rgba(17,17,24,0.70)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

const COLORS = ["#00d4aa","#a78bfa","#f59e0b","#60a5fa","#f472b6","#34d399"];
const EMOJIS = ["📝","🛒","🎯","💡","🏋️","📚","💰","🏠","✈️","🎮"];

export default function Listor() {
  const [lists, setLists] = useState(load);
  const [activeList, setActiveList] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListEmoji, setNewListEmoji] = useState("📝");
  const [newListColor, setNewListColor] = useState(COLORS[0]);

  useEffect(() => { save(lists); }, [lists]);

  const active = lists.find(l => l.id === activeList);

  function toggleItem(listId, itemId) {
    setLists(prev => prev.map(l => l.id !== listId ? l : {
      ...l,
      items: l.items.map(i => i.id !== itemId ? i : { ...i, done: !i.done })
    }));
  }

  function addItem() {
    if (!newItem.trim() || !activeList) return;
    setLists(prev => prev.map(l => l.id !== activeList ? l : {
      ...l,
      items: [...l.items, { id: Date.now(), text: newItem.trim(), done: false }]
    }));
    setNewItem("");
  }

  function deleteItem(listId, itemId) {
    setLists(prev => prev.map(l => l.id !== listId ? l : {
      ...l, items: l.items.filter(i => i.id !== itemId)
    }));
  }

  function deleteList(listId) {
    setLists(prev => prev.filter(l => l.id !== listId));
    if (activeList === listId) setActiveList(null);
  }

  function createList() {
    if (!newListName.trim()) return;
    const newL = {
      id: Date.now(),
      name: newListName.trim(),
      emoji: newListEmoji,
      color: newListColor,
      items: [],
    };
    setLists(prev => [...prev, newL]);
    setNewListName("");
    setNewListEmoji("📝");
    setNewListColor(COLORS[0]);
    setAddingList(false);
    setActiveList(newL.id);
  }

  function clearDone(listId) {
    setLists(prev => prev.map(l => l.id !== listId ? l : {
      ...l, items: l.items.filter(i => !i.done)
    }));
  }

  if (!activeList) return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 500, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Listor</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          {lists.length} listor · {lists.reduce((s, l) => s + l.items.filter(i => !i.done).length, 0)} kvar totalt
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {lists.map((list, i) => {
            const done = list.items.filter(i => i.done).length;
            const total = list.items.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <motion.div key={list.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, y: -1 }} onClick={() => setActiveList(list.id)}
                style={{ ...card, padding: "16px 18px", cursor: "pointer", borderLeft: `3px solid ${list.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 26 }}>{list.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{list.name}</div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                        style={{ height: "100%", background: list.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{done}/{total} klara</div>
                  </div>
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>›</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 16 }}>
        <AnimatePresence>
          {addingList && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={{ ...card, padding: 16, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={newListEmoji} onChange={e => setNewListEmoji(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 18, padding: "6px 8px" }}>
                  {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <input autoFocus placeholder="Listnamn..." value={newListName}
                  onChange={e => setNewListName(e.target.value)} onKeyDown={e => e.key === "Enter" && createList()}
                  style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, padding: "8px 12px", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewListColor(c)}
                    style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: `3px solid ${newListColor === c ? "#fff" : "transparent"}`, cursor: "pointer", padding: 0 }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={createList} style={{ flex: 1, background: "#00d4aa", border: "none", borderRadius: 10, color: "#0a0a12", fontWeight: 700, fontSize: 14, padding: "10px 0", cursor: "pointer" }}>Skapa</button>
                <button onClick={() => setAddingList(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 14, padding: "10px 0", cursor: "pointer" }}>Avbryt</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!addingList && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setAddingList(true)}
            style={{ width: "100%", padding: "14px 0", background: "rgba(0,212,170,0.08)", border: "1px dashed rgba(0,212,170,0.3)", borderRadius: 16, color: "#00d4aa", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>+</span> Ny lista
          </motion.button>
        )}
      </div>
    </div>
  );

  const donePct = active.items.length === 0 ? 0 : Math.round((active.items.filter(i => i.done).length / active.items.length) * 100);
  const doneItems = active.items.filter(i => i.done);

  return (
    <div style={{ padding: "20px 16px 100px", maxWidth: 500, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveList(null)}
          style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "#fff", fontSize: 18, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</motion.button>
        <span style={{ fontSize: 26 }}>{active.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>{active.name}</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{active.items.filter(i => !i.done).length} kvar</div>
        </div>
        {doneItems.length > 0 && (
          <button onClick={() => clearDone(active.id)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>Rensa klara</button>
        )}
        <button onClick={() => deleteList(active.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, color: "#ef4444", fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>Ta bort</button>
      </div>

      <div style={{ ...card, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Framsteg</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: active.color }}>{donePct}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <motion.div animate={{ width: `${donePct}%` }} transition={{ duration: 0.5 }}
            style={{ height: "100%", background: active.color, borderRadius: 4, boxShadow: `0 0 8px ${active.color}66` }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        <AnimatePresence>
          {active.items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }} transition={{ delay: i * 0.03 }}
              style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", opacity: item.done ? 0.5 : 1 }}
              onClick={() => toggleItem(active.id, item.id)}>
              <motion.div whileTap={{ scale: 0.8 }} style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${item.done ? active.color : "rgba(255,255,255,0.2)"}`,
                background: item.done ? `${active.color}22` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: item.done ? `0 0 8px ${active.color}66` : "none",
              }}>
                {item.done && (
                  <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} width={12} height={12} viewBox="0 0 12 12">
                    <motion.path d="M2 6l3 3 5-5" fill="none" stroke={active.color} strokeWidth={2} strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
                  </motion.svg>
                )}
              </motion.div>
              <span style={{ flex: 1, fontSize: 15, color: "#fff", textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
              <button onClick={e => { e.stopPropagation(); deleteItem(active.id, item.id); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 16, cursor: "pointer", padding: "2px 6px" }}>×</button>
            </motion.div>
          ))}
        </AnimatePresence>
        {active.items.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Listan är tom — lägg till något!</div>
        )}
      </div>

      <div style={{ ...card, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <input placeholder="Lägg till..." value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", caretColor: active.color }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={addItem}
          style={{ background: newItem.trim() ? active.color : "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, color: newItem.trim() ? "#0a0a12" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 13, padding: "8px 14px", cursor: "pointer", transition: "all 0.2s" }}>
          + Lägg till
        </motion.button>
      </div>
    </div>
  );
}
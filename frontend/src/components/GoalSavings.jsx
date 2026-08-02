import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";

// ─── helpers ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "spendwise_goals";

const loadGoals = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const saveGoals = (goals) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

const PRESET_GOALS = [
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>, label: "Headphones", amount: 2000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, label: "Trip", amount: 5000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, label: "Gaming", amount: 3500 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, label: "Phone", amount: 8000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>, label: "Sneakers", amount: 3000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, label: "Laptop", amount: 40000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>, label: "Books", amount: 1000 },
  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, label: "Pizza Party", amount: 500 },
];

const FOOD_SKIP_AMOUNT = 120;

const nudge = (goal) => {
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return "Goal complete! Congratulations!";
  const skips = Math.ceil(remaining / FOOD_SKIP_AMOUNT);
  const days  = Math.ceil(remaining / (goal.target * 0.1));
  if (skips <= 10)
    return `Skip ${skips} food order${skips > 1 ? "s" : ""} to reach your goal faster`;
  return `Save ₹${Math.round(goal.target * 0.1)} per day — done in ${days} days`;
};

const pct = (saved, target) => Math.min(100, Math.round((saved / target) * 100));

const COLORS = [
  { dot: "#7c3aed", bar: "linear-gradient(90deg,#7c3aed,#a78bfa)", bg: "#f5f3ff", border: "#ddd6fe" },
  { dot: "#0ea5e9", bar: "linear-gradient(90deg,#0ea5e9,#38bdf8)", bg: "#f0f9ff", border: "#bae6fd" },
  { dot: "#10b981", bar: "linear-gradient(90deg,#10b981,#34d399)", bg: "#f0fdf4", border: "#bbf7d0" },
  { dot: "#f59e0b", bar: "linear-gradient(90deg,#f59e0b,#fbbf24)", bg: "#fffbeb", border: "#fde68a" },
  { dot: "#ef4444", bar: "linear-gradient(90deg,#ef4444,#f87171)", bg: "#fef2f2", border: "#fecaca" },
  { dot: "#ec4899", bar: "linear-gradient(90deg,#ec4899,#f472b6)", bg: "#fdf2f8", border: "#fbcfe8" },
];

// ─── GoalCard ────────────────────────────────────────────────────────────────
function GoalCard({ goal, index, onAdd, onDelete }) {
  const p      = pct(goal.saved, goal.target);
  const col    = COLORS[index % COLORS.length];
  const done   = goal.saved >= goal.target;
  const [adding, setAdding] = useState(false);
  const [amt, setAmt]       = useState("");
  const [hovered, setHovered] = useState(false);

  const handleAdd = () => {
    const n = parseFloat(amt);
    if (!n || n <= 0) return;
    onAdd(goal.id, n);
    setAmt(""); setAdding(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid #e8eaf0",
        boxShadow: hovered
          ? "0 8px 32px rgba(0,0,0,0.10)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* color accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: col.bar, borderRadius: "20px 20px 0 0",
      }} />

      {/* delete */}
      <button onClick={() => onDelete(goal.id)} style={{
        position: "absolute", top: 14, right: 14,
        background: hovered ? "#f1f5f9" : "none",
        border: "none", cursor: "pointer",
        width: 26, height: 26, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", transition: "background 0.15s",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, marginTop: 6 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: col.bg, border: `1.5px solid ${col.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: col.dot, flexShrink: 0,
        }}>
          {goal.iconSvg
            ? <span style={{ color: col.dot }}>{goal.iconSvg}</span>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{goal.label}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {goal.deadline ? `Due: ${goal.deadline}` : "No deadline"}
          </div>
        </div>
        {done && (
          <div style={{
            background: "#dcfce7", color: "#16a34a",
            fontSize: 11, fontWeight: 700, padding: "4px 10px",
            borderRadius: 20, fontFamily: "'Poppins', sans-serif",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Done!
          </div>
        )}
      </div>

      {/* amounts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: col.dot, fontFamily: "'Poppins', sans-serif" }}>₹{goal.saved.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>of ₹{goal.target.toLocaleString()}</span>
      </div>

      {/* progress bar */}
      <div style={{ height: 7, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
        <div style={{
          height: "100%", width: `${p}%`,
          background: done ? "linear-gradient(90deg,#10b981,#34d399)" : col.bar,
          borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14, textAlign: "right", fontFamily: "'Inter', sans-serif" }}>{p}% saved</div>

      {/* nudge */}
      {!done && (
        <div style={{
          background: col.bg, border: `1px solid ${col.border}`,
          borderRadius: 10, padding: "9px 12px",
          fontSize: 12, color: "#475569", marginBottom: 14, lineHeight: 1.55,
          fontFamily: "'Inter', sans-serif",
          display: "flex", alignItems: "flex-start", gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {nudge(goal)}
        </div>
      )}

      {/* add money */}
      {!done && (
        adding ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="₹ Amount"
              value={amt}
              onChange={e => setAmt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              autoFocus
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: `1.5px solid ${col.dot}`, fontSize: 13,
                outline: "none", background: "#f8fafc",
                fontFamily: "'Inter', sans-serif", color: "#0f172a",
              }}
            />
            <button onClick={handleAdd} style={{
              background: col.dot, color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}>Add</button>
            <button onClick={() => setAdding(false)} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            width: "100%", background: col.bg,
            border: `1.5px solid ${col.border}`, color: col.dot,
            borderRadius: 9, padding: "9px 0",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "background 0.15s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col.dot} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Money
          </button>
        )
      )}
    </div>
  );
}

// ─── AddGoalModal ────────────────────────────────────────────────────────────
function AddGoalModal({ onClose, onSave }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [label,    setLabel]    = useState("");
  const [target,   setTarget]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [saved,    setSaved]    = useState("");

  const handlePreset = (p, i) => {
    setSelectedPreset(i);
    setLabel(p.label);
    setTarget(String(p.amount));
  };

  const handleSave = () => {
    if (!label || !target) return;
    const preset = selectedPreset !== null ? PRESET_GOALS[selectedPreset] : null;
    onSave({
      id:        Date.now(),
      iconSvg:   preset ? React.cloneElement(preset.icon, { width: 22, height: 22 }) : null,
      label,
      target:    parseFloat(target),
      saved:     parseFloat(saved) || 0,
      deadline:  deadline || null,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e8eaf0", fontSize: 13,
    background: "#f8fafc", outline: "none", boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif", color: "#0f172a",
    transition: "border 0.15s",
  };
  const labelStyle = {
    fontSize: 12, color: "#64748b", marginBottom: 5,
    fontWeight: 600, fontFamily: "'Poppins', sans-serif",
    display: "block",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 24,
        width: "100%", maxWidth: 460,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        padding: "30px 30px 26px",
        animation: "modalIn 0.2s cubic-bezier(0.4,0,0.2,1)",
      }} onClick={e => e.stopPropagation()}>

        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:none; } }`}</style>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'Poppins', sans-serif" }}>New Saving Goal</div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "#f1f5f9", border: "none", cursor: "pointer", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 22, fontFamily: "'Inter', sans-serif", marginLeft: 46 }}>Set a goal and track your progress</div>

        {/* Presets */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 9, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "'Poppins', sans-serif" }}>Quick Presets</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
          {PRESET_GOALS.map((p, i) => (
            <button key={p.label} onClick={() => handlePreset(p, i)} style={{
              background: selectedPreset === i ? "#7c3aed" : "#f8fafc",
              color: selectedPreset === i ? "#fff" : "#475569",
              border: `1.5px solid ${selectedPreset === i ? "#7c3aed" : "#e8eaf0"}`,
              borderRadius: 20, padding: "5px 13px",
              fontSize: 12, cursor: "pointer", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
            }}>
              <span style={{ color: selectedPreset === i ? "#fff" : "#7c3aed" }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Goal name */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Goal Name</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Dream Vacation"
            style={inputStyle}
          />
        </div>

        {/* Target + Saved */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Target Amount (₹)</label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              placeholder="2000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Already Saved (₹)</label>
            <input type="number" value={saved} onChange={e => setSaved(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Deadline <span style={{ color: "#c4c9d4", fontWeight: 400 }}>(optional)</span></label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            background: "#f1f5f9", border: "none",
            color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "11px 0", borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            fontFamily: "'Poppins', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function GoalSavings() {
  const navigate = useNavigate();
  const [goals, setGoals]     = useState(loadGoals);
  const [showModal, setModal] = useState(false);

  useEffect(() => saveGoals(goals), [goals]);

  const addGoal    = (g)     => setGoals(prev => [g, ...prev]);
  const deleteGoal = (id)    => setGoals(prev => prev.filter(g => g.id !== id));
  const addMoney   = (id, n) =>
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.target, g.saved + n) } : g
    ));

  const totalTarget = goals.reduce((a, g) => a + g.target, 0);
  const totalSaved  = goals.reduce((a, g) => a + g.saved, 0);
  const completed   = goals.filter(g => g.saved >= g.target).length;
  const overallPct  = totalTarget > 0 ? pct(totalSaved, totalTarget) : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" }}>
      <style>{GLOBAL_CSS}{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Sidebar active="/goals" navigate={navigate} user={null} />

      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
              Goal-Based Savings
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0", fontFamily: "'Inter', sans-serif" }}>
              Save smart, spend smarter — track every goal in one place
            </p>
          </div>
          <button onClick={() => setModal(true)} style={{
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none", color: "#fff",
            borderRadius: 10, padding: "10px 20px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            display: "flex", alignItems: "center", gap: 7,
            transition: "box-shadow 0.2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Goal
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
          {[
            {
              label: "Total Goals", value: goals.length, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            },
            {
              label: "Total Saved", value: `₹${totalSaved.toLocaleString()}`, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            },
            {
              label: "Goals Achieved", value: `${completed} / ${goals.length}`, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            },
          ].map((c, i) => (
            <StatCard key={i} {...c} />
          ))}
        </div>

        {/* Overall progress */}
        {goals.length > 0 && (
          <OverallProgressCard totalSaved={totalSaved} totalTarget={totalTarget} overallPct={overallPct} />
        )}

        {/* Goals grid */}
        {goals.length === 0 ? (
          <EmptyState onNew={() => setModal(true)} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {goals.map((g, i) => (
              <GoalCard key={g.id} goal={g} index={i} onAdd={addMoney} onDelete={deleteGoal} />
            ))}
          </div>
        )}
      </div>

      {showModal && <AddGoalModal onClose={() => setModal(false)} onSave={addGoal} />}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, border, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1.5px solid #e8eaf0",
        borderRadius: 16, padding: "18px 20px",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.10)"
          : "0 2px 10px rgba(0,0,0,0.05)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Poppins', sans-serif" }}>{value}</div>
    </div>
  );
}

// ─── OverallProgressCard ─────────────────────────────────────────────────────
function OverallProgressCard({ totalSaved, totalTarget, overallPct }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1.5px solid #e8eaf0",
        borderRadius: 18, padding: "20px 24px", marginBottom: 22,
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.10)"
          : "0 2px 10px rgba(0,0,0,0.05)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", fontFamily: "'Poppins', sans-serif" }}>Overall Savings Progress</span>
        </div>
        <span style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
          ₹{totalSaved.toLocaleString()} <span style={{ color: "#94a3b8", fontWeight: 400 }}>/ ₹{totalTarget.toLocaleString()}</span>
        </span>
      </div>
      <div style={{ height: 10, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%", width: `${overallPct}%`,
          background: "linear-gradient(90deg,#7c3aed,#0ea5e9)",
          borderRadius: 99, transition: "width 1s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
          {overallPct < 100 ? `${100 - overallPct}% remaining to reach all goals` : "All goals complete!"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}>{overallPct}%</div>
      </div>
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e8eaf0",
      borderRadius: 20, padding: "60px 24px", textAlign: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "#f5f3ff", border: "1.5px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6, fontFamily: "'Poppins', sans-serif" }}>No goals yet</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24, fontFamily: "'Inter', sans-serif", maxWidth: 320, margin: "0 auto 24px" }}>
        Set your first saving goal — Headphones, Trip, Gaming gear, anything you're saving for!
      </div>
      <button onClick={onNew} style={{
        background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none", color: "#fff",
        borderRadius: 10, padding: "11px 26px", cursor: "pointer",
        fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
        display: "inline-flex", alignItems: "center", gap: 7,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create First Goal
      </button>
    </div>
  );
}